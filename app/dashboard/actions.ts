import { createClient } from '@/utils/supabase/server';

export interface DashboardStats {
  totalCVs: number;
  remainingUploads: number;
  processedCVs: number;
  totalTags: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  
  // Get CV count
  const { count } = await supabase
    .from('cvs')
    .select('*', { count: 'exact', head: true });
    
  // Get processed CVs count
  const { count: processedCount } = await supabase
    .from('cvs')
    .select('*', { count: 'exact', head: true })
    .eq('processed', true);
    
  // Get unique tags count
  const { data: cvs } = await supabase
    .from('cvs')
    .select('tags');
    
  const uniqueTags = new Set<string>();
  cvs?.forEach(cv => {
    cv.tags?.forEach((tag: string) => uniqueTags.add(tag));
  });
  
  return {
    totalCVs: count || 0,
    remainingUploads: 30 - (count || 0), // Assuming 30 is the limit
    processedCVs: processedCount || 0,
    totalTags: uniqueTags.size
  };
}

export async function getRecentCVs(limit: number = 5) {
  const supabase = await createClient();
  
  const { data: cvs, error } = await supabase
    .from('cvs')
    .select(`
      *,
      profiles(*)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);
    
  if (error) throw error;
  return cvs;
} 