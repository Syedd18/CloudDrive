# 🧪 API Testing Guide

## Quick Test Commands

### 1. **Register a New User**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"Test1234\",\"name\":\"Test User\"}"
```

**Expected Response:**
```json
{
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User",
    "avatar": "..."
  },
  "token": "eyJhbGc..."
}
```

---

### 2. **Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"Test1234\"}"
```

**Save the token from response!**

---

### 3. **Get Current User**
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 4. **Get Storage Stats**
```bash
curl http://localhost:3000/api/storage \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 5. **Upload a File**
```bash
curl -X POST http://localhost:3000/api/files \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/your/file.pdf"
```

---

### 6. **List Files**
```bash
# All files
curl "http://localhost:3000/api/files" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Starred files only
curl "http://localhost:3000/api/files?starred=true" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Trashed files
curl "http://localhost:3000/api/files?trashed=true" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# With pagination
curl "http://localhost:3000/api/files?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Search files
curl "http://localhost:3000/api/files?search=document" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 7. **Get Single File**
```bash
curl "http://localhost:3000/api/files/FILE_ID" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 8. **Update File (Star)**
```bash
curl -X PATCH "http://localhost:3000/api/files/FILE_ID" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"starred\":true}"
```

---

### 9. **Move to Trash**
```bash
curl -X PATCH "http://localhost:3000/api/files/FILE_ID" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"trashed\":true}"
```

---

### 10. **Download File (Get Signed URL)**
```bash
curl "http://localhost:3000/api/files/FILE_ID/download" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Returns a signed S3 URL valid for 1 hour**

---

### 11. **Share File**
```bash
curl -X POST "http://localhost:3000/api/files/FILE_ID/share" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"emails\":[\"friend@example.com\"],\"canEdit\":false}"
```

---

### 12. **Delete File Permanently**
```bash
curl -X DELETE "http://localhost:3000/api/files/FILE_ID" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Windows PowerShell Examples

If using PowerShell, use `Invoke-RestMethod`:

### Register
```powershell
$body = @{
    email = "test@example.com"
    password = "Test1234"
    name = "Test User"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

### Login and Save Token
```powershell
$loginBody = @{
    email = "test@example.com"
    password = "Test1234"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body $loginBody

$token = $response.token
Write-Host "Token: $token"
```

### Get Files
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/files" `
  -Method Get `
  -Headers $headers
```

### Upload File
```powershell
$filePath = "C:\path\to\file.pdf"
$boundary = [System.Guid]::NewGuid().ToString()

$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/files" `
  -Method Post `
  -Headers $headers `
  -InFile $filePath
```

---

## Testing Workflow

### Complete Test Flow:
1. ✅ Register a user → Get token
2. ✅ Login → Verify token works
3. ✅ Get current user → Verify authentication
4. ✅ Get storage stats → Should show 0 files
5. ✅ Upload a file → Get file ID
6. ✅ List files → Should see uploaded file
7. ✅ Star the file → Verify update
8. ✅ Get download URL → Should return signed S3 URL
9. ✅ Share file → Add email
10. ✅ Move to trash → Verify trashed
11. ✅ List trashed files → Should see file
12. ✅ Delete permanently → File removed

---

## Expected Errors

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```
**Fix:** Add valid token to Authorization header

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```
**Fix:** Check request body format

### 404 Not Found
```json
{
  "error": "File not found"
}
```
**Fix:** Verify file ID and ownership

### 409 Conflict
```json
{
  "error": "User already exists"
}
```
**Fix:** Use different email address

### 429 Too Many Requests
```json
{
  "error": "Too many requests",
  "retryAfter": 60
}
```
**Fix:** Wait and retry after specified seconds

---

## Postman Collection

You can import this into Postman for easier testing:

1. Create new collection "CloudDrive API"
2. Add variable `baseUrl` = `http://localhost:3000/api`
3. Add variable `token` = (set after login)
4. Add all endpoints above as requests
5. Use `{{baseUrl}}` and `{{token}}` in requests

---

## Browser Testing

You can also test in browser console:

```javascript
// Register
fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'Test1234',
    name: 'Test User'
  })
}).then(r => r.json()).then(console.log);

// Login
fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'Test1234'
  })
}).then(r => r.json()).then(data => {
  localStorage.setItem('token', data.token);
  console.log('Token saved:', data.token);
});

// Get files
const token = localStorage.getItem('token');
fetch('http://localhost:3000/api/files', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log);
```

---

## 🎉 Your Backend is Ready!

All endpoints are now using:
- ✅ Service layer (business logic)
- ✅ Repository layer (database access)
- ✅ Authentication middleware
- ✅ Error handling middleware
- ✅ Rate limiting
- ✅ Request validation
- ✅ Audit logging

**Start testing your API!** 🚀
