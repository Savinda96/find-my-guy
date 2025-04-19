// app/dashboard/upload/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const supabase = createClient();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please upload a PDF file');
        setFile(null);
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError(null);
    
    try {
      // Check remaining quota
      const { count, error: quotaError } = await supabase
        .from('cvs')
        .select('*', { count: 'exact', head: true });
        
      if (quotaError) throw quotaError;
      
      if ((count || 0) >= 30) {
        throw new Error('You have reached your upload limit of 30 CVs');
      }

      // Upload file to storage
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `cvs/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('cv-uploads')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('cv-uploads')
        .getPublicUrl(filePath);
        
      const publicUrl = urlData.publicUrl;
      
      // Create database entry
      const { error: dbError } = await supabase
        .from('cvs')
        .insert({
          name: file.name,
          file_path: filePath,
          public_url: publicUrl,
          processed: false,
          file_size: file.size,
        });
        
      if (dbError) throw dbError;
      
      // Set success
      setSuccess(true);
      
      // Trigger backend processing (this would be done via a webhook or function)
      // For now, we'll just simulate a delay
      setTimeout(() => {
        router.refresh();
        router.push('/dashboard/cvs');
      }, 2000);
      
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during upload');
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-8">Upload CV</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Upload a new CV</CardTitle>
          <CardDescription>
            Upload a PDF file containing a CV to extract experience, skills, and other information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success ? (
            <div className="text-center py-10">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Upload Successful!</h3>
              <p className="mt-2 text-sm text-gray-500">
                Your CV is being processed. This may take a few minutes.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="cv-upload">CV File (PDF only)</Label>
                <Input
                  id="cv-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
                <p className="text-sm text-gray-500">Max file size: 5MB</p>
              </div>
              
              {file && (
                <div className="flex items-center space-x-2 text-sm border rounded-md p-3 bg-gray-50">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <span className="font-medium truncate">{file.name}</span>
                  <span className="text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              )}
              
              <div className="border rounded-md p-4 bg-blue-50 text-blue-800 space-y-2">
                <h4 className="font-medium">What happens after upload?</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Your CV will be automatically processed by our AI</li>
                  <li>We'll extract experience, skills, projects, and technology stack</li>
                  <li>Tags will be generated to help with searching and filtering</li>
                  <li>A complete profile will be generated for each candidate</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
        {!success && (
          <CardFooter className="flex justify-end">
            <Button 
              onClick={handleUpload} 
              disabled={!file || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload CV
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}