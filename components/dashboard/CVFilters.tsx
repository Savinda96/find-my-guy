// components/dashboard/CVFilters.tsx
'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface Filters {
  q: string;
  tag: string;
  skill: string;
  experience: string;
  sort: string;
}

interface CVFiltersProps {
  currentFilters: Filters;
}

export default function CVFilters({ currentFilters }: CVFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState<Filters>({
    q: currentFilters.q || '',
    tag: currentFilters.tag || '',
    skill: currentFilters.skill || '',
    experience: currentFilters.experience || '',
    sort: currentFilters.sort || 'newest',
  });

  const experienceOptions: FilterOption[] = [
    { value: 'any', label: 'Any experience' },
    { value: '0-1', label: '0-1 years' },
    { value: '1-3', label: '1-3 years' },
    { value: '3-5', label: '3-5 years' },
    { value: '5-7', label: '5-7 years' },
    { value: '7-10', label: '7-10 years' },
    { value: '10', label: '10+ years' },
  ];

  const sortOptions: FilterOption[] = [
    { value: 'newest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
    { value: 'name_az', label: 'Name (A-Z)' },
    { value: 'name_za', label: 'Name (Z-A)' },
  ];

  const handleChange = (name: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'any') {
        queryParams.set(key, value);
      }
    });
    
    router.push(`${pathname}?${queryParams.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      q: '',
      tag: '',
      skill: '',
      experience: '',
      sort: 'newest',
    });
    
    router.push(pathname);
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value !== 'newest');

  return (
    <div className="space-y-4">
      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-md mb-4">
          <div className="flex items-center mr-2">
            <span className="text-sm font-medium text-gray-700">Active filters:</span>
          </div>
          
          {filters.q && (
            <div className="bg-white border rounded-full px-3 py-1 text-sm flex items-center">
              <span className="mr-1 text-gray-500">Search:</span>
              <span className="font-medium">{filters.q}</span>
              <button 
                onClick={() => handleChange('q', '')}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {filters.tag && (
            <div className="bg-white border rounded-full px-3 py-1 text-sm flex items-center">
              <span className="mr-1 text-gray-500">Tag:</span>
              <span className="font-medium">{filters.tag}</span>
              <button 
                onClick={() => handleChange('tag', '')}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {filters.skill && (
            <div className="bg-white border rounded-full px-3 py-1 text-sm flex items-center">
              <span className="mr-1 text-gray-500">Skill:</span>
              <span className="font-medium">{filters.skill}</span>
              <button 
                onClick={() => handleChange('skill', '')}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          {filters.experience && (
            <div className="bg-white border rounded-full px-3 py-1 text-sm flex items-center">
              <span className="mr-1 text-gray-500">Experience:</span>
              <span className="font-medium">
                {experienceOptions.find(opt => opt.value === filters.experience)?.label || filters.experience}
              </span>
              <button 
                onClick={() => handleChange('experience', '')}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-sm"
          >
            Clear all
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search-query">Search</Label>
          <Input
            id="search-query"
            placeholder="Name, skills, or keyword..."
            value={filters.q}
            onChange={(e) => handleChange('q', e.target.value)}
          />
        </div>
        
        {/* Tag */}
        <div className="space-y-2">
          <Label htmlFor="tag-filter">Tag</Label>
          <Input
            id="tag-filter"
            placeholder="Filter by tag"
            value={filters.tag}
            onChange={(e) => handleChange('tag', e.target.value)}
          />
        </div>
        
        {/* Skill */}
        <div className="space-y-2">
          <Label htmlFor="skill-filter">Skill</Label>
          <Input
            id="skill-filter"
            placeholder="Filter by skill"
            value={filters.skill}
            onChange={(e) => handleChange('skill', e.target.value)}
          />
        </div>
        
        {/* Experience */}
        <div className="space-y-2">
          <Label htmlFor="experience-filter">Experience</Label>
          <Select
            value={filters.experience}
            onValueChange={(value) => handleChange('experience', value)}
          >
            <SelectTrigger id="experience-filter">
              <SelectValue placeholder="Any experience" />
            </SelectTrigger>
            <SelectContent>
              {experienceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-center justify-between border-t pt-4 mt-4">
        <div className="space-y-2 flex items-center">
          <Label htmlFor="sort-options" className="mr-2">Sort by:</Label>
          <Select
            value={filters.sort}
            onValueChange={(value) => handleChange('sort', value)}
          >
            <SelectTrigger id="sort-options" className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={applyFilters}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
}