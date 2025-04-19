// app/dashboard/page.tsx
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import DashboardStats from '@/components/dashboard/DashboardStats';
import RecentUploads from '@/components/dashboard/RecentUploads';
import UploadCTA from '@/components/dashboard/UploadCTA';
import SearchBar from '@/components/dashboard/SearchBar';

interface CV {
  id: string;
  name: string;
  file_path: string;
  public_url: string;
  processed: boolean;
  processed_at: string | null;
  tags: string[] | null;
  created_at: string;
  file_size: number;
  user_id: string;
}

interface Stats {
  totalCVs: number;
  remainingUploads: number;
  processedCVs: number;
  totalTags: number;
}

export default async function Dashboard() {
  const cookieStore = cookies();
  const supabase = await createClient();

  // Fetch dashboard data
  const { data: recentCVs } = await supabase
    .from('cvs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  // Get CV count
  const { count } = await supabase
    .from('cvs')
    .select('*', { count: 'exact', head: true });

  const stats: Stats = {
    totalCVs: count || 0,
    remainingUploads: 30 - (count || 0),
    processedCVs: count || 0, // Assumes all are processed
    totalTags: 0 // This would need a separate query to count unique tags
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <SearchBar />
      </div>
      
      <DashboardStats stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentUploads cvs={(recentCVs || []).map(cv => ({ ...cv, tags: cv.tags || undefined }))} />
        </div>
        <div>
          <UploadCTA remainingUploads={stats.remainingUploads} />
        </div>
      </div>
    </div>
  );
}