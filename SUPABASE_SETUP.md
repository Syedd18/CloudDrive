# Supabase Setup Guide

## Step 1: Update Database Password

Replace `[YOUR-PASSWORD]` in `.env` with your actual Supabase database password:

```env
DATABASE_URL="postgresql://postgres.qbocxvwmzyqkerolzvhx:[YOUR-PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"
```

## Step 2: Create Storage Bucket in Supabase

1. Go to your Supabase Dashboard: https://qbocxvwmzyqkerolzvhx.supabase.co
2. Navigate to **Storage** in the left sidebar
3. Click **New Bucket**
4. Name it: `files`
5. Make it **Public** (so users can download their files)
6. Click **Create Bucket**

## Step 3: Run Database Migrations

```powershell
npx prisma generate
npx prisma db push
```

## Step 4: Start the Development Server

```powershell
npm run dev
```

## What's Changed:

✅ **Database**: Switched from SQLite to PostgreSQL (Supabase)
✅ **File Storage**: Switched from AWS S3 to Supabase Storage  
✅ **Authentication**: Still using JWT (can switch to Supabase Auth later)

## File Structure in Supabase Storage:

Files will be stored as: `{userId}/{uuid}.{extension}`

Example: `a1b2c3d4-e5f6/9f8e7d6c-5b4a.pdf`
