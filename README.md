# CloudDrive

<<<<<<< HEAD
A world-class, enterprise-grade cloud storage application built with **Next.js 14**, featuring a scalable backend architecture with **Supabase Storage** integration, **PostgreSQL** database, and **Supabase Auth**.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E)
=======
CloudDrive is a polished cloud file manager built with Next.js 14, TypeScript, Prisma, NextAuth, and Supabase Storage. It combines everyday file operations with AI-powered search, summarization, inline editing, public sharing, and a responsive interface designed for fast browsing on desktop and mobile.

The main application lives in the `cloud-drive/` workspace folder.
>>>>>>> 2d5b6e3 (Update CloudDrive docs and AI features)

## What This Project Does

CloudDrive is designed to manage files, folders, and sharing in one place. It supports authenticated file storage, public access flows, metadata-driven search, and a set of productivity features that go beyond a basic uploader.

<<<<<<< HEAD
### 🎨 Frontend (UI/UX)
* 🌓 **Dark/Light Mode** with smooth theme transitions
* 📱 **Responsive Design** (Desktop, Tablet, Mobile)
* 🎬 **Smooth Animations** with Framer Motion
* 🖼️ **Grid/List View** for file browsing
* 🔍 **Advanced Search** and filtering
* ⭐ **Star Files** for quick access
* 🗑️ **Trash Bin** with restore functionality
* 📤 **Drag & Drop Upload** with progress tracking
* 👁️ **File Preview** for images, videos, PDFs
* 📊 **Storage Visualization** with usage charts
* 🔔 **Notifications system**
* 🎯 **Context Menus** for quick actions

### 🔧 Backend (Architecture)
* 🏗️ **Layered MVC Architecture** (Repository → Service → Controller)
* ☁️ **Supabase Storage Integration** for scalable object storage
* 🗄️ **PostgreSQL Database** via Supabase with Prisma ORM
* 🔐 **Supabase Auth** for secure authentication and session management
* ✅ **Request Validation** with Zod schemas
* 📝 **Audit Logging** for security tracking
* 🛡️ **Error Handling** with custom error classes
* ⚡ **Rate Limiting** to prevent abuse
* 📊 **Winston Logging** for monitoring
* 🔗 **RESTful API design**
* 🚀 **Horizontally Scalable** architecture
* 🔒 **Supabase Signed URLs** for secure file access
=======
It includes:

- Secure authentication and account management
- Folder-based file organization
- Upload, preview, edit, summarize, and download workflows
- Public file sharing and file-drop links
- AI metadata extraction with summaries and tags
- A responsive dashboard with grid/list browsing, selection, and details panels
>>>>>>> 2d5b6e3 (Update CloudDrive docs and AI features)

## Feature Guide

### Authentication and accounts

- User registration and login endpoints
- Current-user profile lookup and updates
- NextAuth integration for session-based auth flows
- JWT-based authorization checks in middleware and API routes
- Profile avatar upload support
- Password reset email flow backed by SMTP configuration

### File management

- Upload files through the main dashboard
- Direct upload flow with presigned URLs and upload confirmation
- File listing with folder-aware navigation
- Rename, star, trash, restore, delete, and download actions
- File details panel with metadata, quick actions, and preview controls
- Duplicate-file detection during upload and file creation
- Recent, starred, shared, and trash-oriented views in the UI

### Folder management

- Create folders from the interface and the API
- Navigate folder hierarchies with breadcrumbs
- Organize files using a hierarchical Prisma `File` model
- Keep folder-specific views and selection behavior separate from file items

### Sharing and public access

- Share files with specific users
- Create public share links for file access
- Public shared-file page for link-based viewing
- File-drop links for public uploads into a target folder
- Drop-link listing, creation, and token-based upload routes

### AI features

- AI summary generation for uploaded files
# CloudDrive

CloudDrive is a cloud file manager built with Next.js 14, TypeScript, Prisma, NextAuth, and Supabase Storage. It combines everyday file operations with AI-powered search, summarization, inline editing, public sharing, and a responsive interface for desktop and mobile.

The main application lives in the `cloud-drive/` workspace folder.

## Overview

CloudDrive is designed to manage files, folders, and sharing in one place. It supports authenticated file storage, public access flows, metadata-driven search, and productivity features that go beyond a basic uploader.

## Feature Guide

### Authentication and accounts

- User registration and login endpoints
- Current-user profile lookup and updates
- NextAuth integration for session-based auth flows
- JWT-based authorization checks in middleware and API routes
- Profile avatar upload support
- Password reset email flow backed by SMTP configuration

### File management

- Upload files through the main dashboard
- Direct upload flow with presigned URLs and upload confirmation
- File listing with folder-aware navigation
- Rename, star, trash, restore, delete, and download actions
- File details panel with metadata, quick actions, and preview controls
- Duplicate-file detection during upload and file creation
- Recent, starred, shared, and trash-oriented views in the UI

### Folder management

- Create folders from the interface and the API
- Navigate folder hierarchies with breadcrumbs
- Organize files using a hierarchical Prisma `File` model
- Keep folder-specific views and selection behavior separate from file items

### Sharing and public access

- Share files with specific users
- Create public share links for file access
- Public shared-file page for link-based viewing
- File-drop links for public uploads into a target folder
- Drop-link listing, creation, and token-based upload routes

### AI features

- AI summary generation for uploaded files
- Cached summaries and extracted tags stored in the database
- AI search across file names, summaries, and tags
- Quick summarizer modal for uploading a local file or selecting an existing one
- Per-file summary regeneration from the file details and summary modals

