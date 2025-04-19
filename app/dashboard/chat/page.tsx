// app/dashboard/chat/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import {
  Send,
  User,
  Bot,
  RefreshCw,
  Download,
  Filter,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Loader2
} from 'lucide-react';
import { Database } from '@/types/supabase';

interface CV {
  id: string;
  name: string;
  tags: string[] | null;
  profiles?: {
    id: string;
    skills: string[] | null;
  } | null;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  error?: boolean;
}

interface FilterState {
  skills: string[];
  experience: string;
  tags: string[];
}

interface AvailableFilters {
  skills: string[];
  tags: string[];
}

interface ModelResponse {
  response: string;
}

// Mock function to simulate API call to your Model Context Protocol
const queryModelContext = async (query: string, context: any): Promise<ModelResponse> => {
  // In a real app, this would be an API call to your backend
  // which would then query the model with the context
  console.log('Querying model with:', query);
  console.log('Context:', context);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // For demo purposes, we'll return a mock response
  if (query.toLowerCase().includes('frontend')) {
    return {
      response: "Based on the CVs in your database, I found 3 candidates with strong frontend skills:\n\n1. **Sarah Johnson** - 5 years of experience with React, Next.js, and modern frontend frameworks. Previously worked at Google and has experience with large-scale applications.\n\n2. **Michael Chen** - 3 years of experience specializing in UI/UX and responsive design. Strong portfolio of React and Vue.js projects.\n\n3. **Priya Patel** - 4 years of experience with focus on accessibility and performance optimization in frontend applications. Expert in TypeScript and state management solutions."
    };
  } else if (query.toLowerCase().includes('backend')) {
    return {
      response: "I found 2 candidates with strong backend development skills:\n\n1. **James Wilson** - 6 years of experience building scalable backend systems using Node.js, Python, and PostgreSQL. Has experience with microservices architecture.\n\n2. **Emma Rodriguez** - 4 years of experience with Java Spring Boot and C#/.NET. Specialized in API design and database optimization."
    };
  } else if (query.toLowerCase().includes('fullstack')) {
    return {
      response: "Looking at the CVs in your database, these candidates have strong fullstack abilities:\n\n1. **David Kim** - 7 years of experience with the MERN stack (MongoDB, Express, React, Node.js). Has built and deployed multiple production applications.\n\n2. **Sophia Martinez** - 5 years of experience with both frontend (React, Angular) and backend (Python Django, Node.js). Skilled in database design and API development."
    };
  } else {
    return {
      response: "I'm your CV assistant and can help you find candidates based on skills, experience, or other criteria. You can ask me questions like:\n\n- Who has experience with React?\n- Find candidates with over 5 years of experience\n- Which developers know both Python and JavaScript?\n- Who has worked at startup companies?\n- Find candidates with experience in machine learning\n\nI'll search through your CV database and provide relevant matches."
    };
  }
};

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "👋 Hi there! I'm your CV assistant. I can help you find candidates based on skills, experience, or other criteria. What kind of talent are you looking for today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [cvContext, setCvContext] = useState<CV[]>([]);
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>({
    skills: [],
    experience: '',
    tags: []
  });
  const [availableFilters, setAvailableFilters] = useState<AvailableFilters>({
    skills: [],
    tags: []
  });
  const supabase = createClient();
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCVData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = (): void => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchCVData = async (): Promise<void> => {
    try {
      // Fetch all CVs with their profiles
      const { data: cvs, error } = await supabase
        .from('cvs')
        .select(`
          id,
          name,
          tags,
          profiles (
            id,
            skills
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Set as context for the model
      setCvContext((cvs || []) as unknown as CV[]);

      // Extract available skills and tags for filters
      const skillsSet = new Set<string>();
      const tagsSet = new Set<string>();

      cvs?.forEach(cv => {
        // Add skills
        (cv.profiles as unknown as { id: string; skills: string[] | null }[])?.forEach(profile => {
          profile.skills?.forEach(skill => {
            skillsSet.add(skill);
          });
        });

        // Add tags
        cv.tags?.forEach((tag: string) => {
          tagsSet.add(tag);
        });
      });

      setAvailableFilters({
        skills: Array.from(skillsSet).sort(),
        tags: Array.from(tagsSet).sort()
      });

    } catch (error) {
      console.error('Error fetching CV data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load CV data. Please try again.",
      });
    }
  };

  const applyFilters = (): void => {
    // This would filter the context sent to the model
    // For now, we'll just log the filters
    console.log('Applied filters:', filters);
    setFilterOpen(false);
    
    toast({
      title: "Filters applied",
      description: "Your search context has been updated",
    });
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Call the model with context
      const result = await queryModelContext(input, cvContext);

      // Add assistant response to chat
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.response,
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error('Error querying model:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get a response. Please try again.",
      });

      // Add error message
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm sorry, I encountered an error while processing your request. Please try again.",
          error: true,
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: Date): string => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const copyMessageToClipboard = (content: string): void => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Message content copied to clipboard",
    });
  };

  return (
    <div className="h-[calc(100vh-9rem)] flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-2xl font-bold">CV Assistant</h1>
          <p className="text-gray-500">
            Chat with your CV data using the Model Context Protocol
          </p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => setFilterOpen(!filterOpen)}
          className="flex items-center"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {filterOpen ? (
            <ChevronUp className="h-4 w-4 ml-2" />
          ) : (
            <ChevronDown className="h-4 w-4 ml-2" />
          )}
        </Button>
      </div>
      
      {filterOpen && (
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle>Search Filters</CardTitle>
            <CardDescription>
              Narrow down the CV context for more relevant responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Skills</label>
                <Select 
                  value={filters.skills[0] || ''}
                  onValueChange={(value) => setFilters({...filters, skills: [value]})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a skill" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any skill</SelectItem>
                    {availableFilters.skills.map(skill => (
                      <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Experience</label>
                <Select 
                  value={filters.experience}
                  onValueChange={(value) => setFilters({...filters, experience: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Years of experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any experience</SelectItem>
                    <SelectItem value="0-1">0-1 years</SelectItem>
                    <SelectItem value="1-3">1-3 years</SelectItem>
                    <SelectItem value="3-5">3-5 years</SelectItem>
                    <SelectItem value="5-7">5-7 years</SelectItem>
                    <SelectItem value="7-10">7-10 years</SelectItem>
                    <SelectItem value="10+">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <Select 
                  value={filters.tags[0] || ''}
                  onValueChange={(value) => setFilters({...filters, tags: [value]})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any tag</SelectItem>
                    {availableFilters.tags.map(tag => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <Button variant="outline" onClick={() => {
              setFilters({ skills: [], experience: '', tags: [] });
            }}>
              Reset Filters
            </Button>
            <Button onClick={applyFilters}>Apply Filters</Button>
          </CardFooter>
        </Card>
      )}
      
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 ${message.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                  <Avatar>
                    <AvatarFallback className={message.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}>
                      {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div>
                  <div
                    className={`rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : message.error
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                  
                  <div className={`mt-1 text-xs text-gray-500 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <span>{formatTimestamp(message.timestamp)}</span>
                    
                    {message.role === 'assistant' && (
                      <div className="flex items-center ml-2">
                        <button
                          onClick={() => copyMessageToClipboard(message.content)}
                          className="text-gray-500 hover:text-gray-700 p-1"
                          title="Copy to clipboard"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                        <button className="text-gray-500 hover:text-gray-700 p-1" title="Helpful">
                          <ThumbsUp className="h-3 w-3" />
                        </button>
                        <button className="text-gray-500 hover:text-gray-700 p-1" title="Not helpful">
                          <ThumbsDown className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex">
              <div className="flex max-w-[80%]">
                <div className="flex-shrink-0 mr-3">
                  <Avatar>
                    <AvatarFallback className="bg-green-100 text-green-600">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[300px]" />
                </div>
              </div>
            </div>
          )}
          
          <div ref={endOfMessagesRef} />
        </CardContent>
        
        <CardFooter className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex w-full space-x-2">
            <Textarea
              placeholder="Ask about candidates, skills, experience..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 min-h-[50px] max-h-[200px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={loading}
            />
            <Button type="submit" disabled={!input.trim() || loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Chat;
