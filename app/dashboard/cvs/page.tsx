// app/dashboard/cvs/page.tsx
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { formatDistance } from 'date-fns';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, Eye, Search, Filter } from 'lucide-react';
import CVFilters from '@/components/dashboard/CVFilters';

interface SearchParams {
  q?: string;
  tag?: string;
  skill?: string;
  experience?: string;
  sort?: string;
}

interface PageProps {
  searchParams: SearchParams;
}

interface Profile {
  id: string;
  cv_id: string;
  full_name: string | null;
  title: string | null;
  skills: string[] | null;
  years_experience: number | null;
  experience: any[] | null;
}

interface CV {
  id: string;
  name: string;
  created_at: string;
  processed: boolean;
  public_url: string;
  tags: string[] | null;
  profiles?: Profile;
}

export default async function CVLibrary({ searchParams }: PageProps) {
  const params = await Promise.resolve(searchParams);
  const supabase = await createClient();
  
  // Parse and apply filters
  const { 
    q = '', 
    tag = '', 
    skill = '', 
    experience = '',
    sort = 'newest'
  } = params;
  
  // Build query based on filters
  let query = supabase.from('cvs').select(`
    *,
    profiles(*)
  `);
  
  // Apply search if provided
  if (q) {
    query = query.or(`
      name.ilike.%${q}%,
      profiles.full_name.ilike.%${q}%,
      profiles.skills.cs.{${q}}
    `);
  }
  
  // Apply tag filter
  if (tag) {
    query = query.contains('tags', [tag]);
  }
  
  // Apply skill filter
  if (skill) {
    query = query.contains('profiles.skills', [skill]);
  }
  
  // Apply experience filter
  if (experience) {
    const [min, max] = experience.split('-').map(Number);
    query = query.gte('profiles.years_experience', min);
    if (max) {
      query = query.lte('profiles.years_experience', max);
    }
  }
  
  // Apply sorting
  if (sort === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else if (sort === 'oldest') {
    query = query.order('created_at', { ascending: true });
  } else if (sort === 'name_az') {
    query = query.order('name', { ascending: true });
  } else if (sort === 'name_za') {
    query = query.order('name', { ascending: false });
  }
  
  // Execute query
  const { data: cvs, error } = await query;
  
  // Get count for pagination info
  const { count } = await supabase
    .from('cvs')
    .select('*', { count: 'exact', head: true });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">CV Library</h1>
          <p className="text-gray-500">Manage and search through all your uploaded CVs</p>
        </div>
        <Link href="/dashboard/upload">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload New CV
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Your CVs</CardTitle>
              <CardDescription>
                {count || 0} total CVs in your library
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <Button variant="outline" size="sm">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CVFilters 
            currentFilters={{
              q,
              tag,
              skill,
              experience,
              sort
            }}
          />
          
          {cvs && cvs.length > 0 ? (
            <div className="mt-6 space-y-4">
              {cvs.map((cv) => (
                <div key={cv.id} className="border rounded-lg p-4 hover:border-gray-400 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-lg">
                        {cv.profiles?.full_name || 'Unnamed Profile'}
                      </h3>
                      <p className="text-gray-500">
                        {cv.name} &bull; Uploaded {formatDistance(new Date(cv.created_at), new Date(), { addSuffix: true })}
                      </p>
                      
                      {cv.profiles?.title && (
                        <p className="text-gray-700 mt-1">{cv.profiles.title}</p>
                      )}
                      
                      {cv.profiles?.years_experience && (
                        <p className="text-gray-600 text-sm mt-1">
                          {cv.profiles.years_experience} years of experience
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={cv.processed ? "default" : "secondary"}>
                        {cv.processed ? 'Processed' : 'Processing'}
                      </Badge>
                      
                      <div className="flex">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={cv.public_url} target="_blank">
                            <Download className="h-4 w-4" />
                          </Link>
                        </Button>
                        
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/cvs/${cv.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Display skills */}
                  {cv.profiles?.skills && cv.profiles.skills.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-500 mb-1">Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {cv.profiles.skills.slice(0, 5).map((skill: string) => (
                          <Badge key={skill} variant="outline" className="bg-gray-50">
                            {skill}
                          </Badge>
                        ))}
                        {cv.profiles.skills.length > 5 && (
                          <Badge variant="outline" className="bg-gray-50">
                            +{cv.profiles.skills.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Display tags */}
                  {cv.tags && cv.tags.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-1">Tags:</p>
                      <div className="flex flex-wrap gap-1">
                        {cv.tags.map((tag: string) => (
                          <Link key={tag} href={`/dashboard/cvs?tag=${encodeURIComponent(tag)}`}>
                            <Badge variant="secondary" className="cursor-pointer">
                              {tag}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No CVs found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {q || tag || skill || experience
                  ? 'Try adjusting your search filters'
                  : 'Get started by uploading your first CV'}
              </p>
              <div className="mt-6">
                <Link href="/dashboard/upload">
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New CV
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}