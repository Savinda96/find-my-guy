import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface UploadCTAProps {
  remainingUploads: number;
}

export default function UploadCTA({ remainingUploads }: UploadCTAProps) {
  const totalAllowed = 30;
  const usedUploads = totalAllowed - remainingUploads;
  const percentUsed = (usedUploads / totalAllowed) * 100;
  
  const isLow = remainingUploads < 5;

  return (
    <Card>
      <CardHeader>
        <CardTitle>CV Upload Quota</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-6">
          <Upload className="mx-auto h-12 w-12 text-blue-500" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            {remainingUploads} Uploads Remaining
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You can upload up to {totalAllowed} CVs per month
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Used {usedUploads} of {totalAllowed}</span>
            <span className={isLow ? 'text-red-500' : 'text-green-500'}>
              {remainingUploads} left
            </span>
          </div>
          <Progress value={percentUsed} className={isLow ? 'text-red-500' : ''} />
        </div>
        
        {isLow && (
          <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-3 rounded-md text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>Your upload quota is running low for this month.</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link href="/dashboard/upload" className="w-full">
          <Button className="w-full">Upload New CV</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}