### Inline editing and content creation

- Create new `.py`, `.txt`, `.md`, and `.json` files from the UI
- Open editable files directly in an inline editor modal
- Monaco-based editor for code files
- Plain text textarea editor for simple text files
- Save edited content back to Supabase Storage and Prisma metadata
- Browser-side Python execution support using Pyodide

### Productivity and download tools

- Multi-select file checkboxes
- Range selection support in the main file grid and list views
- ZIP download for selected files
- Search that spans file names, summaries, and AI tags
- Quick access actions from file cards, list items, and the details panel

### User interface and experience

- Responsive layout with sidebar, top navigation, and mobile navigation
- Grid and list file views
- Breadcrumb navigation for folders
- Skeleton loaders and upload status panel
- Help, settings, profile, preview, share, upload, create-folder, create-file, summary, and editor modals
- Toast-based feedback for actions and failures
- Theme provider and UI primitives for a consistent experience

### Storage and backend infrastructure

- Prisma-backed PostgreSQL persistence
- Supabase Storage for file objects and previews
- Audit log model for file and auth activity
- Storage statistics endpoint for usage tracking
- File content routes for viewing and editing stored objects
- Summary routes for extracting text and generating AI metadata

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL with Prisma |
| Authentication | NextAuth, JWT utilities, bcryptjs |
| Storage | Supabase Storage |
| AI | Groq SDK, PDF parsing, DOCX extraction |
| Editor | Monaco Editor |
| UI | React, Framer Motion, Lucide React, React Hot Toast |
| Utilities | JSZip, React Dropzone, Mammoth, pdf-parse |
| Logging | Winston |

## Project Structure

```text
Google Drive Clone/
├── README.md
├── package.json
└── cloud-drive/
    ├── prisma/
    │   └── schema.prisma
    ├── scripts/
    ├── src/
    │   ├── app/
    │   │   ├── api/
    │   │   ├── login/
    │   │   └── share/
    │   ├── components/
    │   ├── lib/
    │   ├── middleware/
    │   ├── repositories/
    │   ├── services/
    │   └── types/
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── vercel.json
```

## Setup

```bash
cd cloud-drive
npm install
npm run dev
```

Open `http://localhost:3000` after the dev server starts.

## Environment Variables

Create a `.env` file inside `cloud-drive/`.

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_STORAGE_BUCKET="files"

GROQ_API_KEY="your-groq-api-key"

MAX_FILE_SIZE=104857600

SMTP_HOST=""
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=""
SMTP_PASS=""
SMTP_FROM=""
```

Notes:

- `GROQ_API_KEY` is required for summaries, tags, and AI search features.
- `SMTP_*` is only needed if you want password reset emails to send instead of returning the reset link in development.
- `MAX_FILE_SIZE` controls upload validation.

## Scripts

Run these from `cloud-drive/`:

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run db:generate
npm run db:push
npm run db:studio
npm run check-env
npm run vercel-build
```

## API Surface

### Authentication

| Route | Method(s) | Purpose |
|---|---|---|
| `/api/auth/register` | POST | Register a new user |
| `/api/auth/login` | POST | Log in a user |
| `/api/auth/me` | GET, PATCH | Read or update the current user |
| `/api/auth/[...nextauth]` | NextAuth | NextAuth handler |

### Files and content

| Route | Method(s) | Purpose |
|---|---|---|
| `/api/files` | GET, POST | List files or upload a file |
| `/api/files/[id]` | GET, PATCH, DELETE | File details and file updates |
| `/api/files/[id]/content` | GET, PUT | Read and update editable file content |
| `/api/files/[id]/download` | GET | Download URL |
| `/api/files/[id]/share` | POST | Share a file with users |
| `/api/files/[id]/share/link` | POST | Create a public share link |
| `/api/files/presign` | POST | Create a signed upload URL |
| `/api/files/confirm` | POST | Confirm a direct upload |
| `/api/files/trash` | POST | Trash handling |

### Folders, sharing, and storage

| Route | Method(s) | Purpose |
|---|---|---|
| `/api/folders` | POST | Create a folder |
| `/api/share/[id]` | GET, POST | Public shared-file access |
| `/api/storage` | GET | Storage statistics |

### AI and summarization

| Route | Method(s) | Purpose |
|---|---|---|
| `/api/summarize` | POST | Summarize an uploaded local file |
| `/api/files/[id]/summarize` | POST | Summarize an existing file and cache results |
| `/api/ai/search` | POST | Search by name, summary, and tags |

### File-drop links

| Route | Method(s) | Purpose |
|---|---|---|
| `/api/drop-links` | GET, POST | List and create file-drop links |
| `/api/drop-links/[token]` | GET, POST | Inspect a drop link or upload through it |

## Key Notes

- File metadata is stored in Prisma and objects are stored in Supabase Storage.
- The app uses a hierarchical `File` model so folders and files share one tree.
- AI metadata is persisted as summaries, extracted text, and tags for faster reuse.
- Search, summary, and editor features depend on the configured APIs and storage buckets.
- The UI is built to work across desktop and mobile with selection, modals, and responsive navigation.

## Deployment Checklist

- Configure all environment variables in the target host.
- Ensure Supabase Storage and database credentials are valid.
- Verify `prisma generate` runs during build.
- Set `NEXTAUTH_URL` to the deployed domain.
- Confirm `GROQ_API_KEY` is present for AI features.
