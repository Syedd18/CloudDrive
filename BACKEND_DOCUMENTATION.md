# CloudDrive Backend API Documentation

## 🏗️ Architecture Overview

### **Technology Stack**
- **Framework**: Next.js 14 (App Router) with TypeScript
- **Database**: MySQL with Prisma ORM
- **Cloud Storage**: AWS S3
- **Authentication**: JWT (JSON Web Tokens)
- **Logging**: Winston
- **Validation**: Zod

### **Layered Architecture (MVC Pattern)**

```
┌─────────────────────────────────────────────┐
│           Frontend (React/Next.js)          │
└─────────────────┬───────────────────────────┘
                  │ HTTP/REST
┌─────────────────▼───────────────────────────┐
│         API Routes (Controllers)            │
│   - Request validation                      │
│   - Response formatting                     │
│   - Error handling                          │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│          Services (Business Logic)          │
│   - Authentication logic                    │
│   - File operations orchestration           │
│   - S3 integration                          │
│   - Audit logging                           │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│       Repositories (Data Access)            │
│   - Database queries                        │
│   - Data mapping                            │
│   - Transaction management                  │
└─────────────────┬───────────────────────────┘
                  │
     ┌────────────┴────────────┐
     │                         │
┌────▼─────┐            ┌─────▼──────┐
│  MySQL   │            │   AWS S3   │
│ Database │            │  Storage   │
└──────────┘            └────────────┘
```

### **Folder Structure**

```
src/
├── app/
│   └── api/                    # API Routes (Controllers)
│       ├── auth/
│       │   ├── register/
│       │   ├── login/
│       │   └── me/
│       ├── files/
│       │   ├── [id]/
│       │   │   ├── download/
│       │   │   └── share/
│       │   └── route.ts
│       └── storage/
├── services/                   # Business Logic Layer
│   ├── auth.service.ts
│   └── file.service.ts
├── repositories/               # Data Access Layer
│   ├── user.repository.ts
│   └── file.repository.ts
├── lib/                        # Utilities & Configuration
│   ├── prisma.ts              # Database client
│   ├── s3.ts                  # AWS S3 integration
│   ├── auth.ts                # JWT utilities
│   ├── validation.ts          # Request validation
│   ├── errors.ts              # Error classes
│   └── logger.ts              # Winston logger
└── types/                      # TypeScript types

prisma/
└── schema.prisma              # Database schema

.env                           # Environment variables
```

---

## 📡 API Endpoints

### **Base URL**: `http://localhost:3000/api`

---

## 🔐 Authentication APIs

### 1. **Register User**
**POST** `/api/auth/register`

Creates a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

---

### 2. **Login User**
**POST** `/api/auth/login`

Authenticates existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. **Get Current User**
**GET** `/api/auth/me`

