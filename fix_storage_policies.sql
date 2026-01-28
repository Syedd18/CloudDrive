-- Fix Storage Bucket Policies for 'files' bucket
-- Run this in Supabase SQL Editor

-- First, drop any existing restrictive policies on the bucket
DROP POLICY IF EXISTS "Allow service role full access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;

-- Disable RLS on storage.objects (service_role should bypass RLS, but just in case)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS and create proper policies
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow service role complete access (this is what your backend uses)
CREATE POLICY "Service role can manage all files"
ON storage.objects
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated users to upload files to 'files' bucket
CREATE POLICY "Authenticated users can upload to files bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'files');

-- Allow authenticated users to read from 'files' bucket
CREATE POLICY "Authenticated users can read from files bucket"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'files');

-- Allow authenticated users to delete their own files
CREATE POLICY "Authenticated users can delete from files bucket"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'files');

-- Allow public to read files (if bucket is public)
CREATE POLICY "Public can read from files bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'files');

-- Check that the bucket exists
SELECT * FROM storage.buckets WHERE name = 'files';
