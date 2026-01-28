# Storage Bucket Setup Guide

## Error: "requested path is invalid"

This error means the storage bucket doesn't exist or isn't configured correctly in Supabase.

## Steps to Fix:

### 1. Create the Storage Bucket

1. Go to https://shtgjlibyggqtgaqoyqg.supabase.co
2. Click **Storage** in the left sidebar
3. Click **New Bucket** button (top right)
4. Configure the bucket:
   - **Name**: `files` (must be exactly this)
   - **Public bucket**: Toggle ON (make it public)
   - **File size limit**: 50MB or more
   - **Allowed MIME types**: Leave empty (allow all)
5. Click **Create bucket**

### 2. Set Up Storage Policies

After creating the bucket, you need to add policies so your app can upload files:

1. Click on the `files` bucket
2. Go to the **Policies** tab
3. Click **New Policy**
4. Click **For full customization**
5. Create this policy:

```sql
-- Policy name: Allow service role full access
CREATE POLICY "Allow service role full access"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'files')
WITH CHECK (bucket_id = 'files');
```

6. Click **Review** then **Save policy**

### 3. Alternative: Allow Public Access (Easier but less secure)

If you want to quickly test, you can allow all authenticated users:

1. In the `files` bucket, go to **Policies**
2. Click **New Policy** → **For full customization**
3. Create this policy:

```sql
-- Policy name: Allow authenticated uploads
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'files');

-- Policy name: Allow authenticated reads
CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'files');

-- Policy name: Allow authenticated deletes
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'files');
```

### 4. Verify the Setup

After creating the bucket and policies:

1. Restart your dev server: `npm run dev`
2. Try uploading a file
3. Check the terminal logs for any errors
4. If you still see errors, check the Supabase logs:
   - Go to **Logs** → **Storage** in your Supabase dashboard

## Quick Test

You can test if the bucket exists by running this in your browser console (after logging in):

```javascript
const { data, error } = await supabase.storage.from('files').list();
console.log('Bucket test:', { data, error });
```

If you see `error: null` and some data (even an empty array), the bucket is working!
