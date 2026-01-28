# 🚨 VERCEL DEPLOYMENT - QUICK FIX

## The 3 Main Issues & Solutions

### ❌ Issue 1: Database Connection Error (500)
```
Can't reach database server at db.shtgjlibyggqtgaqoyqg.supabase.co:5432
```

**✅ Solution:** Add these environment variables in Vercel:

```bash
# IMPORTANT: Use port 6543 (not 5432) for connection pooling!
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@db.shtgjlibyggqtgaqoyqg.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1"

# Direct URL for migrations (port 5432)
DIRECT_URL="postgresql://postgres:[YOUR_PASSWORD]@db.shtgjlibyggqtgaqoyqg.supabase.co:5432/postgres"
```

**How to get your password:**
1. Go to Supabase Dashboard → Settings → Database
2. Look for "Database password" or reset it
3. Copy the connection string and replace `[YOUR_PASSWORD]`

---

### ❌ Issue 2: Storage API Error (401)
```
Failed to load resource: the server responded with a status of 401
```

**✅ Solution:** Add Supabase storage environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://shtgjlibyggqtgaqoyqg.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_STORAGE_BUCKET="files"
```

**How to get these values:**
1. Go to Supabase Dashboard → Settings → API
2. Copy:
   - **URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

**Create the storage bucket:**
1. Go to Supabase Dashboard → Storage
2. Click "Create a new bucket"
3. Name it `files` (or match your env var)
4. Make it public (or configure RLS policies)

---

### ❌ Issue 3: Login Error (500)
```
Failed to load resource: the server responded with a status of 500
```

**✅ Solution:** Add authentication secrets:

```bash
# Generate secrets using: openssl rand -base64 32
NEXTAUTH_SECRET="your-random-secret-here"
JWT_SECRET="another-random-secret-here"
NEXTAUTH_URL="https://your-app.vercel.app"
```

---

## 🎯 Complete Environment Variables Checklist

Copy this template and fill in your values:

```bash
# Database (REQUIRED)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.shtgjlibyggqtgaqoyqg.supabase.co:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.shtgjlibyggqtgaqoyqg.supabase.co:5432/postgres"

# Supabase Storage (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL="https://shtgjlibyggqtgaqoyqg.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
SUPABASE_STORAGE_BUCKET="files"

# Authentication (REQUIRED)
NEXTAUTH_SECRET="[run: openssl rand -base64 32]"
JWT_SECRET="[run: openssl rand -base64 32]"
NEXTAUTH_URL="https://your-app.vercel.app"
```

---

## 📝 Step-by-Step Deployment

### 1. Add Environment Variables to Vercel

1. Go to [vercel.com](https://vercel.com) → Your Project
2. Click **Settings** → **Environment Variables**
3. Add each variable above (one by one)
4. Select **Production**, **Preview**, and **Development**
5. Click **Save**

### 2. Redeploy

1. Go to **Deployments** tab
2. Click the **...** menu on latest deployment
3. Click **Redeploy**
4. Wait for build to complete

### 3. Test Your Deployment

Visit these URLs to verify:
- ✅ `https://your-app.vercel.app/` - Home page
- ✅ `https://your-app.vercel.app/api/storage` - Should return 401 (expected without auth)
- ✅ `https://your-app.vercel.app/login` - Login page

---

## 🐛 Still Getting Errors?

### Check Function Logs:
1. Go to Vercel Dashboard → Deployments
2. Click your latest deployment
3. Click **Functions** tab
4. Look for error messages

### Common Issues:

**"PrismaClientInitializationError"**
→ Wait a few minutes and redeploy (Prisma client generation issue)

**"Too many connections"**
→ Make sure DATABASE_URL uses port **6543** with `pgbouncer=true`

**"Bucket not found"**
→ Create the storage bucket in Supabase Dashboard → Storage

**"Invalid token"**
→ Check that Supabase keys are copied correctly (no extra spaces)

---

## 🆘 Emergency Reset

If nothing works, try this:

```bash
# 1. Delete all environment variables in Vercel
# 2. Re-add them one by one from the checklist above
# 3. Force a fresh deployment:
```

1. Go to Vercel → Deployments
2. Click latest deployment → **...** menu
3. Click **Redeploy**
4. Check "Use existing Build Cache" is **OFF**
5. Deploy

---

## ✅ Success Indicators

You know it's working when:
- ✅ No 500 errors in browser console
- ✅ Login page loads without errors
- ✅ Can register a new account
- ✅ Can login successfully
- ✅ Storage usage shows (even if 0 bytes)

---

**For detailed explanation, see:** [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
