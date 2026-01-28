# 🚀 Deploy to Vercel - Start Here!

> **Quick Start:** Follow these 3 steps to deploy your Cloud Drive app to Vercel and fix all errors.

---

## 🎯 What This Fixes

Your Vercel deployment is showing these errors:
- ❌ **500 Error:** "Can't reach database server at db.shtgjlibyggqtgaqoyqg.supabase.co:5432"
- ❌ **401 Error:** "Failed to load resource: the server responded with a status of 401 ()" 
- ❌ **404 Error:** "Failed to load resource: the server responded with a status of 404 ()"

**All of these are environment variable issues.** Here's how to fix them:

---

## 📋 Step 1: Get Your Supabase Credentials

### 1.1 Database Connection Strings

1. Go to [Supabase Dashboard](https://app.supabase.com) → Your Project
2. Click **Settings** (⚙️ icon) → **Database**
3. Scroll to **Connection string**
4. Copy **URI** and replace `[YOUR-PASSWORD]` with your actual database password
5. You need TWO URLs:

```bash
# For DATABASE_URL - use port 6543 (connection pooling)
postgresql://postgres:YOUR_PASSWORD@db.shtgjlibyggqtgaqoyqg.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1

# For DIRECT_URL - use port 5432 (direct connection)  
postgresql://postgres:YOUR_PASSWORD@db.shtgjlibyggqtgaqoyqg.supabase.co:5432/postgres
```

> ⚠️ **Important:** Port numbers matter! Use **6543** for pooling, **5432** for direct.

### 1.2 Supabase API Keys

1. Go to **Settings** → **API**
2. Copy these three values:
   - **URL** (Project URL)
   - **anon** **public** key
   - **service_role** **secret** key

### 1.3 Create Storage Bucket

1. Go to **Storage** in the left sidebar
2. Click **Create a new bucket**
3. Name: `files`
4. Make it **Public** (or configure RLS policies)
5. Click **Create bucket**

---

## ⚙️ Step 2: Add Environment Variables to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click **Settings** → **Environment Variables**
4. Add each variable below:

### Required Variables (Copy-Paste Template)

```bash
# 🗄️ Database (REQUIRED)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.shtgjlibyggqtgaqoyqg.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres:YOUR_PASSWORD@db.shtgjlibyggqtgaqoyqg.supabase.co:5432/postgres

# ☁️ Supabase Storage (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://shtgjlibyggqtgaqoyqg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_STORAGE_BUCKET=files

# 🔐 Authentication (REQUIRED)
NEXTAUTH_SECRET=YOUR_RANDOM_SECRET_HERE
JWT_SECRET=YOUR_RANDOM_SECRET_HERE
NEXTAUTH_URL=https://your-app.vercel.app
```

### How to Generate Secrets

For `NEXTAUTH_SECRET` and `JWT_SECRET`, run this in your terminal:

```bash
# Windows PowerShell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# Mac/Linux
openssl rand -base64 32
```

### Environment Selection

For each variable, select:
- ✅ **Production**
- ✅ **Preview** 
- ✅ **Development**

---

## 🚀 Step 3: Deploy

### Option A: Automatic (Recommended)

Push your code to Git:
```bash
git add .
git commit -m "Fix Vercel deployment configuration"
git push origin main
```

Vercel will automatically deploy your changes.

### Option B: Manual Redeploy

1. Go to **Deployments** tab in Vercel
2. Click the **︙** (three dots) on the latest deployment
3. Click **Redeploy**
4. Wait for build to complete (~2-3 minutes)

---

## ✅ Step 4: Verify Deployment

After deployment completes, test these:

1. **Home Page:** `https://your-app.vercel.app`
   - Should load without errors

2. **Login Page:** `https://your-app.vercel.app/login`
   - Should show login form

3. **Browser Console:** Press F12 → Console tab
   - Should see no red errors (401, 404, 500)

4. **Vercel Function Logs:** Dashboard → Deployments → Functions tab
   - Should see successful API calls
   - No "Can't reach database" errors

---

## 🐛 Troubleshooting

### Still Getting Errors?

Run the environment checker script locally:
```bash
npm run check-env
```

This validates all your environment variables are set correctly.

### Common Issues

| Error | Solution |
|-------|----------|
| "Can't reach database" | Check DATABASE_URL uses port **6543** with `pgbouncer=true` |
| "401 Unauthorized" | Verify Supabase keys are copied correctly (no spaces) |
| "Bucket not found" | Create `files` bucket in Supabase Storage |
| "Too many connections" | Add `&connection_limit=1` to DATABASE_URL |

### Need More Help?

📖 **Detailed Guides:**
- [QUICK_FIX.md](./QUICK_FIX.md) - Quick solutions for each error
- [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) - Comprehensive deployment guide
- [DEPLOYMENT_FIXES_SUMMARY.md](./DEPLOYMENT_FIXES_SUMMARY.md) - Summary of all changes made

🔍 **Debug Tools:**
- Check Vercel function logs: Dashboard → Deployments → Functions
- Check build logs: Dashboard → Deployments → Build Logs
- Run `npm run check-env` locally to validate environment variables

---

## 📝 Checklist

Before considering deployment complete:

- [ ] All environment variables added to Vercel
- [ ] DATABASE_URL uses port 6543 with pgbouncer
- [ ] Supabase storage bucket exists
- [ ] Secrets generated for NEXTAUTH_SECRET and JWT_SECRET
- [ ] Code pushed to Git
- [ ] Deployment succeeded (green checkmark in Vercel)
- [ ] Home page loads without console errors
- [ ] Can access login page
- [ ] No 500/401/404 errors in browser

---

## 🎉 Success!

Once all checkboxes are marked, your app is successfully deployed!

**Next Steps:**
- Configure custom domain (Vercel Settings → Domains)
- Set up monitoring and analytics
- Configure rate limiting if needed
- Add additional environment-specific configs

---

**Questions?** Check the detailed guides linked above or review Vercel function logs for specific errors.
