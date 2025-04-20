import { createClient } from '@/utils/supabase/server';

export interface UploadResult {
  success: boolean;
  error?: string;
  cvId?: string;
}

export async function uploadCV(file: File, name: string): Promise<UploadResult> {
  const supabase = await createClient();
  
  try {
    // Upload file to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `cvs/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('cvs')
      .upload(filePath, file);
      
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('cvs')
      .getPublicUrl(filePath);
      
    // Create CV record
    const { data: cv, error: insertError } = await supabase
      .from('cvs')
      .insert({
        name,
        file_path: filePath,
        public_url: publicUrl,
        processed: false
      })
      .select()
      .single();
      
    if (insertError) throw insertError;
    
    return {
      success: true,
      cvId: cv.id
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload CV'
    };
  }
}

export async function getRemainingUploads(): Promise<number> {
  const supabase = await createClient();
  
  const { count } = await supabase
    .from('cvs')
    .select('*', { count: 'exact', head: true });
    
  return Math.max(0, 30 - (count || 0)); // Assuming 30 is the limit
} 