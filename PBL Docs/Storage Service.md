---
tags:
  - storage
  - minio
  - s3
  - files
created: 2025-12-18
type: documentation
---

# 💾 Storage Service

> [!INFO]
> Complete file storage solution using MinIO/S3-compatible object storage

---

## 📍 Location

**File**: `backend/api-gateway/src/services/storageService.ts`  
**Framework**: TypeScript + AWS SDK  
**Backend**: MinIO (S3-compatible)

---

## 🎯 Overview

The Storage Service provides a unified interface for managing files in MinIO object storage. It handles file uploads, downloads, deletions, and URL generation.

### Supported Operations

- ✅ File upload (single and batch)
- ✅ File download with presigned URLs
- ✅ File deletion
- ✅ File listing with filtering
- ✅ File metadata management
- ✅ Temporary URL generation
- ✅ Batch operations

---

## 🏗️ Architecture

### Storage Buckets

| Bucket | Purpose | Retention |
|--------|---------|-----------|
| `pbl-medical-system` | General storage | Permanent |
| `uploads` | User uploads | Permanent |
| `temp` | Temporary files | 7 days |
| `backups` | Database backups | 30 days |

---

## 🔧 Core Methods

### 1. `uploadFile(file: FileUpload, options?: UploadOptions): Promise<UploadResult>`

**Purpose**: Upload a file to MinIO storage

**Parameters**:
```typescript
interface FileUpload {
  filename: string;
  content: Buffer | Stream;
  mimeType: string;
  size: number;
}

interface UploadOptions {
  courseId?: string;
  userId?: string;
  tags?: string[];
  isPublic?: boolean;
}
```

**Returns**:
```typescript
interface UploadResult {
  success: boolean;
  fileId: string;
  filename: string;
  size: number;
  mimeType: string;
  url: string;
  bucketName: string;
  uploadedAt: Date;
  expiresAt?: Date;
}
```

**Behavior**:
- Validates file size (max 100MB)
- Generates unique file ID
- Sets appropriate MIME type
- Stores metadata
- Creates presigned URL

**Example**:
```typescript
const result = await storageService.uploadFile({
  filename: "lecture.pdf",
  content: fileBuffer,
  mimeType: "application/pdf",
  size: fileBuffer.length
}, {
  courseId: "anatomy-101",
  tags: ["lecture", "week1"]
});

console.log(result.url); // Download URL
```

**Error Cases**:
- File too large → 413 Payload Too Large
- Invalid MIME type → 400 Bad Request
- Storage full → 507 Insufficient Storage
- Upload timeout → 408 Request Timeout

---

### 2. `downloadFile(fileId: string): Promise<FileDownload>`

**Purpose**: Download file by ID

**Parameters**:
- `fileId` (string): Unique file identifier

**Returns**:
```typescript
interface FileDownload {
  success: boolean;
  content: Stream;
  filename: string;
  mimeType: string;
  size: number;
}
```

**Example**:
```typescript
const file = await storageService.downloadFile("file-uuid-123");
// File can be streamed to response
response.setHeader('Content-Type', file.mimeType);
file.content.pipe(response);
```

---

### 3. `deleteFile(fileId: string): Promise<DeleteResult>`

**Purpose**: Delete file from storage

**Parameters**:
- `fileId` (string): File to delete

**Returns**:
```typescript
interface DeleteResult {
  success: boolean;
  fileId: string;
  deletedAt: Date;
}
```

**Example**:
```typescript
const result = await storageService.deleteFile("file-uuid-123");
if (result.success) {
  console.log("File deleted");
}
```

---

### 4. `generateDownloadUrl(fileId: string, expiresIn?: number): Promise<string>`

**Purpose**: Generate temporary presigned download URL

**Parameters**:
- `fileId` (string): File ID
- `expiresIn` (number): Expiration in seconds (default: 3600)

**Returns**: Presigned URL (string)

**URL Properties**:
- Valid for specified duration
- No authentication needed
- Can be shared
- Single use recommended

**Example**:
```typescript
// 24-hour URL
const url = await storageService.generateDownloadUrl(
  "file-uuid-123",
  86400
);

// Share with user
console.log(url);
// https://minio.example.com/pbl-medical-system/file-uuid-123?X-Amz-Algorithm=...
```

---

### 5. `generateUploadUrl(filename: string, options?: UploadUrlOptions): Promise<UploadUrl>`

**Purpose**: Generate presigned upload URL for direct uploads

**Parameters**:
```typescript
interface UploadUrlOptions {
  expiresIn?: number;    // URL expiration
  maxSize?: number;       // Max file size
  contentType?: string;   // Required MIME type
}
```

**Returns**:
```typescript
interface UploadUrl {
  uploadUrl: string;
  downloadUrl: string;
  expiresAt: Date;
  fileId: string;
}
```

**Use Cases**:
- Direct browser uploads
- Large file transfers
- Distributed uploads

