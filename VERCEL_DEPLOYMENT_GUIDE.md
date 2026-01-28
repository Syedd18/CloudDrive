# 🚀 Vercel Deployment Guide

This guide will help you deploy your Cloud Drive application to Vercel and fix the common deployment errors.

## 📋 Prerequisites

Before deploying, ensure you have:

1. ✅ A Vercel account (sign up at [vercel.com](https://vercel.com))
2. ✅ A Supabase project with:
   - PostgreSQL database configured
   - Storage bucket created (named `files` or custom name)
   - Service role key obtained
3. ✅ Git repository connected to Vercel

---

## 🔧 Step 1: Fix the Database Connection Issues

### Issue: "Can't reach database server at `db.shtgjlibyggqtgaqoyqg.supabase.co:5432`"

This error occurs when the `DATABASE_URL` environment variable is missing or incorrect.

### Solution:

#### 1.1 Get Your Supabase Database Connection Strings

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Scroll down to **Connection string** section
4. You need TWO connection strings:

   **A. Transaction Mode (for Prisma migrations):**
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.shtgjlibyggqtgaqoyqg.supabase.co:5432/postgres
   ```
   
   **B. Session Mode (for connection pooling - IMPORTANT for Vercel):**
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.shtgjlibyggqtgaqoyqg.supabase.co:6543/postgres?pgbouncer=true
   ```

5. **Replace `[YOUR-PASSWORD]`** with your actual database password

#### 1.2 Configure Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `DATABASE_URL` | `postgresql://postgres:[PASSWORD]@db.shtgjlibyggqtgaqoyqg.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1` | **Use port 6543 for connection pooling** |
| `DIRECT_URL` | `postgresql://postgres:[PASSWORD]@db.shtgjlibyggqtgaqoyqg.supabase.co:5432/postgres` | Use port 5432 for direct connection |

**⚠️ CRITICAL:** For Vercel serverless functions, you MUST use:
- Port **6543** (connection pooling) for `DATABASE_URL`
- Add `?pgbouncer=true&connection_limit=1` to the URL
- This prevents "too many connections" errors in serverless environments

---

## 🗄️ Step 2: Fix Storage API Errors

### Issue: "Failed to load resource: the server responded with a status of 401 ()"

This error occurs when Supabase storage is not properly configured.

### Solution:

#### 2.1 Create Storage Bucket

1. Go to Supabase Dashboard → **Storage**
2. Click **Create a new bucket**
3. Name it `files` (or your custom name)
4. Set it as **Public** bucket (or configure RLS policies as needed)
5. Click **Create**

#### 2.2 Get Supabase API Keys

1. Go to **Settings** → **API**
2. Copy the following keys:
   - `URL` (Project URL)
   - `anon` `public` key
   - `service_role` `secret` key

#### 2.3 Add Supabase Environment Variables to Vercel

Add these to Vercel's environment variables:

| Variable Name | Value | Example |
|--------------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://shtgjlibyggqtgaqoyqg.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon/public key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_STORAGE_BUCKET` | Bucket name | `files` |

---

## 🔐 Step 3: Configure Authentication

Add authentication environment variables:

| Variable Name | Value | Example |
|--------------|-------|---------|
| `NEXTAUTH_URL` | Your Vercel deployment URL | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Random secret string | Run: `openssl rand -base64 32` |
| `JWT_SECRET` | Random secret string | Run: `openssl rand -base64 32` |

---

## 📦 Step 4: Complete Environment Variables Checklist

Here's the complete list of environment variables you need to set in Vercel:

### Database (Required)
- [x] `DATABASE_URL` - PostgreSQL connection string with pooling (port 6543)
- [x] `DIRECT_URL` - Direct PostgreSQL connection (port 5432)

### Supabase Storage (Required)
- [x] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- [x] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- [x] `SUPABASE_STORAGE_BUCKET` - Storage bucket name (e.g., `files`)

### Authentication (Required)
- [x] `NEXTAUTH_URL` - Your production URL
- [x] `NEXTAUTH_SECRET` - Random secret for NextAuth
- [x] `JWT_SECRET` - Random secret for JWT tokens

### Optional (if using AWS S3 instead of Supabase)
- [ ] `AWS_REGION` - AWS region (e.g., `us-east-1`)
- [ ] `AWS_ACCESS_KEY_ID` - AWS access key
- [ ] `AWS_SECRET_ACCESS_KEY` - AWS secret key
- [ ] `AWS_S3_BUCKET` - S3 bucket name

---

## 🔨 Step 5: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure build settings:
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build` (or leave default)
   - **Output Directory:** `.next` (or leave default)
4. Add all environment variables from Step 4
5. Click **Deploy**

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Add environment variables
vercel env add DATABASE_URL
vercel env add DIRECT_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL
# ... add all other variables
```

---

## 🐛 Troubleshooting Common Errors

### Error 1: "Can't reach database server"

**Cause:** Incorrect `DATABASE_URL` or missing connection pooling

**Solution:**
```bash
# Check your DATABASE_URL format:
# ✅ Correct (port 6543 with pgbouncer):
postgresql://postgres:password@db.xxx.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1

# ❌ Wrong (port 5432 without pooling):
postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```

### Error 2: "Failed to load resource: 401 (Unauthorized)"

**Cause:** Missing or incorrect Supabase API keys

**Solution:**
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is set
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set
3. Check that the bucket name matches `SUPABASE_STORAGE_BUCKET`
4. Ensure bucket exists in Supabase Storage

### Error 3: "Failed to load resource: 404 (Not Found)"

**Cause:** Storage bucket doesn't exist or API route not found

**Solution:**
1. Create the storage bucket in Supabase
2. Verify bucket name in environment variables
3. Check API routes are properly deployed

### Error 4: "Failed to load resource: 500 (Internal Server Error)"

**Cause:** Database connection failed or Prisma client not generated

**Solution:**
1. Check all environment variables are set correctly
2. Redeploy to trigger Prisma client generation
3. Check Vercel function logs for detailed errors

### Error 5: "PrismaClientInitializationError"

**Cause:** Prisma client not generated during build

**Solution:**
1. Ensure `postinstall` script exists in `package.json`:
   ```json
   "scripts": {
     "postinstall": "prisma generate"
   }
   ```
2. Redeploy the application

---

## 🔍 View Deployment Logs

To debug issues:

1. Go to Vercel Dashboard → Your Project
2. Click on the deployment
3. Click **Functions** tab to see serverless function logs
4. Click **Build Logs** to see build-time errors

Or use CLI:
```bash
vercel logs [deployment-url]
```

---

## ✅ Verify Deployment

After deployment, test these endpoints:

1. **Health Check:** `https://your-app.vercel.app/api/auth/me`
2. **Storage API:** `https://your-app.vercel.app/api/storage`
3. **Login:** `https://your-app.vercel.app/api/auth/login`

---

## 📝 Quick Deployment Checklist

Before deploying, ensure:

- [x] Database connection strings are correct (port 6543 for pooling)
- [x] All environment variables are set in Vercel
- [x] Supabase storage bucket exists and is accessible
- [x] Prisma schema is up to date
- [x] `postinstall` script includes `prisma generate`
- [x] Git repository is pushed with latest changes
- [x] No sensitive data in source code (use env vars)

---

## 🎯 Production Best Practices

1. **Use Connection Pooling:** Always use port 6543 with `pgbouncer=true` for Vercel
2. **Limit Connections:** Add `connection_limit=1` to DATABASE_URL
3. **Use Environment Variables:** Never hardcode secrets
4. **Enable Error Logging:** Use Vercel's built-in logging
5. **Monitor Performance:** Use Vercel Analytics
6. **Set Up Domains:** Configure custom domain in Vercel settings

---

## 🆘 Still Having Issues?

If you're still experiencing errors:

1. Check Vercel function logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test database connection from local environment
4. Ensure Supabase project is active and not paused
5. Check Supabase service status at [status.supabase.com](https://status.supabase.com)

---

## 📚 Additional Resources

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Prisma with Serverless](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)

---

**Need Help?** Open an issue in the repository or contact support.
