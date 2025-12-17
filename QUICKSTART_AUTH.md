# 🚀 Quick Start: Authentication System

## For Users

### Login to Your Account

1. Visit: **http://localhost:3010**
2. Click **"Sign In"** button
3. Enter credentials:
   - Email: `test@example.com`
   - Password: `password123`
4. Click **"Sign In"**
5. Redirected to dashboard ✓

### Create a New Account

1. Visit: **http://localhost:3010**
2. Click **"Get Started"** or go to **Sign Up**
3. Fill form:
   - Name: `Your Name`
   - Email: `yourname@example.com`
   - Password: `password123` (min 8 chars)
   - Confirm Password: `password123`
4. Click **"Sign Up"**
5. Redirected to login
6. Sign in with new credentials

### Sign Out

1. Click your name in top-right corner
2. Click **"Sign Out"**
3. Redirected to login page

---

## For Developers

### Start Development

```bash
# Terminal 1: Start frontend dev server
cd frontend
npm run dev

# Terminal 2: Start backend (if you have it running)
cd backend/api-gateway
npm run dev
```

### Access Points

- **Home:** http://localhost:3010
- **Login:** http://localhost:3010/auth/login
- **Register:** http://localhost:3010/auth/register
- **Dashboard:** http://localhost:3010/dashboard (protected)
- **Error:** http://localhost:3010/auth/error?error=Callback

### Demo Credentials (Development Only)

```
Email: test@example.com
Password: password123
```

These credentials work because MSW intercepts the login request.

### File Structure

```
frontend/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx          ← Login page
│   │   ├── register/page.tsx       ← Register page
│   │   └── error/page.tsx          ← Error page
│   ├── api/auth/
│   │   ├── [...nextauth]/route.ts  ← Auth handler
│   │   └── register/route.ts       ← Register endpoint
│   ├── components/
│   │   └── Navbar.tsx              ← Navigation component
│   ├── page.tsx                    ← Home page
│   ├── dashboard/page.tsx          ← Dashboard (protected)
│   └── layout.tsx                  ← Root layout
├── auth.ts                         ← Next-Auth config
├── middleware.ts                   ← Route protection
└── AUTH.md                         ← Full documentation
```

### Key Features

- ✅ Email/password authentication
- ✅ Form validation with error messages
- ✅ Route protection with middleware
- ✅ Session management with Next-Auth
- ✅ Dark mode support
- ✅ Medical color palette
- ✅ Responsive design
- ✅ MSW mocking (dev mode)

### How It Works

```
1. User enters email/password
   ↓
2. Form submitted to /auth/login (page)
   ↓
3. signIn() called from next-auth/react
   ↓
4. Backend called: POST /auth/login
   ↓
5. Backend returns JWT token
   ↓
6. Token stored in session
   ↓
7. Token auto-sent in API headers
   ↓
8. User redirected to dashboard
   ↓
9. Dashboard checks session via middleware
   ↓
10. Page rendered if authenticated ✓
```

### Customization

#### Change Demo Credentials

Edit `frontend/test/mocks/handlers.ts`:

```typescript
http.post(`${API_BASE}/auth/login`, async ({ request }) => {
  const body = await request.json().catch(() => ({}))
  if (body.email === 'YOUR_EMAIL' && body.password === 'YOUR_PASSWORD') {
    return HttpResponse.json({ token: 'mock-token', user: mockData.user })
  }
  return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 })
}),
```

#### Change Session Expiry

Edit `frontend/auth.ts`:

```typescript
session: {
  maxAge: 24 * 60 * 60, // 1 day instead of 30 days
}
```

#### Add New Protected Route

1. Create page in `app/your-route/page.tsx`
2. Add to `middleware.ts`:
   ```typescript
   const protectedRoutes = [
     '/dashboard',
     '/your-route', // ← Add here
   ]
   ```

---

## Testing

### Manual Testing

1. **Test Login:**
   ```bash
   # Use demo credentials
   Email: test@example.com
   Password: password123
   ```

2. **Test Invalid Credentials:**
   ```bash
   Email: wrong@example.com
   Password: wrong123
   # Should show error
   ```

3. **Test Registration:**
   ```bash
   Name: Test User
   Email: newuser@example.com
   Password: password123
   Confirm: password123
   # Should redirect to login
   ```

4. **Test Route Protection:**
   ```bash
   # Try to access without login
   http://localhost:3010/dashboard
   # Should redirect to login
   ```

