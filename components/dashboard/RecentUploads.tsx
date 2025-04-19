import Link from 'next/link';
import { formatDistance } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink } from 'lucide-react';

interface CV {
  id: string;
  name: string;
  created_at: string;
  processed: boolean;
  tags?: string[];
}

interface RecentUploadsProps {
  cvs: CV[];
}

export default function RecentUploads({ cvs }: RecentUploadsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent CV Uploads</CardTitle>
          <CardDescription>
            Your latest CV uploads and their processing status
          </CardDescription>
        </div>
        <Link href="/dashboard/cvs">
          <Button variant="outline" size="sm">View All</Button>
        </Link>
      </CardHeader>
      <CardContent>
        {cvs.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-10 w-10 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No CVs yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by uploading your first CV.
            </p>
            <div className="mt-6">
              <Link href="/dashboard/upload">
                <Button>Upload a CV</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {cvs.map((cv) => (
              <div key={cv.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {cv.name || 'Unnamed CV'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {cv.created_at && formatDistance(new Date(cv.created_at), new Date(), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant={cv.processed ? "default" : "secondary"}>
                    {cv.processed ? 'Processed' : 'Processing'}
                  </Badge>
                </div>
                
                {cv.tags && cv.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {cv.tags.map((tag) => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                )}
                
                <div className="mt-4 flex justify-end">
                  <Link href={`/dashboard/cvs/${cv.id}`}>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}