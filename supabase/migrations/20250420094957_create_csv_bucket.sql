-- Migration: Create storage bucket for CV uploads
-- Description: Creates the cv-uploads bucket and configures appropriate policies

BEGIN;

-- Create the cv-uploads bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES (
  'cv-uploads',
  'cv-uploads',
  false -- not public
)
ON CONFLICT (id) DO NOTHING;

-- Add allowed MIME types without size restriction
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'application/pdf', 
  'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]::text[]
WHERE id = 'cv-uploads';

-- Enable RLS on the bucket
UPDATE storage.buckets
SET owner = NULL, -- Setting owner to NULL enables RLS
    public = false
WHERE id = 'cv-uploads';

-- Make sure RLS is enabled on the objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DO $$ 
BEGIN
  -- Drop policies safely with exception handling
  BEGIN
    DROP POLICY IF EXISTS "storage_upload_own_cvs" ON storage.objects;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or can't be dropped, continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "storage_select_own_cvs" ON storage.objects;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or can't be dropped, continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "storage_update_own_cvs" ON storage.objects;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or can't be dropped, continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "storage_delete_own_cvs" ON storage.objects;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or can't be dropped, continue
  END;
END $$;

-- Create storage policies for cv-uploads bucket
-- 1. Upload policy - only authenticated users can upload to their own folder
CREATE POLICY "storage_upload_own_cvs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'cv-uploads'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 2. Select policy - users can only access their own files
CREATE POLICY "storage_select_own_cvs"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'cv-uploads'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Update policy - users can only update their own files
CREATE POLICY "storage_update_own_cvs"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'cv-uploads'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. Delete policy - users can only delete their own files
CREATE POLICY "storage_delete_own_cvs"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'cv-uploads'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

COMMIT;