# Authentication System

## Overview

The PBL Medical System uses **Next-Auth** (v5) with a **Credentials provider** for authentication. The system is designed to work seamlessly in both development (with mocked API responses) and production (with real backend).

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                   │
├─────────────────────────────────────────────────────────┤
│  Pages:                                                  │
│  - /auth/login          → Login form                   │
│  - /auth/register       → Registration form            │
│  - /auth/error          → Error handling               │
│  - /dashboard           → Protected route              │
│  - /flashcards, /courses, /library → Protected        │
├─────────────────────────────────────────────────────────┤
│  API Routes:                                             │
│  - /api/auth/[...nextauth]  → Next-Auth handler        │
│  - /api/auth/register       → Custom register endpoint │
├─────────────────────────────────────────────────────────┤
│  Middleware:                                             │
│  - middleware.ts            → Route protection logic   │
├─────────────────────────────────────────────────────────┤
│  Configuration:                                          │
│  - auth.ts                  → Next-Auth config         │
└─────────────────────────────────────────────────────────┘
                           ↓
            ┌──────────────────────────────┐
            │    API Gateway Backend       │
            │  (Express/TypeScript)        │
            │                              │
            │  POST /auth/login            │
            │  POST /auth/register         │
            │  POST /auth/logout           │
            └──────────────────────────────┘
```

### Session Flow

```
1. User enters credentials (login/register)
   ↓
2. Submit to frontend handler
   ↓
3. Frontend calls backend API (/auth/login or /auth/register)
   ↓
4. Backend validates and returns JWT token
   ↓
5. Token stored in Next-Auth session
   ↓
6. Session available in middleware & client components
   ↓
7. Token sent in Authorization header for API requests
   ↓
8. Redirect to dashboard on success
```

## Key Files

### Configuration

**`auth.ts`** - Next-Auth Configuration
- Credentials provider pointing to backend `/auth/login`
- JWT session strategy with 30-day expiry
- Redirects configured for sign-in, register, and error pages
- Token automatically sent in API requests

```typescript
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        // Calls backend /auth/login
        const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH_LOGIN, {
          email: credentials.email,
          password: credentials.password,
        })
        // Returns: { id, email, name, token }
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
    newUser: '/auth/register',
    error: '/auth/error',
  },
  // ...
})
```

### Pages

**`app/auth/login/page.tsx`**
- Email/password form
- Error display
- Link to register
- Integration with `signIn()` from auth.ts
- Styled with medical color palette (primary blue)
- Dark mode support

**`app/auth/register/page.tsx`**
- Name/email/password form
- Password validation (min 8 chars)
- Confirm password validation
- Calls `/api/auth/register` endpoint
- Redirect to login on success
- Dark mode support

**`app/auth/error/page.tsx`**
- Error display with error code
- Retry and home buttons
- Styled as error page

### API Routes

**`app/api/auth/[...nextauth]/route.ts`**
- Default Next-Auth handler
- Delegates to `auth.ts` configuration
- Provides `/api/auth/signin`, `/api/auth/callback/credentials`, etc.

**`app/api/auth/register/route.ts`**
- Custom registration endpoint
- Validates inputs
- Calls backend `/auth/register`
- Returns user data on success

### Middleware & Protection

**`middleware.ts`**
- Protects routes: `/dashboard`, `/courses`, `/flashcards`, `/library`
- Redirects unauthenticated users to `/auth/login`
- Prevents authenticated users from accessing `/auth/login` or `/auth/register`
- Sets `callbackUrl` for redirect after login

### Components

**`app/components/Navbar.tsx`**
- Navigation bar present on all pages
- Shows user info when authenticated
- Sign out button
- Sign in/up links when unauthenticated
- Responsive design

**`app/layout.tsx`**
- Root layout wrapped with SessionProvider
- Enables session access in all child components
- Session fetched on server side

## Development vs Production

### Development Mode

**Mock API (MSW)**
- All API calls intercepted by Mock Service Worker
- No backend required
- Uses in-memory data store
- Demo credentials: `test@example.com` / `password123`

**To use in dev:**
```bash
npm run dev
# Open http://localhost:3010
# Use demo credentials on login page
```

### Production Mode

**Real Backend**
- API calls forwarded to actual backend
- JWT tokens validated by backend
- Session tokens stored in HTTP-only cookies
- Credentials securely transmitted

**Environment Variables:**
```bash
NEXT_PUBLIC_API_URL=https://api.example.com
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://app.example.com
```

## Credentials

### Development

**Demo User:**
- Email: `test@example.com`
- Password: `password123`

### Production

Create accounts through the `/auth/register` endpoint.

## Security Features

### Built-in Protections

✅ **HTTP-only Cookies**
- Session stored in secure HTTP-only cookies
- Protected from XSS attacks

✅ **CSRF Protection**
- Automatic CSRF token validation
- Configured in Next-Auth

✅ **Password Hashing**
- Backend uses bcrypt
- Passwords never stored in plaintext

✅ **Token Expiry**
- JWT tokens expire after 30 days
- Can be configured per use case

✅ **Secure Headers**
- Enforced via Next.js middleware
- Content-Security-Policy, X-Frame-Options, etc.

### Best Practices

```typescript
// ✅ DO: Protect sensitive routes with middleware
// middleware.ts protects /dashboard, etc.

