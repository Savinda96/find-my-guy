-- Migration 1: Create base tables for FindMyGuy CV Management System
-- Description: Sets up all tables for CV management with appropriate constraints and foreign keys

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  cv_count INTEGER DEFAULT 0 NOT NULL,
  max_cv_limit INTEGER DEFAULT 30 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  CONSTRAINT cv_count_not_exceed_limit CHECK (cv_count <= max_cv_limit)
);

-- CV table (main table for uploaded CVs)
CREATE TABLE cvs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  original_text TEXT,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  processed_date TIMESTAMP WITH TIME ZONE,
  parsing_status TEXT DEFAULT 'pending' CHECK (parsing_status IN ('pending', 'processing', 'completed', 'failed')),
  
  CONSTRAINT unique_file_per_user UNIQUE (user_id, file_name)
);

-- Experience table (for work experience)
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cv_id UUID NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  description TEXT,
  current_job BOOLEAN DEFAULT FALSE,
  
  CONSTRAINT valid_date_range CHECK (end_date IS NULL OR start_date <= end_date)
);

-- Projects table (for projects worked on)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cv_id UUID NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  role TEXT,
  
  CONSTRAINT valid_project_date_range CHECK (end_date IS NULL OR start_date <= end_date)
);

-- Technologies table (for tech stack)
CREATE TABLE technologies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cv_id UUID NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
  
  CONSTRAINT unique_tech_per_cv UNIQUE (cv_id, name)
);

-- URLs table (for useful links from CV)
CREATE TABLE urls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cv_id UUID NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type TEXT CHECK (type IN ('linkedin', 'github', 'portfolio', 'other')),
  title TEXT,
  
  CONSTRAINT unique_url_per_cv UNIQUE (cv_id, url)
);

-- Profile Tags table (for auto-generated tags)
CREATE TABLE profile_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cv_id UUID NOT NULL REFERENCES cvs(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  relevance_score FLOAT CHECK (relevance_score BETWEEN 0 AND 1),
  
  CONSTRAINT unique_tag_per_cv UNIQUE (cv_id, tag_name)
);

-- User Profile table (for generated profiles)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cv_id UUID NOT NULL UNIQUE REFERENCES cvs(id) ON DELETE CASCADE,
  summary TEXT,
  skills_overview TEXT,
  career_highlights TEXT,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create function to update user's CV count
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
    SET cv_count = cv_count - 1, 
        updated_at = NOW() 
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating CV count
CREATE TRIGGER cv_count_trigger
AFTER INSERT OR DELETE ON cvs
FOR EACH ROW
EXECUTE FUNCTION update_user_cv_count();

-- Create indexes for performance
CREATE INDEX idx_cvs_user_id ON cvs(user_id);
CREATE INDEX idx_experiences_cv_id ON experiences(cv_id);
CREATE INDEX idx_projects_cv_id ON projects(cv_id);
CREATE INDEX idx_technologies_cv_id ON technologies(cv_id);
CREATE INDEX idx_urls_cv_id ON urls(cv_id);
CREATE INDEX idx_profile_tags_cv_id ON profile_tags(cv_id);
CREATE INDEX idx_profile_tags_name ON profile_tags(tag_name);
CREATE INDEX idx_technologies_name ON technologies(name);

-- Create RLS (Row Level Security) policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- User table policies
CREATE POLICY user_select_own ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY user_update_own ON users
  FOR UPDATE USING (auth.uid() = id);

-- CV table policies
CREATE POLICY cv_insert_own ON cvs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY cv_select_own ON cvs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY cv_update_own ON cvs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY cv_delete_own ON cvs
  FOR DELETE USING (auth.uid() = user_id);

-- Create general policy for related tables to allow access only to owners of the CV
-- For experiences table
CREATE POLICY experience_all_own ON experiences
  USING (EXISTS (SELECT 1 FROM cvs WHERE cvs.id = experiences.cv_id AND cvs.user_id = auth.uid()));

-- For projects table
CREATE POLICY project_all_own ON projects
  USING (EXISTS (SELECT 1 FROM cvs WHERE cvs.id = projects.cv_id AND cvs.user_id = auth.uid()));

-- For technologies table
CREATE POLICY technology_all_own ON technologies
  USING (EXISTS (SELECT 1 FROM cvs WHERE cvs.id = technologies.cv_id AND cvs.user_id = auth.uid()));

-- For urls table
CREATE POLICY url_all_own ON urls
  USING (EXISTS (SELECT 1 FROM cvs WHERE cvs.id = urls.cv_id AND cvs.user_id = auth.uid()));

-- For profile_tags table
CREATE POLICY profile_tag_all_own ON profile_tags
  USING (EXISTS (SELECT 1 FROM cvs WHERE cvs.id = profile_tags.cv_id AND cvs.user_id = auth.uid()));

-- For user_profiles table
CREATE POLICY user_profile_all_own ON user_profiles
  USING (EXISTS (SELECT 1 FROM cvs WHERE cvs.id = user_profiles.cv_id AND cvs.user_id = auth.uid())); 