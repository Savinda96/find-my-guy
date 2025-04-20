// app/dashboard/upload/page.tsx
import { createClient } from '@/utils/supabase/server';
import { getRemainingUploads } from './actions';
import UploadForm from '@/components/dashboard/UploadForm';

export default async function UploadPage() {
  const remainingUploads = await getRemainingUploads();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upload CV</h1>
        <p className="text-gray-500">
          Upload a new CV to your library. You have {remainingUploads} uploads remaining.
        </p>
      </div>
      
      <UploadForm remainingUploads={remainingUploads} />
    </div>
  );
}