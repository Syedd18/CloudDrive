import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only initialize Supabase clients if a URL is provided. This prevents build-time
// errors when environment variables are not set (e.g., during static builds).
export const supabaseAdmin: SupabaseClient | null = supabaseUrl
  ? createClient(supabaseUrl, supabaseServiceKey ?? supabaseAnonKey ?? '', {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

export const supabase: SupabaseClient | null = supabaseUrl
  ? createClient(supabaseUrl, supabaseAnonKey ?? '')
  : null;

// Storage bucket name
export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'files';

/**
 * Upload file to Supabase Storage
 */
export async function uploadFileToSupabase(
  filePath: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<string> {
  if (!supabaseAdmin) throw new Error('Supabase not configured: missing NEXT_PUBLIC_SUPABASE_URL');
  const { data, error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, fileBuffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload to Supabase Storage: ${error.message}`);
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
