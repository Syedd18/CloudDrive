-- Supabase Database Schema
-- Run this in your Supabase SQL Editor at: https://shtgjlibyggqtgaqoyqg.supabase.co

-- Create Users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "avatar" TEXT,
    "role" TEXT DEFAULT 'user' NOT NULL,
    "isActive" BOOLEAN DEFAULT true NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");

-- Create Files table
CREATE TABLE IF NOT EXISTS "files" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" BIGINT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "s3Key" TEXT UNIQUE NOT NULL,
    "s3Url" TEXT NOT NULL,
    "thumbnail" TEXT,
    "starred" BOOLEAN DEFAULT false NOT NULL,
    "trashed" BOOLEAN DEFAULT false NOT NULL,
    "trashedAt" TIMESTAMP(3),
    "folderId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("folderId") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "files_userId_idx" ON "files"("userId");
CREATE INDEX IF NOT EXISTS "files_folderId_idx" ON "files"("folderId");
CREATE INDEX IF NOT EXISTS "files_trashed_idx" ON "files"("trashed");
CREATE INDEX IF NOT EXISTS "files_starred_idx" ON "files"("starred");
CREATE INDEX IF NOT EXISTS "files_s3Key_idx" ON "files"("s3Key");

-- Create Shares table
CREATE TABLE IF NOT EXISTS "shares" (
    "id" TEXT PRIMARY KEY,
    "fileId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "canEdit" BOOLEAN DEFAULT false NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE("fileId", "email")
);

CREATE INDEX IF NOT EXISTS "shares_fileId_idx" ON "shares"("fileId");
CREATE INDEX IF NOT EXISTS "shares_email_idx" ON "shares"("email");

-- Create Audit Logs table
CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS "audit_logs_userId_idx" ON "audit_logs"("userId");
CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX IF NOT EXISTS "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- Create Accounts table (for NextAuth)
CREATE TABLE IF NOT EXISTS "accounts" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE("provider", "providerAccountId")
);

-- Create Sessions table (for NextAuth)
CREATE TABLE IF NOT EXISTS "sessions" (
    "id" TEXT PRIMARY KEY,
    "sessionToken" TEXT UNIQUE NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Verification Tokens table (for NextAuth)
CREATE TABLE IF NOT EXISTS "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT UNIQUE NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    UNIQUE("identifier", "token")
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "files" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shares" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "verification_tokens" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for files (users can only see their own files)
CREATE POLICY "Users can view own files" ON "files"
    FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own files" ON "files"
    FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own files" ON "files"
    FOR UPDATE USING (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own files" ON "files"
    FOR DELETE USING (auth.uid()::text = "userId");

-- Grant service role full access (bypass RLS)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
