---
tags:
  - api
  - rest
  - endpoints
  - documentation
created: 2025-12-18
type: documentation
---

# 📡 API Design & Endpoints

> [!INFO]
> Complete REST API documentation for the PBL Medical System

---

## 🎯 Base Configuration

**Base URL**: `http://localhost:3001/api`  
**Authentication**: JWT Token (Bearer scheme)  
**Content-Type**: `application/json`  
**Response Format**: JSON

---

## 🔐 Authentication

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 📚 Courses API

### List Courses
```http
GET /courses?page=1&limit=10&search=anatomy
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Human Anatomy",
      "description": "Study human anatomy",
      "color": "#FF6B6B",
      "icon": "📚",
      "cardCount": 42,
      "createdAt": "2025-12-18T00:00:00Z",
      "updatedAt": "2025-12-18T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5
  }
}
```

### Create Course
```http
POST /courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Human Anatomy",
  "description": "Study human anatomy",
  "color": "#FF6B6B",
  "icon": "📚"
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Human Anatomy",
    "description": "Study human anatomy",
    "color": "#FF6B6B",
    "icon": "📚",
    "createdAt": "2025-12-18T00:00:00Z"
  }
}
```

### Get Course
```http
GET /courses/:courseId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Human Anatomy",
    "description": "Study human anatomy",
    "color": "#FF6B6B",
    "icon": "📚",
    "cardCount": 42,
    "createdAt": "2025-12-18T00:00:00Z"
  }
}
```

### Update Course
```http
PUT /courses/:courseId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Advanced Human Anatomy",
  "description": "Advanced anatomy study",
  "color": "#FF8B8B",
  "icon": "🏥"
}

Response:
{
  "success": true,
  "data": { /* updated course */ }
}
```

### Delete Course
```http
DELETE /courses/:courseId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Course deleted successfully"
}
```

---

## 🎴 Flashcards API

### List Flashcards
```http
GET /flashcards?courseId=uuid&status=due&page=1&limit=20
Authorization: Bearer <token>

Query Parameters:
- courseId (required): UUID of the course
- status: due | pending | completed
- page: pagination page
- limit: items per page
- search: search term

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "front": "What is the heart?",
      "back": "The heart is...",
      "difficulty": "medium",
      "interval": 7,
      "ease": 2.5,
      "nextReview": "2025-12-25T00:00:00Z",
      "status": "due"
    }
  ],
  "pagination": { /* ... */ }
}
```

### Create Flashcard
```http
POST /flashcards
Authorization: Bearer <token>
Content-Type: application/json

{
  "courseId": "uuid",
  "front": "What is the heart?",
  "back": "The heart is a muscular organ...",
  "difficulty": "medium"
}

Response:
{
  "success": true,
  "data": { /* created flashcard */ }
}
```

### Review Flashcard
```http
POST /flashcards/:cardId/review
Authorization: Bearer <token>
Content-Type: application/json

{
  "quality": 4
}

Quality Scale:
0 - Complete blackout
1 - Incorrect response
2 - Correct response with serious difficulty
3 - Correct response with much difficulty
4 - Correct response with little difficulty
5 - Prefect response

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "nextReview": "2025-12-25T00:00:00Z",
    "interval": 7,
    "ease": 2.5
  }
}
```

### Batch Review
```http
POST /flashcards/batch/review
Authorization: Bearer <token>
Content-Type: application/json

{
  "reviews": [
    {
      "cardId": "uuid",
      "quality": 4
    },
    {
      "cardId": "uuid",
      "quality": 3
    }
  ]
}

Response:
{
  "success": true,
  "data": [
    { /* updated cards */ }
  ]
}
```

### Update Flashcard
```http
PUT /flashcards/:cardId
Authorization: Bearer <token>
Content-Type: application/json

{
  "front": "Updated question?",
  "back": "Updated answer",
  "difficulty": "hard"
}

Response:
{
  "success": true,
  "data": { /* updated flashcard */ }
}
```

### Delete Flashcard
```http
DELETE /flashcards/:cardId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Flashcard deleted"
}
```

---

## 📁 Storage API

### Upload File
```http
POST /storage/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- file: <binary file>
- courseId: uuid (optional)

Response:
{
  "success": true,
  "data": {
    "fileId": "uuid",
    "filename": "document.pdf",
    "size": 2048576,
    "url": "https://storage.example.com/...",
    "uploadedAt": "2025-12-18T00:00:00Z"
  }
}
```

### List Files
```http
GET /storage/files?courseId=uuid
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "fileId": "uuid",
      "filename": "document.pdf",
      "size": 2048576,
      "url": "https://storage.example.com/...",
      "uploadedAt": "2025-12-18T00:00:00Z"
    }
  ]
}
```

### Download File
```http
GET /storage/download/:fileId
Authorization: Bearer <token>

Response:
- Binary file content
- Content-Disposition: attachment
```

### Delete File
```http
DELETE /storage/:fileId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "File deleted"
}
```

---

## 🔄 Obsidian Sync API

### Get Sync Status
```http
GET /sync/status
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "lastSync": "2025-12-18T00:00:00Z",
    "notesCount": 42,
    "syncEnabled": true,
    "status": "synced"
  }
}
```

### Start Sync
```http
POST /sync/start
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "syncId": "uuid",
    "status": "running",
    "startedAt": "2025-12-18T00:00:00Z"
  }
}
```

### Get Sync Progress
```http
GET /sync/progress/:syncId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "syncId": "uuid",
    "status": "running",
    "progress": 65,
    "processedNotes": 27,
    "totalNotes": 42,
    "startedAt": "2025-12-18T00:00:00Z",
    "estimatedTime": 120
  }
}
```

### List Synced Notes
```http
GET /sync/notes?page=1&limit=20
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "noteId": "uuid",
      "title": "Cardiac Physiology",
      "tags": ["anatomy", "cardiology"],
      "category": "Physiology",
      "difficulty": "intermediate",
      "cardCount": 8,
      "syncedAt": "2025-12-18T00:00:00Z"
    }
  ],
  "pagination": { /* ... */ }
}
```

---

## 🤖 AI Service API

### Generate Text
```http
POST /ai/generate-text
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "Explain cardiac physiology in detail",
  "provider": "openai",
  "maxTokens": 500
}

Response:
{
  "success": true,
  "data": {
    "text": "Cardiac physiology is...",
    "tokensUsed": 342,
    "model": "gpt-3.5-turbo"
  }
}
```

### Generate Flashcards
```http
POST /ai/generate-flashcards
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Cardiac physiology content...",
  "count": 5,
  "courseId": "uuid",
  "provider": "openai"
}

Response:
{
  "success": true,
  "data": [
    {
      "front": "What is the cardiac cycle?",
      "back": "The cardiac cycle is...",
      "difficulty": "medium"
    }
  ]
}
```

### Answer with Context
```http
POST /ai/answer-with-context
Authorization: Bearer <token>
Content-Type: application/json

{
  "question": "What is the function of the heart?",
  "context": "From cardiology notes...",
  "provider": "openai"
}

Response:
{
  "success": true,
  "data": {
    "answer": "The heart is...",
    "tokensUsed": 245
  }
}
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      "Email is required",
      "Password must be at least 8 characters"
    ]
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing authentication token"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You don't have permission to access this resource"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred",
    "requestId": "uuid"
  }
}
```

---

## 🔗 Related Documentation

- [[JWT Security Implementation]] - Authentication details
- [[Architecture Overview]] - System design
- [[API Response Standards]] - Response format

---

**Last Updated**: 2025-12-18  
**Status**: ✅ Complete
