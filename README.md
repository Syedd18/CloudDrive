<div align="center">

# ☁️ CloudDrive

### AI-Powered Cloud Storage & Intelligent Workspace

Store • Organize • Search • Edit • Share • Collaborate

<p align="center">

<img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=nextdotjs" />
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" />
<img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
<img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
<img src="https://img.shields.io/badge/NextAuth-Authentication-black?style=for-the-badge" />
<img src="https://img.shields.io/badge/Groq-AI-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />

</p>

<p align="center">
<a href="#overview">Overview</a> •
<a href="#features">Features</a> •
<a href="#architecture">Architecture</a> •
<a href="#tech-stack">Tech Stack</a> •
<a href="#getting-started">Getting Started</a> •
<a href="#api-reference">API Reference</a> •
<a href="#deployment">Deployment</a>
</p>

</div>

---

# Overview

CloudDrive is a modern cloud file management platform built with **Next.js 14**, **TypeScript**, **Prisma**, **NextAuth**, and **Supabase Storage**.

It combines secure file storage, folder organization, AI-assisted discovery, inline editing, public sharing, browser-based Python execution, and responsive dashboards into a single intelligent workspace.

CloudDrive is designed for developers, students, teams, and organizations that need more than traditional cloud storage.

---

# Why CloudDrive?

Unlike conventional storage platforms, CloudDrive adds intelligence directly into the file management workflow.

### Key Advantages

- 🤖 AI-powered file discovery
- 📝 Built-in file editor
- ☁️ Secure cloud storage
- 🔎 Semantic search
- 📂 Hierarchical folder organization
- 🔗 Public file sharing
- 📥 File-drop upload portals
- 🐍 Browser-side Python execution
- 📱 Fully responsive dashboard

---

# Features

## 🔐 Authentication & User Management

Secure account management powered by NextAuth.

### Includes

- User Registration
- User Login
- Session Management
- JWT Authorization
- Protected Routes
- Password Reset Flow
- Avatar Upload Support
- Profile Management

---

## ☁️ File Management

Manage the complete lifecycle of files from a unified dashboard.

### Capabilities

- Upload Files
- Download Files
- Rename Files
- Delete Files
- Trash & Restore
- Star Files
- Duplicate Detection
- Multi-Selection Support
- ZIP Downloads
- File Metadata Management

---

## 📂 Folder Organization

Organize files using hierarchical folder structures.

### Features

- Nested Folders
- Breadcrumb Navigation
- Folder-Aware Browsing
- Tree-Based Storage Model
- Structured File Organization

---

## 🤖 AI Features

CloudDrive integrates AI directly into the storage experience.

### Smart Summaries

Generate summaries from:

- PDF Files
- DOCX Documents
- Text Files
- Markdown Files

### AI Metadata Extraction

Automatically extracts:

- Keywords
- Tags
- Searchable Metadata
- Content Insights

### AI Search

Search across:

- File Names
- Tags
- Summaries
- Extracted Content

---

## 📝 Inline Editing

Edit files directly inside the browser.

### Supported Formats

- `.txt`
- `.md`
- `.json`
- `.py`

### Editor Features

- Monaco Editor
- Syntax Highlighting
- Live Editing
- Direct Save to Storage

---

## 🐍 Browser Python Runtime

Run Python scripts directly in the browser using Pyodide.

### Benefits

- No Backend Execution Required
- Instant Testing
- Educational Workflows
- Lightweight Automation

---

## 🔗 Sharing & Public Access

Share files securely with internal users or external audiences.

### Sharing Features

#### Private Sharing

Grant access to selected users.

#### Public Links

Generate public shareable URLs.

#### File Drop Links

Allow external users to upload files into specific folders.

### Ideal For

- Client Deliverables
- Assignment Collection
- Recruitment Portals
- Public Submissions

---

## 📱 Modern User Experience

Built with productivity and responsiveness in mind.

### UI Features

- Responsive Dashboard
- Sidebar Navigation
- Mobile Navigation
- Grid View
- List View
- Skeleton Loaders
- Toast Notifications
- Theme Support
- Framer Motion Animations
- Reusable UI Components

---

# Architecture

```text
                         ┌────────────────────┐
                         │      Frontend      │
                         │     Next.js 14     │
                         └─────────┬──────────┘
                                   │
                                   ▼
                         ┌────────────────────┐
                         │     API Layer      │
                         │  Route Handlers    │
                         └─────────┬──────────┘
                                   │
                ┌──────────────────┼──────────────────┐
                ▼                                     ▼

       ┌───────────────────┐              ┌───────────────────┐
       │ PostgreSQL        │              │ Supabase Storage  │
       │ Prisma ORM        │              │ File Objects      │
       └───────────────────┘              └───────────────────┘
                    │
                    ▼
          ┌──────────────────────┐
          │       Groq AI        │
          │ Summaries & Search   │
          └──────────────────────┘
```

---

# Tech Stack

## Frontend

<p>
<img src="https://skillicons.dev/icons?i=nextjs,react,typescript,tailwind" />
</p>

- Next.js 14 App Router
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React

---

## Backend

<p>
<img src="https://skillicons.dev/icons?i=nodejs,postgres,prisma" />
</p>

