import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Storage bucket name
export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'files';

// Check if we have the minimum required configuration
const hasMinimumConfig = supabaseUrl && (supabaseAnonKey || supabaseServiceKey);

// Create Supabase admin client (for server-side operations)
export const supabaseAdmin: SupabaseClient | null = hasMinimumConfig && supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { 
        autoRefreshToken: false, 
        persistSession: false 
      },
    })
  : null;

// Create Supabase client (for client-side operations)
export const supabase: SupabaseClient | null = hasMinimumConfig && supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : null;

// Helper to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return !!supabaseAdmin;
}

// Helper to get configuration status for debugging
export function getSupabaseConfigStatus() {
  return {
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    hasServiceKey: !!supabaseServiceKey,
    hasBucket: !!process.env.SUPABASE_STORAGE_BUCKET,
    isConfigured: isSupabaseConfigured(),
  };
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadFileToSupabase(
  filePath: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<string> {
  if (!supabaseAdmin) throw new Error('Supabase not configured: missing NEXT_PUBLIC_SUPABASE_URL');
  
  // Log for debugging
  console.log('Uploading to bucket:', STORAGE_BUCKET);
  console.log('File path:', filePath);
  console.log('Content type:', contentType);
  
  const { data, error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, fileBuffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    console.error('Supabase upload error:', error);
    throw new Error(`Failed to upload to Supabase Storage: ${error.message} (Bucket: ${STORAGE_BUCKET})`);
  }

  // Get public URL
  const { data: urlData } = supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

/**
 * Get signed URL for file download
 */
export async function getSignedUrlFromSupabase(
  filePath: string,
  expiresIn: number = 3600
): Promise<string> {
  if (!supabaseAdmin) throw new Error('Supabase not configured: missing NEXT_PUBLIC_SUPABASE_URL');
  const { data, error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFileFromSupabase(filePath: string): Promise<void> {
  if (!supabaseAdmin) throw new Error('Supabase not configured: missing NEXT_PUBLIC_SUPABASE_URL');
  const { error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .remove([filePath]);

  if (error) {
    throw new Error(`Failed to delete from Supabase Storage: ${error.message}`);
  }
}

/**
 * Check if file exists in Supabase Storage
 */
export async function fileExistsInSupabase(filePath: string): Promise<boolean> {
  if (!supabaseAdmin) throw new Error('Supabase not configured: missing NEXT_PUBLIC_SUPABASE_URL');
  const { data, error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .list(filePath.split('/').slice(0, -1).join('/'), {
      search: filePath.split('/').pop(),
    });

  return !error && data && data.length > 0;
}