Gets authenticated user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://...",
    "role": "user",
    "createdAt": "2026-01-24T..."
  }
}
```

---

## 📁 File Management APIs

### 4. **Upload File**
**POST** `/api/files`

Uploads file to S3 and creates database record.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**
- `file`: File object (required)
- `folderId`: UUID (optional) - Parent folder ID

**Response (201):**
```json
{
  "file": {
    "id": "uuid",
    "name": "document.pdf",
    "type": "pdf",
    "size": 1024000,
    "mimeType": "application/pdf",
    "s3Url": "https://...",
    "starred": false,
    "trashed": false,
    "createdAt": "2026-01-24T...",
    "updatedAt": "2026-01-24T..."
  }
}
```

**Flow:**
1. Validate file size and type
2. Upload to S3 bucket (organized by user: `users/{userId}/{uuid}.ext`)
3. Create database record with S3 metadata
4. Create audit log entry
5. Return file metadata

**S3 Key Format:** `users/{userId}/{uuid}.{extension}`

---

### 5. **Get Files (List)**
**GET** `/api/files`

Retrieves files with filtering and pagination.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `starred`: boolean - Filter starred files
- `trashed`: boolean - Filter trashed files
- `folderId`: UUID - Filter by folder
- `search`: string - Search by filename
- `type`: string - Filter by file type
- `sortBy`: name|size|updatedAt|createdAt
- `sortOrder`: asc|desc
- `page`: number (default: 1)
- `limit`: number (default: 50)

**Response (200):**
```json
{
  "files": [
    {
      "id": "uuid",
      "name": "document.pdf",
      "type": "pdf",
      "size": 1024000,
      "starred": false,
      "trashed": false,
      "shared": true,
      "sharedWith": ["user2@example.com"],
      "modified": "2026-01-24T...",
      "recent": true
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "totalPages": 2
  }
}
```

---

### 6. **Get File by ID**
**GET** `/api/files/{id}`

Retrieves single file details.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "file": {
    "id": "uuid",
    "name": "document.pdf",
    "type": "pdf",
    "size": 1024000,
    "mimeType": "application/pdf",
    "starred": false,
    "trashed": false,
    "shared": true,
    "sharedWith": ["user2@example.com"],
    "createdAt": "2026-01-24T...",
    "updatedAt": "2026-01-24T..."
  }
}
```

---

### 7. **Update File**
**PATCH** `/api/files/{id}`

Updates file metadata (rename, star, trash).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "new-name.pdf",
  "starred": true,
  "trashed": false
}
```

**Response (200):**
```json
{
  "message": "File updated successfully"
}
```

---

### 8. **Download File**
**GET** `/api/files/{id}/download`

Generates signed S3 URL for secure download.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "downloadUrl": "https://clouddrive-storage.s3.amazonaws.com/users/uuid/file.pdf?X-Amz-..."
}
```

**Notes:**
- URL expires after 1 hour (configurable)
- Signed with AWS credentials
- Includes audit log entry

---

### 9. **Delete File (Permanent)**
**DELETE** `/api/files/{id}`

Permanently deletes file from S3 and database.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "File deleted permanently"
}
```

**Flow:**
1. Verify file ownership
2. Delete from S3 bucket
3. Delete database record
4. Create audit log entry

---

### 10. **Share File**
**POST** `/api/files/{id}/share`

Shares file with other users by email.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "emails": ["user2@example.com", "user3@example.com"],
  "canEdit": false
}
```

**Response (200):**
```json
{
  "shares": [
    {
      "id": "uuid",
      "email": "user2@example.com",
      "canEdit": false,
      "createdAt": "2026-01-24T..."
    }
  ]
}
```

---

### 11. **Get Storage Statistics**
**GET** `/api/storage`

Retrieves user storage usage and file statistics.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "storage": {
    "used": 5368709120,
    "total": 16106127360,
    "percentage": 33.33
  },
  "counts": {
    "total": 150,
    "starred": 12,
    "trashed": 5,
    "shared": 8
  }
}
```

---

## 🔒 Security Features

### **Authentication Middleware**
- JWT token validation on protected routes
- Token expiration: 30 days
- Secure password hashing (bcrypt, 12 rounds)

### **Authorization**
- User-based file access control
- Shared files permission validation
- Role-based access control (RBAC) ready

### **Input Validation**
- Zod schema validation on all endpoints
- File type and size restrictions
- SQL injection prevention (Prisma ORM)

### **Rate Limiting**
- 100 requests per 15 minutes per IP
- Configurable via environment variables

### **Cloud Security**
- S3 server-side encryption (AES256)
- Signed URLs with expiration
- User-isolated S3 folder structure

---

## 📊 Database Schema

### **Users Table**
```sql
- id (UUID, Primary Key)
- email (String, Unique)
- name (String)
- password (String, Hashed)
- avatar (String, Optional)
- role (String, default: 'user')
- isActive (Boolean)
- createdAt (DateTime)
- updatedAt (DateTime)
```

### **Files Table**
```sql
- id (UUID, Primary Key)
- name (String)
- originalName (String)
- type (String)
- size (BigInt)
- mimeType (String)
- s3Key (String, Unique)
- s3Url (String)
- thumbnail (String, Optional)
- starred (Boolean)
- trashed (Boolean)
- trashedAt (DateTime, Optional)
- folderId (UUID, Foreign Key, Optional)
- userId (UUID, Foreign Key)
- createdAt (DateTime)
- updatedAt (DateTime)
```

### **Shares Table**
```sql
- id (UUID, Primary Key)
- fileId (UUID, Foreign Key)
- email (String)
- canEdit (Boolean)
- createdAt (DateTime)
- updatedAt (DateTime)
```

### **AuditLogs Table**
```sql
- id (UUID, Primary Key)
- userId (UUID)
- action (String)
- resource (String)
- details (Text, Optional)
- ipAddress (String, Optional)
- userAgent (String, Optional)
- createdAt (DateTime)
```

---

## ☁️ Cloud Integration

### **AWS S3 Configuration**

**Bucket Structure:**
```
clouddrive-storage/
└── users/
    ├── {user-id-1}/
    │   ├── {uuid-1}.pdf
    │   ├── {uuid-2}.jpg
    │   └── {uuid-3}.docx
    └── {user-id-2}/
        └── {uuid-4}.mp4
