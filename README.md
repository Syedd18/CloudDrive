# ☁️ CloudDrive - Production-Ready Cloud Storage

A world-class, enterprise-grade cloud storage application built with **Next.js 14**, featuring a scalable backend architecture with **Supabase Storage** integration, **PostgreSQL** database, and **Supabase Auth**.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E)

---

## ✨ Features

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

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5.0 |
| **Styling** | Tailwind CSS 3.4 |
| **Database** | PostgreSQL (Supabase) with Prisma ORM |
| **Cloud Storage** | Supabase Storage |
| **Authentication** | Supabase Auth |
| **Validation** | Zod |
| **Logging** | Winston |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |

---

## 📁 Project Structure

```text
cloud-drive/
├── prisma/
│   └── schema.prisma              # Database schema (PostgreSQL)
├── public/                        # Static assets
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── api/                   # API Routes (Controllers)
│   │   ├── layout.tsx             # Root layout
│   │   └── globals.css            # Global styles
│   ├── components/                # React components
│   │   ├── layout/                # Layout (Navbar, Sidebar)
│   │   ├── files/                 # File UI (Card, List)
│   │   └── providers/             # Context providers (Theme, Supabase)
│   ├── lib/                       # Utilities & Infrastructure
│   │   ├── prisma.ts              # Database client
│   │   ├── supabase.ts            # Supabase client configuration
│   │   ├── validation.ts          # Zod schemas
│   │   └── logger.ts              # Winston logger
│   ├── repositories/              # Data Access Layer
│   │   ├── user.repository.ts     # User DB operations
│   │   └── file.repository.ts     # File DB operations
│   ├── services/                  # Business Logic Layer
│   │   ├── auth.service.ts        # Auth logic
│   │   └── file.service.ts        # File management & Storage logic
│   └── types/                     # TypeScript types
└── .env                           # Environment variables
