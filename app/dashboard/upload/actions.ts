import { createClient } from '@/utils/supabase/server';

interface UserData {
  id: string;
  cv_count: number;
  max_cv_limit: number;
}

export interface UploadResult {
  success: boolean;
  error?: string;
  cvId?: string;
}

// Configurable constants
const MAX_BULK_UPLOAD = 5;
const MAX_FILE_SIZE_MB = 5;

export async function uploadCVs(files: File[]): Promise<UploadResult[]> {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return [{
      success: false,
      error: 'Authentication required'
    }];
  }
  
  // Get user's current CV count
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, cv_count, max_cv_limit')
    .eq('id', user.id)
    .single();
    
  if (userError) {
    return [{
      success: false,
      error: 'Failed to fetch user data'
    }];
  }
  
  const userInfo = userData as UserData;
  
  // Check if user has enough remaining upload slots
  const remainingSlots = userInfo.max_cv_limit - userInfo.cv_count;
  if (files.length > remainingSlots) {
    return [{
      success: false,
      error: `You can only upload ${remainingSlots} more CV(s) (maximum ${userInfo.max_cv_limit} total)`
    }];
  }
  
  // Check if files exceed the bulk upload limit
  if (files.length > MAX_BULK_UPLOAD) {
    return [{
      success: false,
      error: `You can only upload a maximum of ${MAX_BULK_UPLOAD} CVs at a time`
    }];
  }
  
  const results: UploadResult[] = [];
  
  for (const file of files) {
    try {
      // Validate file type and size
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!validTypes.includes(file.type)) {
        results.push({
          success: false,
          error: `${file.name}: Only PDF and Word documents are allowed`
        });
        continue;
      }
      
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        results.push({
          success: false,
          error: `${file.name}: File size must be less than ${MAX_FILE_SIZE_MB}MB`
        });
        continue;
      }
      
      // Upload file to storage - note the path structure matches the policy requirements
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      const filePath = `${user.id}/${fileName}`; // User ID must be the first folder component
      
      const { error: uploadError } = await supabase.storage
        .from('cv-uploads') // Use the correct bucket name
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('cv-uploads')
        .getPublicUrl(filePath);
        
      // Extract text from file (placeholder for actual implementation)
      const extractedText = "This is placeholder text for CV content extraction";
      
      // Create CV record with correct column names
      const { data: cv, error: insertError } = await supabase
        .from('cvs')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_path: filePath,
          public_url: publicUrl,
          file_size: file.size,
          original_text: extractedText,
          upload_date: new Date().toISOString(),
          parsing_status: 'pending'
        })
        .select()
        .single();
        
      if (insertError) throw insertError;
      
      results.push({
        success: true,
        cvId: cv.id
      });
      
    } catch (error) {
      results.push({
        success: false,
        error: error instanceof Error ? error.message : `Failed to upload ${file.name}`
      });
    }
  }
  
  return results;
}

export async function getRemainingUploads(): Promise<number> {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return 0;
  
  const { data: userData, error } = await supabase
    .from('users')
    .select('cv_count, max_cv_limit')
    .eq('id', user.id)
    .single();
    
  if (error) return 0;
  
  const userInfo = userData as UserData;
  return Math.max(0, userInfo.max_cv_limit - userInfo.cv_count);
}