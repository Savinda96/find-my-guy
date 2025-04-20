import { createClient } from '@/utils/supabase/server';

export interface DashboardStats {
  totalCVs: number;
  remainingUploads: number;
  processedCVs: number;
  totalTags: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  
  // Get user's CV count
  const { count } = await supabase
    .from('cvs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);
    
  // Get processed CVs count
  const { count: processedCount } = await supabase
    .from('cvs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('parsing_status', 'completed');
    
  // Get unique tags count from profile_tags table
  const { data: cvIds } = await supabase
    .from('cvs')
    .select('id')
    .eq('user_id', user.id);
    
  const { data: tags } = await supabase
    .from('profile_tags')
    .select('tag_name')
    .in('cv_id', cvIds?.map(cv => cv.id) || []);
  
  const uniqueTags = new Set<string>();
  tags?.forEach(tag => uniqueTags.add(tag.tag_name));
  
  // Get user's limit
  const { data: userData } = await supabase
    .from('users')
    .select('max_cv_limit')
    .eq('id', user.id)
    .single();
  
  const maxLimit = userData?.max_cv_limit || 30;
  
  return {
    totalCVs: count || 0,
    remainingUploads: maxLimit - (count || 0),
    processedCVs: processedCount || 0,
    totalTags: uniqueTags.size
  };
}

export async function getRecentCVs(limit: number = 5) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  
  const { data: cvs, error } = await supabase
    .from('cvs')
    .select(`
      id,
      file_name,
      upload_date,
      parsing_status,
      user_profiles(summary, skills_overview)
    `)
    .eq('user_id', user.id)
    .order('upload_date', { ascending: false })
    .limit(limit);
    
  if (error) throw error;
  return cvs;
}