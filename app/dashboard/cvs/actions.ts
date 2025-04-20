import { createClient } from '@/utils/supabase/server';

export interface CVFilters {
  q?: string;
  tag?: string;
  skill?: string;
  experience?: string;
  sort?: string;
}

export async function getCVs(filters: CVFilters) {
  const supabase = await createClient();
  
  let query = supabase.from('cvs').select(`
    *,
    profiles(*)
  `);
  
  // Apply search if provided
  if (filters.q) {
    query = query.or(`
      name.ilike.%${filters.q}%,
      profiles.full_name.ilike.%${filters.q}%,
      profiles.skills.cs.{${filters.q}}
    `);
  }
  
  // Apply tag filter
  if (filters.tag) {
    query = query.contains('tags', [filters.tag]);
  }
  
  // Apply skill filter
  if (filters.skill) {
    query = query.contains('profiles.skills', [filters.skill]);
  }
  
  // Apply experience filter
  if (filters.experience) {
    const [min, max] = filters.experience.split('-').map(Number);
    query = query.gte('profiles.years_experience', min);
    if (max) {
      query = query.lte('profiles.years_experience', max);
    }
  }
  
  // Apply sorting
  if (filters.sort === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else if (filters.sort === 'oldest') {
    query = query.order('created_at', { ascending: true });
  } else if (filters.sort === 'name_az') {
    query = query.order('name', { ascending: true });
  } else if (filters.sort === 'name_za') {
    query = query.order('name', { ascending: false });
  }
  
  const { data: cvs, error } = await query;
  
  if (error) throw error;
  return cvs;
}

export async function getCVCount() {
  const supabase = await createClient();
  const { count } = await supabase
    .from('cvs')
    .select('*', { count: 'exact', head: true });
  return count || 0;
}

export async function getAvailableFilters() {
  const supabase = await createClient();
  
  // Get all CVs to extract unique skills and tags
  const { data: cvs, error } = await supabase
    .from('cvs')
    .select('tags, profiles(skills)');
    
  if (error) throw error;
  
  const skillsSet = new Set<string>();
  const tagsSet = new Set<string>();
  
  cvs?.forEach(cv => {
    cv.profiles?.skills?.forEach((skill: string) => {
      skillsSet.add(skill);
    });
    cv.tags?.forEach((tag: string) => {
      tagsSet.add(tag);
    });
  });
  
  return {
    skills: Array.from(skillsSet).sort(),
    tags: Array.from(tagsSet).sort()
  };
} 