- PostgreSQL
- Prisma ORM
- Next.js Route Handlers
- Winston Logging

---

## Authentication

- NextAuth
- JWT Authorization
- bcryptjs

---

## Storage

<p>
<img src="https://skillicons.dev/icons?i=supabase" />
</p>

- Supabase Storage
- Presigned Upload URLs

---

## AI & Processing

- Groq SDK
- pdf-parse
- Mammoth
- AI Metadata Extraction
- Semantic Search

---

## Developer Utilities

- JSZip
- React Dropzone
- Monaco Editor
- Pyodide

---

# Platform Capabilities

| Capability | Supported |
|------------|------------|
| Cloud Storage | ✅ |
| Folder Management | ✅ |
| AI Search | ✅ |
| AI Summaries | ✅ |
| Metadata Extraction | ✅ |
| Public Sharing | ✅ |
| File Drop Links | ✅ |
| Browser Editing | ✅ |
| Python Runtime | ✅ |
| ZIP Downloads | ✅ |
| Mobile Responsive | ✅ |
| Authentication | ✅ |

---

# Project Structure

```bash
cloud-drive/
│
├── app/
├── components/
├── hooks/
├── lib/
├── prisma/
├── public/
├── types/
│
├── middleware.ts
├── next.config.js
├── tailwind.config.ts
├── package.json
└── README.md
```

---

# Getting Started

## Clone Repository

```bash
git clone https://github.com/your-username/cloud-drive.git

cd cloud-drive
```

---

## Install Dependencies

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the project root.

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

### Notes

- `GROQ_API_KEY` is required for AI search and summaries.
- `SMTP_*` variables are required only for password reset emails.
- `MAX_FILE_SIZE` controls upload validation limits.

---

## Database Setup

Generate Prisma Client:

```bash
npm run db:generate
```

Push Database Schema:

```bash
npm run db:push
```

---

## Start Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# Available Scripts

| Command | Description |
|----------|------------|
| npm run dev | Start Development Server |
| npm run build | Create Production Build |
| npm run start | Start Production Server |
| npm run lint | Run ESLint |
| npm run db:generate | Generate Prisma Client |
| npm run db:push | Push Database Schema |
| npm run db:studio | Open Prisma Studio |
| npm run check-env | Validate Environment Variables |
| npm run vercel-build | Vercel Build Script |

---

# API Reference

## Authentication

| Endpoint | Method(s) | Description |
|-----------|-----------|-------------|
| `/api/auth/register` | POST | Register a User |
| `/api/auth/login` | POST | User Login |
| `/api/auth/me` | GET, PATCH | User Profile |
| `/api/auth/[...nextauth]` | NextAuth | Authentication Handler |

---

## Files

| Endpoint | Method(s) | Description |
|-----------|-----------|-------------|
| `/api/files` | GET, POST | List & Upload Files |
| `/api/files/[id]` | GET, PATCH, DELETE | File Operations |
| `/api/files/[id]/content` | GET, PUT | File Content |
| `/api/files/[id]/download` | GET | Download File |
| `/api/files/[id]/share` | POST | Share File |
| `/api/files/[id]/share/link` | POST | Generate Public Link |
| `/api/files/presign` | POST | Generate Upload URL |
| `/api/files/confirm` | POST | Confirm Upload |
| `/api/files/trash` | POST | Trash Operations |

---

## AI Services

| Endpoint | Method(s) | Description |
|-----------|-----------|-------------|
| `/api/summarize` | POST | Summarize Local File |
| `/api/files/[id]/summarize` | POST | Summarize Stored File |
| `/api/ai/search` | POST | AI-Powered Search |

---

## Sharing & Storage

| Endpoint | Method(s) | Description |
|-----------|-----------|-------------|
| `/api/storage` | GET | Storage Statistics |
| `/api/share/[id]` | GET, POST | Public File Access |
| `/api/drop-links` | GET, POST | Drop Link Management |
| `/api/drop-links/[token]` | GET, POST | Public Upload Portal |

---

# Security

CloudDrive follows modern security best practices.

### Security Features

- JWT Validation
- Protected API Routes
- Secure Sessions
- Password Hashing
- Access Control Enforcement
- Presigned Upload URLs
- Share Token Validation
- Storage Access Restrictions

---

# Deployment

## Deployment Checklist

- Configure PostgreSQL Database
- Configure Supabase Storage
- Set Environment Variables
- Generate Prisma Client
- Configure NextAuth URL
- Configure Groq API Key
- Verify Storage Permissions

---

## Production Build

```bash
npm run build
```

---

## Start Production Server

```bash
npm run start
```

---

# Roadmap

### Planned Improvements

- Real-Time Collaboration
- File Version History
- OCR Support
- Team Workspaces
- Activity Timeline
- File Comments
- Advanced Permissions
- AI File Classification
- Desktop Application
- WebDAV Support

---

# Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push your branch
5. Open a Pull Request

---

# License

This project is licensed under the MIT License.

---

<div align="center">

## ☁️ CloudDrive

### Intelligent Cloud Storage for Modern Workflows

<p>
<img src="https://skillicons.dev/icons?i=nextjs,typescript,react,postgres,prisma,supabase" />
</p>

Built with Next.js, TypeScript, Prisma, PostgreSQL, Supabase, and AI.

</div>
