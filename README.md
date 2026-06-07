<div align="center">

<img src="./public/logo.png" alt="CloudDrive Logo" width="140"/>

# ☁️ CloudDrive

### AI-Powered Cloud Storage & Intelligent Workspace

Store • Organize • Search • Edit • Share • Collaborate

<p align="center">

<img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=nextdotjs" />
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" />
<img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
<img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
<img src="https://img.shields.io/badge/NextAuth-000000?style=for-the-badge" />
<img src="https://img.shields.io/badge/Groq-AI-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />

</p>

<p align="center">

<a href="#-features">Features</a> •
<a href="#-architecture">Architecture</a> •
<a href="#-tech-stack">Tech Stack</a> •
<a href="#-getting-started">Getting Started</a> •
<a href="#-api-reference">API</a> •
<a href="#-deployment">Deployment</a>

</p>

</div>

---

# 🚀 Overview

CloudDrive is a modern, AI-powered cloud storage platform built for developers, students, teams, and businesses who need more than traditional file storage.

Unlike conventional cloud drives, CloudDrive combines secure storage, intelligent search, AI-generated summaries, browser-based editing, public sharing, and collaborative workflows into a single unified workspace.

Whether you're managing documents, code files, reports, research papers, or client assets, CloudDrive helps you organize and discover information faster using AI-powered metadata extraction and semantic search.

---

# ✨ Why CloudDrive?

Traditional storage solutions focus on storing files.

CloudDrive focuses on helping users **understand, organize, discover, and collaborate with their files intelligently.**

| Traditional Storage | CloudDrive |
|--------------------|------------|
| File Storage | ✅ |
| Folder Organization | ✅ |
| AI Search | ✅ |
| AI Summaries | ✅ |
| Metadata Extraction | ✅ |
| Browser Code Editing | ✅ |
| Python Execution | ✅ |
| Public Upload Portals | ✅ |
| Semantic Discovery | ✅ |
| Modern SaaS Experience | ✅ |

---

# 📸 Screenshots

> Add your screenshots here.

## Dashboard

![Dashboard](./docs/screenshots/dashboard.png)

## AI Search

![AI Search](./docs/screenshots/ai-search.png)

## File Editor

![Editor](./docs/screenshots/editor.png)

## Public Sharing

![Sharing](./docs/screenshots/sharing.png)

---

# ⚡ Features

## 🔐 Authentication & Security

Secure user authentication powered by NextAuth and JWT-based authorization.

### Features

- User Registration
- Login & Logout
- Session Management
- Protected Routes
- JWT Verification
- Password Hashing
- Avatar Uploads
- Password Reset Flow
- Secure API Authorization

---

## ☁️ File Management

Complete cloud file lifecycle management.

### Capabilities

- Upload Files
- Download Files
- Rename Files
- Delete Files
- Trash & Restore
- Favorite Files
- Duplicate Detection
- Multi-Select Operations
- ZIP Downloads
- Metadata Management

---

## 📂 Folder Organization

Manage files using a hierarchical folder structure.

### Features

- Nested Folders
- Breadcrumb Navigation
- Folder-Aware Search
- Tree-Based Data Model
- Organized Workspace Experience

---

## 🤖 AI-Powered Intelligence

CloudDrive integrates AI directly into the storage workflow.

### AI Features

#### Smart Summaries

Generate concise summaries from:

- PDF Files
- DOCX Documents
- Markdown Files
- Text Files

#### AI Metadata Extraction

Automatically extracts:

- Keywords
- Tags
- Search Metadata
- Content Insights

#### Semantic Search

Search using:

- File Names
- Tags
- Summaries
- Extracted Content

---

## 🔗 Sharing & Collaboration

Share content securely with anyone.

### Sharing Features

#### Private Sharing

Share files with selected users.

#### Public Share Links

Generate secure public URLs.

#### File Drop Links

Allow external users to upload files directly into a target folder.

Perfect for:

- Client Deliverables
- Assignment Collection
- Recruitment Documents
- Public Submissions

---

## 📝 Built-In Editor

Edit files directly from the browser.

### Supported Formats

- `.txt`
- `.md`
- `.json`
- `.py`

### Editor Features

- Monaco Editor
- Syntax Highlighting
- Instant Updates
- Code Editing Experience
- Save Directly to Storage

---

## 🐍 Browser Python Execution

Run Python directly in the browser using Pyodide.

### Benefits

- No Server Required
- Instant Execution
- Learning & Experimentation
- Script Testing

---

## 📱 Modern User Experience

Designed for productivity and usability.

### UI Features

- Responsive Dashboard
- Sidebar Navigation
- Mobile Navigation
- Grid View
- List View
- Breadcrumb Navigation
- Skeleton Loaders
- Toast Notifications
- Theme Support
- Framer Motion Animations
- Reusable Components

---

# 🏗 Architecture

