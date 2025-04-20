'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { uploadCVs } from '@/app/dashboard/upload/actions';
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

interface UploadFormProps {
  remainingUploads: number;
}

export default function UploadForm({ remainingUploads }: UploadFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<boolean>(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (selectedFiles.length > 5) {
      setErrors(['You can only upload a maximum of 5 CVs at a time']);
      setFiles([]);
      return;
    }
    
    if (selectedFiles.length > remainingUploads) {
      setErrors([`You can only upload ${remainingUploads} more CV(s)`]);
      setFiles([]);
      return;
    }
    
    const invalidFiles = selectedFiles.filter(file => 
      file.type !== 'application/pdf' || file.size > 5 * 1024 * 1024
    );
    
    if (invalidFiles.length > 0) {
      setErrors(invalidFiles.map(file => 
        `${file.name}: ${file.type !== 'application/pdf' ? 'Only PDF files are allowed' : 'File size must be less than 5MB'}`
      ));
      setFiles([]);
      return;
    }
    
    setFiles(selectedFiles);
    setErrors([]);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setErrors(['Please select at least one file to upload']);
      return;
    }

    setUploading(true);
    setErrors([]);
    
    try {
      const results = await uploadCVs(files);
      
      const failedUploads = results.filter(result => !result.success);
      if (failedUploads.length > 0) {
        setErrors(failedUploads.map(result => result.error || 'Upload failed'));
        setUploading(false);
        return;
      }
      
      setSuccess(true);
      
      // Trigger backend processing
      setTimeout(() => {
        router.refresh();
        router.push('/dashboard/cvs');
      }, 2000);
      
    } catch (error) {
      console.error('Upload error:', error);
      setErrors([error instanceof Error ? error.message : 'An error occurred during upload']);
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload CVs</CardTitle>
        <CardDescription>
          Upload up to 5 PDF CVs at once. Each file must be less than 5MB.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {errors.length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        {success ? (
          <div className="text-center py-10">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Upload Successful!</h3>
            <p className="mt-2 text-sm text-gray-500">
              Your CVs are being processed. This may take a few minutes.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="cv-upload">CV Files (PDF only)</Label>
              <Input
                id="cv-upload"
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileChange}
                disabled={uploading}
              />
              <p className="text-sm text-gray-500">
                Max 5 files, each under 5MB
              </p>
            </div>
            
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm border rounded-md p-3 bg-gray-50">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <span className="font-medium truncate">{file.name}</span>
                    <span className="text-gray-500">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="border rounded-md p-4 bg-blue-50 text-blue-800 space-y-2">
              <h4 className="font-medium">What happens after upload?</h4>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Your CVs will be automatically processed by our AI</li>
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
            disabled={files.length === 0 || uploading || remainingUploads <= 0}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload CVs
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
} 