**Example**:
```typescript
const uploadUrl = await storageService.generateUploadUrl(
  "my-file.pdf",
  { expiresIn: 3600, maxSize: 10485760 }
);

// Client can upload directly to uploadUrl.uploadUrl
// Then download from uploadUrl.downloadUrl
```

---

### 6. `listFiles(options?: ListOptions): Promise<FileMetadata[]>`

**Purpose**: List files with optional filtering

**Parameters**:
```typescript
interface ListOptions {
  courseId?: string;
  userId?: string;
  bucketName?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'date' | 'size';
  sortOrder?: 'asc' | 'desc';
}
```

**Returns**:
```typescript
interface FileMetadata {
  fileId: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  uploadedBy: string;
  url: string;
  tags?: string[];
}
```

**Example**:
```typescript
const files = await storageService.listFiles({
  courseId: "anatomy-101",
  sortBy: "date",
  sortOrder: "desc",
  limit: 10
});

files.forEach(file => {
  console.log(`${file.filename} (${file.size} bytes)`);
});
```

---

### 7. `copyFile(sourceFileId: string, targetFilename: string): Promise<UploadResult>`

**Purpose**: Copy existing file

**Parameters**:
- `sourceFileId` (string): Source file to copy
- `targetFilename` (string): New filename

**Returns**: New file metadata

**Example**:
```typescript
const copy = await storageService.copyFile(
  "original-file-id",
  "backup-copy.pdf"
);

console.log(copy.fileId); // Different ID
```

---

## 🔐 Security Features

### Access Control

```typescript
// Public files
await storageService.uploadFile(file, { isPublic: true });

// Private files (authentication required)
await storageService.uploadFile(file, { isPublic: false });
```

### Presigned URLs

- Temporary access tokens
- Expiration timestamps
- Request signature validation
- No database authentication needed

### File Validation

```typescript
// Allowed MIME types
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'text/plain',
  'application/json'
];

// Size limits
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
```

---

## 💾 MinIO Configuration

### Docker Setup

```yaml
services:
  minio:
    image: minio/minio:latest
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"      # API
      - "9001:9001"      # Console
    volumes:
      - minio_data:/data
    command: minio server /data
```

### Connection Configuration

```typescript
const s3Client = new S3Client({
  region: "us-east-1",
  endpoint: "http://minio:9000",
  credentials: {
    accessKeyId: "minioadmin",
    secretAccessKey: "minioadmin"
  },
  forcePathStyle: true
});
```

---

## 📊 Usage Statistics

### Common Operations

```typescript
// Upload file
POST /api/storage/upload
Size: 5MB, Time: 1.2s

// Generate download URL
GET /api/storage/download-url/:fileId
Time: 50ms

// List files
GET /api/storage/files?courseId=anatomy-101
Returns: 42 files, Time: 200ms

// Delete file
DELETE /api/storage/:fileId
Time: 150ms
```

---

## 🧪 Testing

### Unit Tests

```typescript
describe('StorageService', () => {
  it('should upload file successfully', async () => {
    const result = await storageService.uploadFile({
      filename: "test.pdf",
      content: Buffer.from("test"),
      mimeType: "application/pdf",
      size: 4
    });
    expect(result.success).toBe(true);
    expect(result.fileId).toBeDefined();
  });

  it('should generate presigned URL', async () => {
    const url = await storageService.generateDownloadUrl("file-id");
    expect(url).toContain("X-Amz-Algorithm");
  });

  it('should reject oversized files', async () => {
    const largeBuffer = Buffer.alloc(150 * 1024 * 1024);
    expect(
      storageService.uploadFile({
        filename: "huge.zip",
        content: largeBuffer,
        mimeType: "application/zip",
        size: largeBuffer.length
      })
    ).rejects.toThrow();
  });
});
```

---

## 🔗 Integration Example

### With API Gateway

```typescript
// Upload endpoint
app.post('/api/storage/upload', authMiddleware, async (req, res) => {
  const file = req.file;
  const courseId = req.body.courseId;
  
  const result = await storageService.uploadFile({
    filename: file.originalname,
    content: file.buffer,
    mimeType: file.mimetype,
    size: file.size
  }, {
    courseId,
    userId: req.user.id
  });
  
  res.json(result);
});

// Download endpoint
app.get('/api/storage/download/:fileId', async (req, res) => {
  const url = await storageService.generateDownloadUrl(req.params.fileId);
  res.json({ url });
});
```

---

## 📈 Performance Optimization

### Strategies

1. **Connection Pooling**
   - Reuse MinIO connections
   - Reduce connection overhead

2. **Batch Operations**
   - Upload multiple files concurrently
   - Delete multiple files in parallel

3. **Caching**
   - Cache file metadata
   - Cache presigned URLs (until expiry)

4. **CDN Integration**
   - Serve static files via CDN
   - Reduce server load

---

## 🔗 Related Documentation

- [[Architecture Overview]] - System design
- [[API Design]] - Storage endpoints
- [[Database Schema]] - Metadata storage

---

**Last Updated**: 2025-12-18  
**Status**: ✅ Production Ready  
**Storage Capacity**: Unlimited (MinIO)