```text
                         ┌────────────────────┐
                         │      Frontend      │
                         │     Next.js 14     │
                         └─────────┬──────────┘
                                   │
                                   ▼
                         ┌────────────────────┐
                         │     API Layer      │
                         │ Route Handlers     │
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
          │      Groq AI         │
          │ Summaries & Search   │
          └──────────────────────┘
```

---

# 🛠 Tech Stack

## Frontend

<p align="left">
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

<p align="left">
<img src="https://skillicons.dev/icons?i=nodejs,postgres,prisma" />
</p>

- PostgreSQL
- Prisma ORM
- Route Handlers
- Winston Logging

---

## Authentication

<p align="left">
<img src="https://skillicons.dev/icons?i=nodejs" />
</p>

- NextAuth
- JWT Authorization
- bcryptjs

---

## Storage

<p align="left">
<img src="https://skillicons.dev/icons?i=supabase" />
</p>

- Supabase Storage
- Presigned Upload URLs

---

## AI & Processing

- Groq SDK
- pdf-parse
- Mammoth
- Metadata Extraction
- AI Search Engine

---

## Developer Utilities

- JSZip
- React Dropzone
- Monaco Editor
- Pyodide

---

# 📊 Platform Capabilities

| Capability | Supported |
|------------|------------|
| Cloud Storage | ✅ |
| AI Search | ✅ |
| AI Summaries | ✅ |
| Metadata Extraction | ✅ |
| Public Sharing | ✅ |
| File Drop Links | ✅ |
| Browser Editing | ✅ |
| Python Runtime | ✅ |
| Mobile Responsive | ✅ |
| Folder Hierarchy | ✅ |
| ZIP Downloads | ✅ |
| Authentication | ✅ |

---

# 📁 Project Structure

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
│
└── README.md
```

---

# 🚀 Getting Started

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

## Configure Environment Variables

Create:

```bash
.env
```

Add:

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

---

## Database Setup

Generate Prisma Client:

```bash
npm run db:generate
```

Push Schema:

```bash
npm run db:push
```

---

## Start Development Server

```bash
npm run dev
```

Visit:

```text
http://localhost:3000
```

---

# 📜 Available Scripts

| Command | Description |
|----------|------------|
| npm run dev | Development Server |
| npm run build | Production Build |
| npm run start | Production Server |
| npm run lint | Lint Project |
| npm run db:generate | Generate Prisma Client |
| npm run db:push | Push Database Schema |
| npm run db:studio | Open Prisma Studio |
| npm run check-env | Validate Environment |
| npm run vercel-build | Vercel Build Process |

---

# 🔌 API Reference

## Authentication

| Endpoint | Method |
|-----------|---------|
| /api/auth/register | POST |
| /api/auth/login | POST |
| /api/auth/me | GET, PATCH |
| /api/auth/[...nextauth] | NextAuth |

---

## Files

| Endpoint | Method |
|-----------|---------|
| /api/files | GET, POST |
| /api/files/[id] | GET, PATCH, DELETE |
| /api/files/[id]/content | GET, PUT |
| /api/files/[id]/download | GET |
| /api/files/[id]/share | POST |
| /api/files/[id]/share/link | POST |
| /api/files/presign | POST |
| /api/files/confirm | POST |
| /api/files/trash | POST |

---

## AI Services

| Endpoint | Method |
|-----------|---------|
| /api/summarize | POST |
| /api/files/[id]/summarize | POST |
| /api/ai/search | POST |

---

## Sharing & Storage

| Endpoint | Method |
|-----------|---------|
| /api/storage | GET |
| /api/share/[id] | GET, POST |
| /api/drop-links | GET, POST |
| /api/drop-links/[token] | GET, POST |

---

# 🔒 Security

CloudDrive follows modern security best practices.

### Security Features

- JWT Verification
- Session Management
- Password Hashing
- Secure Upload URLs
- Protected APIs
- Role-Based Access Validation
- Share Token Validation
- Storage Access Controls

---

# 🚢 Deployment

## Deployment Checklist

- Configure PostgreSQL
- Configure Supabase Storage
- Configure Environment Variables
- Generate Prisma Client
- Set NEXTAUTH_URL
- Configure Groq API Key
- Verify Storage Bucket Access

---

## Build Application

```bash
npm run build
```

---

## Start Production Server

```bash
npm run start
```

---

# 🗺 Roadmap

### Upcoming Features

- Real-Time Collaboration
- File Version History
- OCR Support
- Team Workspaces
- Activity Timeline
- File Comments
- Advanced Permissions
- AI Auto Classification
- Desktop Application
- WebDAV Support

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push your branch
5. Open a Pull Request

---

# 📄 License

Licensed under the MIT License.

---

<div align="center">

## ☁️ CloudDrive

### Intelligent Cloud Storage for Modern Workflows

<p align="center">
<img src="https://skillicons.dev/icons?i=nextjs,typescript,react,postgres,prisma,supabase" />
</p>

Built with ❤️ using Next.js, TypeScript, Prisma, Supabase, PostgreSQL, and AI.

</div>
