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
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  
  // Start building query
  let query = supabase.from('cvs').select(`
    id,
    file_name,
    file_path,
    upload_date,
    processed_date,
    parsing_status,
    user_profiles(id, summary, skills_overview, career_highlights),
    experiences(company_name, job_title, start_date, end_date, description, current_job),
    technologies(name, category, proficiency_level),
    profile_tags(tag_name, relevance_score)
  `).eq('user_id', user.id);
  
  // Apply text search if provided
  if (filters.q) {
    const searchTerm = `%${filters.q}%`;
    query = query.or(
      `file_name.ilike.${searchTerm},` + 
      `original_text.ilike.${searchTerm}`
    );
  }
  
  // Apply tag filter
  if (filters.tag) {
    const { data: tagCVs } = await supabase
      .from('profile_tags')
      .select('cv_id')
      .eq('tag_name', filters.tag);
    query = query.in('id', tagCVs?.map(t => t.cv_id) || []);
  }
  
  // Apply skill/technology filter
  if (filters.skill) {
    const { data: skillCVs } = await supabase
      .from('technologies')
      .select('cv_id')
      .eq('name', filters.skill);
    query = query.in('id', skillCVs?.map(s => s.cv_id) || []);
  }
  
  // Apply experience filter
  if (filters.experience) {
    const [min, max] = filters.experience.split('-').map(Number);
    
    if (min && max) {
      const { data: expCVs } = await supabase
        .from('experiences')
        .select('cv_id')
        .gte('end_date', `now() - interval '${min} years'`)
        .lte('start_date', `now() - interval '${max} years'`);
      query = query.in('id', expCVs?.map(e => e.cv_id) || []);
    } else if (min) {
      const { data: expCVs } = await supabase
        .from('experiences')
        .select('cv_id')
        .lte('start_date', `now() - interval '${min} years'`);
      query = query.in('id', expCVs?.map(e => e.cv_id) || []);
    }
  }
  
  // Apply sorting
  if (filters.sort === 'newest') {
    query = query.order('upload_date', { ascending: false });
  } else if (filters.sort === 'oldest') {
    query = query.order('upload_date', { ascending: true });
  } else if (filters.sort === 'name_az') {
    query = query.order('file_name', { ascending: true });
  } else if (filters.sort === 'name_za') {
    query = query.order('file_name', { ascending: false });
  }
  
  const { data: cvs, error } = await query;
  
  if (error) throw error;
  return cvs;
}

export async function getCVCount() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  
  const { count } = await supabase
    .from('cvs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);
    
  return count || 0;
}

export async function getAvailableFilters() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  
  // Get tags for user's CVs
  const { data: cvIds } = await supabase
    .from('cvs')
    .select('id')
    .eq('user_id', user.id);
    
  const { data: tags } = await supabase
    .from('profile_tags')
    .select('tag_name')
    .in('cv_id', cvIds?.map(cv => cv.id) || [])
    .order('tag_name');
    
  // Get technologies/skills
  const { data: skills } = await supabase
    .from('technologies')
    .select('name')
    .in('cv_id', cvIds?.map(cv => cv.id) || [])
    .order('name');
    
  // Extract unique values
  const uniqueTags = Array.from(new Set(tags?.map(t => t.tag_name) || []));
  const uniqueSkills = Array.from(new Set(skills?.map(s => s.name) || []));
  
  return {
    skills: uniqueSkills,
    tags: uniqueTags
  };
}