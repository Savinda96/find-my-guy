// app/dashboard/page.tsx
import { createClient } from '@/utils/supabase/server';
import DashboardStats from '@/components/dashboard/DashboardStats';
import RecentUploads from '@/components/dashboard/RecentUploads';
import UploadCTA from '@/components/dashboard/UploadCTA';
import SearchBar from '@/components/dashboard/SearchBar';
import { getDashboardStats, getRecentCVs } from './actions';

export default async function Dashboard() {
  const supabase = await createClient();
  
  // Get dashboard data using actions
  const [stats, recentCVs] = await Promise.all([
    getDashboardStats(),
    getRecentCVs()
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <SearchBar />
      </div>
      
      <DashboardStats stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentUploads cvs={recentCVs || []} />
        </div>
        <div>
          <UploadCTA remainingUploads={stats.remainingUploads} />
        </div>
      </div>
    </div>
  );
}