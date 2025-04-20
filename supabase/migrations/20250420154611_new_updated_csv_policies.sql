-- Migration 2: Update CV schema for bulk upload support and proper file ownership
-- Description: Updates existing tables and adds new policies for better file management

BEGIN;

-- Add file_size column to cvs table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'cvs' 
    AND column_name = 'file_size'
  ) THEN
    ALTER TABLE cvs ADD COLUMN file_size INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE cvs ADD CONSTRAINT positive_file_size CHECK (file_size >= 0);
  END IF;
END $$;

-- Add public_url column to cvs table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'cvs' 
    AND column_name = 'public_url'
  ) THEN
    -- Make it nullable initially, can be updated later when URLs are generated
    ALTER TABLE cvs ADD COLUMN public_url TEXT;
  END IF;
END $$;

-- Add index for better query performance if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE indexname = 'idx_cvs_parsing_status'
  ) THEN
    CREATE INDEX idx_cvs_parsing_status ON cvs(parsing_status);
  END IF;
END $$;

-- Improve the update_user_cv_count function to prevent negative counts
CREATE OR REPLACE FUNCTION update_user_cv_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE users 
    SET cv_count = cv_count + 1,
        updated_at = NOW()
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE users 
    SET cv_count = GREATEST(0, cv_count - 1),
        updated_at = NOW()
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a file validation function to use before upload
CREATE OR REPLACE FUNCTION validate_cv_upload()
RETURNS TRIGGER AS $$
DECLARE
  user_cv_count INTEGER;
  user_cv_limit INTEGER;
BEGIN
  -- Get the user's current CV count and limit
  SELECT cv_count, max_cv_limit INTO user_cv_count, user_cv_limit
  FROM users WHERE id = NEW.user_id;
  
  -- Check if adding this CV would exceed the limit
  IF user_cv_count >= user_cv_limit THEN
    RAISE EXCEPTION 'CV upload limit reached (% of % CVs)', user_cv_count, user_cv_limit;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for CV upload validation if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'cv_upload_validation_trigger'
  ) THEN
    CREATE TRIGGER cv_upload_validation_trigger
    BEFORE INSERT ON cvs
    FOR EACH ROW
    EXECUTE FUNCTION validate_cv_upload();
  END IF;
END $$;

-- If needed in the future, add a field for batch uploads
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'cvs' 
    AND column_name = 'batch_id'
  ) THEN
    ALTER TABLE cvs ADD COLUMN batch_id UUID;
    CREATE INDEX idx_cvs_batch_id ON cvs(batch_id);
  END IF;
END $$;

-- Remove existing policies safely using DO block
DO $$
BEGIN
  -- Try to drop existing policies
  BEGIN
    DROP POLICY IF EXISTS "cv_select_own" ON cvs;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or can't be dropped, continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "cv_insert_own" ON cvs;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or can't be dropped, continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "cv_update_own" ON cvs;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or can't be dropped, continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "cv_delete_own" ON cvs;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or can't be dropped, continue
  END;
END $$;

-- Create new policies without the OR REPLACE
CREATE POLICY "cv_select_own" 
  ON cvs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "cv_insert_own" 
  ON cvs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cv_update_own" 
  ON cvs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cv_delete_own" 
  ON cvs FOR DELETE
  USING (auth.uid() = user_id);

COMMIT;