5. **Test Sign Out:**
   ```bash
   # Login first
   # Click Sign Out
   # Should redirect to login
   ```

### Automated Testing

```bash
# Run all tests
npm test

# Run API integration tests
npm test -- api-integration.test.ts

# Run E2E tests
npm run test:e2e

# Run specific E2E test
npm run test:e2e -- user-journey.spec.ts
```

---

## Environment Variables

### Development (`.env.local`)

```bash
# No special setup needed
# MSW mocks all API calls
```

### Production (`.env.production`)

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXTAUTH_URL=https://app.yourdomain.com
NEXTAUTH_SECRET=your-random-secret-key-here
```

Generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
# or use
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Troubleshooting

### "Session is undefined"

```typescript
// ❌ Wrong - server component
export default function Page() {
  const { data: session } = useSession() // Won't work
}

// ✅ Correct - client component
'use client'

import { useSession } from 'next-auth/react'

export default function Page() {
  const { data: session } = useSession() // Works
}
```

### "Middleware redirect loop"

**Check:** Is login page in `protectedRoutes`?

```typescript
// middleware.ts
const protectedRoutes = [
  '/dashboard',
  // ✅ GOOD: /auth/login NOT here
]
```

### "Login always fails"

**Check:**
1. Is dev server running? `npm run dev`
2. Is backend running? (if using real API)
3. Are demo credentials correct? `test@example.com` / `password123`
4. Check browser console for errors
5. Check terminal for backend errors

### "Dark mode not working"

**Check:** Tailwind dark mode in `tailwind.config.js`:

```typescript
export default {
  darkMode: 'class', // ✅ Should be 'class'
}
```

---

## Next Steps

### After Getting Started

1. ✅ Test login/register with demo credentials
2. ✅ Explore dashboard and other pages
3. ✅ Try signing out
4. ✅ Try accessing protected route without login
5. ✅ Read [AUTH.md](./AUTH.md) for detailed documentation
6. ✅ Read [TESTING_AND_INTEGRATION.md](./TESTING_AND_INTEGRATION.md) for testing

### For Production

1. Set up backend `/auth` endpoints
2. Configure environment variables
3. Generate `NEXTAUTH_SECRET`
4. Set up HTTPS
5. Run tests
6. Deploy

### Optional Enhancements

- [ ] Add email verification
- [ ] Add "Forgot Password" flow
- [ ] Add OAuth providers (Google, GitHub)
- [ ] Add multi-factor authentication
- [ ] Add user profile page
- [ ] Add role-based access control

---

## Useful Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Check TypeScript
npx tsc --noEmit

# Format code
npm run format

# Lint code
npm run lint
```

---

## File Locations

| Page | File |
|------|------|
| Home | `app/page.tsx` |
| Login | `app/auth/login/page.tsx` |
| Register | `app/auth/register/page.tsx` |
| Error | `app/auth/error/page.tsx` |
| Dashboard | `app/dashboard/page.tsx` |

| Component | File |
|-----------|------|
| Navbar | `app/components/Navbar.tsx` |

| Config | File |
|--------|------|
| Next-Auth | `auth.ts` |
| Middleware | `middleware.ts` |

| API Route | File |
|-----------|------|
| Handler | `app/api/auth/[...nextauth]/route.ts` |
| Register | `app/api/auth/register/route.ts` |

---

## Support

### Resources

- 📖 [AUTH.md](./AUTH.md) - Complete documentation
- 🧪 [TESTING_AND_INTEGRATION.md](./TESTING_AND_INTEGRATION.md) - Testing guide
- 📋 [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Summary of changes
- 🔗 [Next-Auth Docs](https://authjs.dev/) - Official documentation

### Common Questions

**Q: How do I change the demo credentials?**  
A: Edit `frontend/test/mocks/handlers.ts` and update the login handler.

**Q: How do I connect to a real backend?**  
A: Set `NEXT_PUBLIC_API_URL` to your backend URL and disable MSW in production.

**Q: How do I add more protected routes?**  
A: Add them to the `protectedRoutes` array in `middleware.ts`.

**Q: How do I implement "remember me"?**  
A: Adjust `session.maxAge` in `auth.ts` for longer expiry.

---

## 🎉 You're All Set!

Your authentication system is ready to use. Happy coding! 🚀

---

**Last Updated:** 2024-01-20  
**Status:** ✅ Ready for Development & Production
