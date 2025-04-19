# FindMyGuy - CV Management System

## Project Overview

FindMyGuy is a powerful CV management system built with Next.js and Supabase. It allows users to upload and process CVs, extract valuable information, generate tags, and interact with the data using a Model Context Protocol for intelligent search and filtering.

## Key Features

- **User Authentication**: Secure signup and login using Supabase Auth
- **CV Upload and Processing**: Upload up to 30 CVs with automatic AI-powered processing
- **Profile Generation**: Extract experience, projects, technology stack, and skills from CVs
- **Tagging System**: Auto-generate and manage tags for easier CV organization
- **Intelligent Search**: Search across all CV data with powerful filtering options
- **Chat Interface**: Interact with CV data using natural language through Model Context Protocol


## Database Schema (Supabase)

### Tables

#### users (managed by Supabase Auth)
- id (UUID, primary key)
- email (string)
- created_at (timestamp)
- last_sign_in_at (timestamp)
- user_metadata (JSON)

#### profiles
- id (UUID, primary key)
- user_id (UUID, foreign key to users.id)
- full_name (string)
- company (string)
- job_title (string)
- phone (string)
- updated_at (timestamp)

#### cvs
- id (UUID, primary key)
- user_id (UUID, foreign key to users.id)
- name (string) - Original filename
- file_path (string) - Storage path
- public_url (string) - Public URL to access the file
- processed (boolean) - Processing status
- processed_at (timestamp)
- tags (string[]) - Array of tags
- created_at (timestamp)
- file_size (number)

#### cv_profiles
- id (UUID, primary key)
- cv_id (UUID, foreign key to cvs.id)
- full_name (string)
- email (string)
- phone (string)
- title (string) - Job title
- location (string)
- summary (text)
- highlights (string[])
- years_experience (number)
- linkedin (string)
- skills (string[])
- experience (JSON[]) - Array of work experiences
- education (JSON[]) - Array of education history
- projects (JSON[]) - Array of projects
- tech_stack (JSON) - Technology stack categorized
- urls (JSON[]) - Array of relevant URLs
- created_at (timestamp)
- updated_at (timestamp)

## Storage Buckets (Supabase)

- cv-uploads: Stores the uploaded CV files

## API Integration

The application connects to an AI model through the Model Context Protocol for:
- CV text extraction and processing
- Profile generation
- Skills and technology stack identification
- Tag generation
- Natural language querying of CV data

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up Supabase project and configure environment variables
4. Run development server with `npm run dev`
5. Visit `http://localhost:3000` to use the application

## Environment Variables

Required environment variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- MODEL_API_KEY (for the AI model integration)