// ✅ DO: Use useSession() to check auth
const { data: session } = useSession()
if (!session) redirect('/auth/login')

// ✅ DO: Send token in Authorization header
const response = await fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${session.accessToken}`
  }
})

// ❌ DON'T: Store tokens in localStorage
// Use session/cookies instead (already done)

// ❌ DON'T: Display credentials in console
console.log(session) // OK - session data only
console.log(password) // NEVER - sensitive data
```

## Testing

### Unit Tests

```bash
npm test -- __tests__/api-integration.test.ts
```

Tests JWT token management and API client integration.

### E2E Tests

```bash
npm run test:e2e
```

Tests user flows: login → dashboard → other pages.

## Customization

### Add New Protected Route

1. Create page in `app/[route]/page.tsx`
2. Add to `protectedRoutes` array in `middleware.ts`
3. Use `useSession()` hook for auth checks

```typescript
// middleware.ts
const protectedRoutes = [
  '/dashboard',
  '/courses',
  '/my-new-route', // ← Add here
]
```

### Change Session Expiry

```typescript
// auth.ts
session: {
  maxAge: 7 * 24 * 60 * 60, // 7 days instead of 30
}
```

### Add OAuth Provider

```typescript
// auth.ts
import GitHub from "next-auth/providers/github"

providers: [
  GitHub({
    clientId: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
  }),
  // ... Credentials provider
]
```

## Troubleshooting

### "Session undefined"

**Issue:** `useSession()` returns `null` on client component
**Solution:** Ensure page is wrapped with `SessionProvider` (already in root layout)

```typescript
// ✅ Correct
'use client'
import { useSession } from 'next-auth/react'

export default function Page() {
  const { data: session } = useSession()
  // session will be populated
}
```

### "Redirect loop"

**Issue:** Login page redirects to itself
**Solution:** Check middleware - ensure login page is NOT in `protectedRoutes`

```typescript
// middleware.ts
if (pathname.startsWith('/auth')) {
  // Allow /auth pages without session
  return NextResponse.next()
}
```

### "Invalid credentials error"

**Issue:** Login always fails even with correct password
**Solution:** 
1. Check backend `/auth/login` endpoint is working
2. Verify API URL in `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:3000`
3. Check MSW mocks are running in dev: `test@example.com` / `password123`

### "Token not sent in API requests"

**Issue:** Upstream API returns 401 Unauthorized
**Solution:** Verify JWT token is in Authorization header

```typescript
// lib/api.ts - Already configured
// Token automatically added to requests if session exists
headers: {
  'Authorization': `Bearer ${token}`
}
```

## Related Documentation

- [Next-Auth Official Docs](https://authjs.dev/)
- [Credentials Provider](https://authjs.dev/providers/credentials)
- [Middleware & Route Protection](https://authjs.dev/concepts/role-based-access-control)
- [JWT Sessions](https://authjs.dev/concepts/sessions#jwt)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review test files in `frontend/__tests__/api-integration.test.ts`
3. Check MSW handlers in `frontend/test/mocks/handlers.ts`
4. Open an issue on GitHub

---

**Last Updated:** 2024-01-20  
**Status:** ✅ Production Ready