```

**Key Features:**
- **Scalability**: Unlimited storage capacity
- **Durability**: 99.999999999% (11 9's)
- **Availability**: 99.99%
- **Security**: Server-side encryption, IAM policies
- **Cost**: Pay-as-you-go pricing

**S3 Operations:**
- `PutObject`: Upload files
- `GetObject`: Download files (via signed URLs)
- `DeleteObject`: Remove files
- `HeadObject`: Check file existence

---

## 📈 Scalability & Performance

### **Horizontal Scaling**
- Stateless backend (JWT auth, no sessions)
- Database connection pooling
- Can deploy multiple instances behind load balancer

### **Database Optimization**
- Indexed queries on userId, fileId, s3Key
- Connection pooling with Prisma
- Prepared statements for SQL injection prevention

### **Caching Strategy** (Future Enhancement)
- Redis for session management
- CloudFront CDN for S3 file delivery
- Database query result caching

### **Async Processing**
- File uploads are asynchronous
- Audit logging doesn't block main operations
- Background jobs for thumbnail generation

---

## 🚀 Deployment

### **Environment Variables**
```env
# Database
DATABASE_URL=mysql://user:pass@host:3306/db

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_S3_BUCKET_NAME=clouddrive-storage

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=30d

# Limits
MAX_FILE_SIZE=104857600
```

### **Cloud Deployment Options**
1. **AWS**
   - EC2 instances
   - ECS containers
   - Lambda (serverless)
   - RDS for MySQL
   - S3 for storage

2. **Vercel** (Recommended for Next.js)
   - Automatic scaling
   - Global CDN
   - Serverless functions
   - External MySQL + S3

3. **Docker**
   - Containerized deployment
   - Kubernetes orchestration
   - Easy scaling and management

---

## 🛡️ Error Handling

### **HTTP Status Codes**
- `200 OK`: Successful operation
- `201 Created`: Resource created
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Missing/invalid auth
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate resource
- `500 Internal Server Error`: Server error

### **Error Response Format**
```json
{
  "error": "Error message",
  "statusCode": 400,
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

---

## 📝 Logging & Monitoring

### **Winston Logger**
- Console logging (development)
- File logging (production)
- Log levels: error, warn, info, debug
- Separate log files for errors and exceptions

### **Audit Trail**
Every critical operation is logged:
- File uploads
- File downloads
- File deletions
- File sharing
- Authentication events

---

## 🔄 Future Enhancements

1. **Real-time Collaboration**: WebSockets for live file editing
2. **Thumbnail Generation**: Lambda functions for image previews
3. **Virus Scanning**: ClamAV integration for security
4. **Rate Limiting**: Redis-based distributed rate limiting
5. **Email Notifications**: SES for share notifications
6. **Search**: ElasticSearch for full-text file search
7. **Versioning**: S3 versioning for file history
8. **Backup**: Automated database and S3 backups

---

## 📚 API Testing

### **Example with cURL**

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**Upload File:**
```bash
curl -X POST http://localhost:3000/api/files \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/file.pdf"
```

**Get Files:**
```bash
curl http://localhost:3000/api/files?page=1&limit=20 \
  -H "Authorization: Bearer <token>"
```

---

This backend architecture demonstrates enterprise-level cloud computing principles with proper separation of concerns, security, scalability, and maintainability.
