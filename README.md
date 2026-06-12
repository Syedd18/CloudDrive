# CloudDrive

CloudDrive is a modern cloud file manager built with Next.js 14, TypeScript, Prisma, NextAuth, and Supabase Storage. It combines secure file storage, folder organization, AI-assisted discovery, inline editing, public sharing, and a responsive dashboard for desktop and mobile users.

## Overview

The application keeps files, folders, sharing, and metadata-driven search in one place. It is designed for practical workflows such as upload, preview, edit, summarize, and download, while also supporting advanced capabilities like AI tagging, public file-drop links, and browser-side Python execution.

## Key Features

- Secure authentication and account management
- Folder-based file organization with breadcrumbs
- Upload, preview, edit, summarize, download, and delete workflows
- Public file sharing and file-drop links
- AI metadata extraction with summaries and tags
- Grid and list browsing with multi-select support
- ZIP download for selected files
- Responsive layout with sidebar, top navigation, and mobile navigation

## Feature Details

### Authentication and profiles

- User registration and login endpoints
- Current-user profile lookup and updates
- NextAuth session handling
- JWT-based authorization checks in middleware and API routes
- Profile avatar upload support
- Password reset email flow through SMTP configuration

### File management

- Upload files from the main dashboard
- Direct upload flow with presigned URLs and upload confirmation
- File listing with folder-aware navigation
- Rename, star, trash, restore, delete, and download actions
- File details panel with metadata, quick actions, and preview controls
- Duplicate-file detection during upload and file creation

### Folder organization

- Create folders from the interface and the API
- Navigate folder hierarchies with breadcrumbs
- Organize content with a hierarchical Prisma `File` model
- Keep folder views and selection behavior isolated from file items

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
- Quick summarizer modal for local files or existing files
- Per-file summary regeneration from the details and summary modals

### Inline editing and creation

- Create new `.py`, `.txt`, `.md`, and `.json` files in the UI
- Open editable files directly in an inline editor modal
- Monaco-based editor for code files
- Plain text textarea editor for simple text files
- Save edited content back to Supabase Storage and Prisma metadata
- Browser-side Python execution support using Pyodide

### User interface

- Grid and list file views
- Breadcrumb navigation for folders
- Skeleton loaders and upload status panel
- Help, settings, profile, preview, share, upload, create-folder, create-file, summary, and editor modals
- Toast-based feedback for actions and failures
- Theme provider and reusable UI primitives

### Backend and storage

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

## Setup

```bash
cd cloud-drive
npm install
npm run dev
```

Open `http://localhost:3000` after the development server starts.

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

- `GROQ_API_KEY` is required for summaries, tags, and AI search.
- `SMTP_*` is only needed if you want password reset emails instead of the reset link in development.
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

## Notes

- File metadata is stored in Prisma and objects are stored in Supabase Storage.
- The app uses a hierarchical `File` model so folders and files share one tree.
- AI metadata is persisted as summaries, extracted text, and tags for faster reuse.
- Search, summary, and editor features depend on the configured APIs and storage buckets.
- The UI is designed to work across desktop and mobile with selection, modals, and responsive navigation.

## Deployment Checklist

- Configure all environment variables in the target host.
- Ensure Supabase Storage and database credentials are valid.
- Verify `prisma generate` runs during build.
- Set `NEXTAUTH_URL` to the deployed domain.
- Confirm `GROQ_API_KEY` is present for AI features.
