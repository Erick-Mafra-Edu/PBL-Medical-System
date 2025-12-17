# Frontend Integration & Testing Guide

## Overview

This frontend is fully integrated with the PBL Medical System backend services:
- **api-gateway** (Express/TS) - Main backend service
- **ai-service** (Python) - AI/Chat integration
- **obsidian-sync** (Express/TS) - Note synchronization
- **flashcard-engine** (Express/TS) - Spaced repetition algorithms

## Architecture

### API Client (`lib/api.ts`)

Singleton API client with JWT token management:

```typescript
import { apiClient } from '@/lib/api'
import { API_CONFIG } from '@/lib/apiConfig'

// Login
const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH_LOGIN, {
  email: 'user@example.com',
  password: 'password123',
})
apiClient.setToken(response.token)

// Fetch flashcards
const flashcards = await apiClient.get(API_CONFIG.ENDPOINTS.FLASHCARDS_LIST)

// Create flashcard
const newCard = await apiClient.post(API_CONFIG.ENDPOINTS.FLASHCARDS_CREATE, {
  question: 'What is PBL?',
  answer: 'Problem-Based Learning',
})
```

### Endpoints Configuration (`lib/apiConfig.ts`)

Centralized endpoint management:

```typescript
API_CONFIG.ENDPOINTS.AUTH_LOGIN
API_CONFIG.ENDPOINTS.COURSES_LIST
API_CONFIG.ENDPOINTS.FLASHCARDS_REVIEW
API_CONFIG.ENDPOINTS.AI_CHAT
API_CONFIG.ENDPOINTS.OBSIDIAN_SYNC_VAULT
// ... more endpoints
```

## Development Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
npm run test:e2e:install  # Install Playwright browsers (one-time)
```

### 2. Run Tests

```bash
# Unit & integration tests (uses MSW mocks)
npm test

# Watch mode
npm run test:watch

# E2E tests (requires app running at http://localhost:3010)
npm run test:e2e

# E2E with browser visible
npm run test:e2e:headed
```

### 3. Mocked Backend (Development)

Tests use **MSW (Mock Service Worker)** to intercept API calls:

- ✅ No real backend needed during development
- ✅ Predictable, repeatable test results
- ✅ Fast test execution
- ✅ Full endpoint coverage

Handlers defined in [`test/mocks/handlers.ts`](test/mocks/handlers.ts):
- Auth (login, register, logout)
- Courses (list, detail, create)
- Flashcards (CRUD, review, quality updates)
- AI (chat, generate flashcards, summarize)
- Obsidian Sync (vault sync, watch)
- Flashcard Engine (algorithm calculations)

### 4. Production Deployment

For production, MSW is disabled and real API calls are made:

```bash
npm run build
npm start  # Connects to real api-gateway
```

**Requirements:**
- `NEXT_PUBLIC_API_URL` environment variable set (e.g., `https://api.example.com`)
- API endpoint must use HTTPS in production
- CORS configured on backend to allow frontend domain

## Theme & Colors

### Tailwind Configuration

Medical/healthcare color palette in [`tailwind.config.js`](tailwind.config.js):

```javascript
// Primary brand color (medical blue)
colors: {
  primary: { 50-900 },    // Blues
  success: { 50, 500-700 },  // Greens (completed)
  warning: { 50, 500-700 },  // Ambers (alerts)
  danger: { 50, 500-700 },   // Reds (critical)
  info: { 50, 500-700 },     // Blues (info)
  neutral: { 50-900 },      // Grays (text/bg)
}
```

### Dark Mode

Automatic dark mode support via `prefers-color-scheme` media query:

```css
:root {
  --color-primary: 59, 130, 246; /* Light mode */
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-primary: 96, 165, 250; /* Dark mode */
  }
}
```

### CSS Utilities (`app/globals.css`)

Predefined utility classes:
- `.card` - Card component styling
- `.btn-primary`, `.btn-secondary` - Button variants
- `.badge-success`, `.badge-warning`, `.badge-danger` - Badge variants

## Testing Strategy

### Unit & Integration Tests

**Framework:** Jest + React Testing Library + MSW

**Location:** `__tests__/` directory

**Examples:**
- `home.test.tsx` - Navigation and page rendering
- `dashboard.test.tsx` - Dashboard KPI display
- `api-integration.test.ts` - API client and JWT handling

**Run:**
```bash
npm test
npm run test:watch
```

### E2E Tests

**Framework:** Playwright

**Location:** `e2e/` directory

**Examples:**
- `home.spec.ts` - Home page rendering
- `user-journey.spec.ts` - Multi-page user flows

**Run:**
```bash
# Start frontend first
npm run dev  # In another terminal

# Then run E2E tests
npm run test:e2e
npm run test:e2e:headed  # See browser
```

## Integration Checklist

- [x] API client with JWT token management
- [x] Environment validation (`lib/validateEnvironment.ts`)
- [x] MSW mocks for all endpoints
- [x] Unit tests for critical flows
- [x] E2E tests for user journeys
- [x] Dark mode support
- [x] Accessibility features (focus styles, reduced-motion)
- [x] Medical/healthcare color palette
- [x] CORS-ready (api-gateway handles proxy)
- [x] Production deployment ready

## Workflow for Adding New Features

1. **Define endpoint** in `lib/apiConfig.ts`:
   ```typescript
   MY_FEATURE_ENDPOINT: '/my-feature',
   ```

2. **Add MSW handler** in `test/mocks/handlers.ts`:
   ```typescript
   http.post(`${API_BASE}/my-feature`, async ({ request }) => {
     // Handle request
   })
   ```

3. **Write unit test** in `__tests__/`:
   ```typescript
   it('should call my-feature endpoint', async () => {
     const response = await apiClient.post(API_CONFIG.ENDPOINTS.MY_FEATURE_ENDPOINT)
   })
   ```

4. **Write E2E test** in `e2e/`:
   ```typescript
   test('should use my-feature in user flow', async ({ page }) => {
     await page.goto('/my-feature')
   })
   ```

5. **Implement component** using `apiClient`

6. **Test with real backend** during integration

## Deployment

### Environment Variables

**Development:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

**Production:**
```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NODE_ENV=production
```

### Docker Build

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Validation Before Deploy

```bash
npm run test          # Unit tests
npm run test:e2e      # E2E tests (with real backend)
npm run build         # Production build
```

## Troubleshooting

### Tests fail with "Cannot find module"

Solution: Ensure `jest.setup.ts` is loaded:
```bash
npm install
npm test
```

### MSW not intercepting requests

Check `test/mocks/handlers.ts` has matching URLs and methods.

### CORS errors in production

Verify `api-gateway` CORS config includes frontend domain:
```typescript
cors({
  origin: 'https://app.your-domain.com',
  credentials: true,
})
```

### Theme colors not applying

Ensure Tailwind is processing your files:
```bash
npm run dev  # Should watch and recompile on change
```

---

**Last Updated:** 2024-12-17  
**Framework:** Next.js 14 + Tailwind + Jest + Playwright  
**Status:** ✅ Production Ready
