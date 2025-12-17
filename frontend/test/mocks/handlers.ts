import { http, HttpResponse } from 'msw'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

// Mock data store (in memory for tests)
const mockData = {
  flashcards: [
    { id: '1', question: 'What is PBL?', answer: 'Problem-Based Learning', quality: 3 },
    { id: '2', question: 'Define Spaced Repetition', answer: 'Technique for optimal retention', quality: 4 },
  ],
  courses: [
    { id: '1', title: 'Anatomy 101', description: 'Basic Anatomy' },
    { id: '2', title: 'Physiology 101', description: 'Basic Physiology' },
  ],
  user: { id: '1', email: 'user@example.com', name: 'Test User' },
}

export const handlers = [
  // ========== HEALTH CHECK ==========
  http.get(`${API_BASE}/health`, () => 
    HttpResponse.json({ status: 'healthy', service: 'api-gateway' })
  ),

  // ========== AUTH ==========
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = await request.json().catch(() => ({}))
    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({ token: 'mock-jwt-token-123', user: mockData.user })
    }
    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }),

  http.post(`${API_BASE}/auth/register`, async ({ request }) => {
    const body = await request.json().catch(() => ({}))
    return HttpResponse.json({ token: 'mock-jwt-token-new', user: { id: '2', email: body.email, name: body.name } })
  }),

  http.post(`${API_BASE}/auth/logout`, () => 
    HttpResponse.json({ success: true })
  ),

  // ========== COURSES ==========
  http.get(`${API_BASE}/courses`, () =>
    HttpResponse.json({ items: mockData.courses, total: mockData.courses.length })
  ),

  http.get(`${API_BASE}/courses/:id`, ({ params }) => {
    const course = mockData.courses.find(c => c.id === params.id)
    return course ? HttpResponse.json(course) : HttpResponse.json({ error: 'Not found' }, { status: 404 })
  }),

  http.post(`${API_BASE}/courses`, async ({ request }) => {
    const body = await request.json().catch(() => ({}))
    const newCourse = { id: String(Date.now()), ...body }
    mockData.courses.push(newCourse)
    return HttpResponse.json(newCourse, { status: 201 })
  }),

  // ========== FLASHCARDS ==========
  http.get(`${API_BASE}/flashcards`, ({ request }) => {
    const url = new URL(request.url)
    const courseId = url.searchParams.get('courseId')
    const items = courseId ? mockData.flashcards.filter(f => f.id === courseId) : mockData.flashcards
    return HttpResponse.json({ items, total: items.length })
  }),

  http.get(`${API_BASE}/flashcards/:id`, ({ params }) => {
    const flashcard = mockData.flashcards.find(f => f.id === params.id)
    return flashcard ? HttpResponse.json(flashcard) : HttpResponse.json({ error: 'Not found' }, { status: 404 })
  }),

  http.post(`${API_BASE}/flashcards`, async ({ request }) => {
    const body = await request.json().catch(() => ({}))
    const newCard = { id: String(Date.now()), ...body, quality: 0 }
    mockData.flashcards.push(newCard)
    return HttpResponse.json(newCard, { status: 201 })
  }),

  http.put(`${API_BASE}/flashcards/:id/quality`, async ({ params, request }) => {
    const body = await request.json().catch(() => ({}))
    const card = mockData.flashcards.find(f => f.id === params.id)
    if (!card) return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    card.quality = body.quality || 0
    return HttpResponse.json({ ...card, nextReviewDate: new Date(Date.now() + 86400000).toISOString() })
  }),

  http.post(`${API_BASE}/flashcards/review`, async ({ request }) => {
    const body = await request.json().catch(() => ({}))
    return HttpResponse.json({ 
      dueToday: mockData.flashcards.filter(f => f.quality < 2).length,
      totalCards: mockData.flashcards.length,
      streak: 5,
    })
  }),

  // ========== AI SERVICE (via api-gateway) ==========
  http.post(`${API_BASE}/ai/chat`, async ({ request }) => {
    const body = await request.json().catch(() => ({}))
    const prompt = body.prompt || 'default'
    return HttpResponse.json({ 
      reply: `AI response to "${prompt}": This is a mocked response for testing purposes.` 
    })
  }),

  http.post(`${API_BASE}/ai/generate-flashcards`, async ({ request }) => {
    const body = await request.json().catch(() => ({}))
    return HttpResponse.json({
      flashcards: [
        { question: 'Generated Q1', answer: 'Generated A1' },
        { question: 'Generated Q2', answer: 'Generated A2' },
      ]
    })
  }),

  http.post(`${API_BASE}/ai/summarize`, async ({ request }) => {
    const body = await request.json().catch(() => ({}))
    return HttpResponse.json({ summary: 'Mocked summary of provided text.' })
  }),

  // ========== OBSIDIAN SYNC (via api-gateway) ==========
  http.post(`${API_BASE}/sync/vault`, async ({ request }) => {
    const body = await request.json().catch(() => ({}))
    return HttpResponse.json({ message: 'Vault synced successfully', syncedCount: 5 })
  }),

  http.post(`${API_BASE}/sync/watch/start`, async ({ request }) => {
    const body = await request.json().catch(() => ({}))
    return HttpResponse.json({ message: 'Started watching vault', vaultPath: body.vaultPath })
  }),

  // ========== FLASHCARD ENGINE (via api-gateway) ==========
  http.post(`${API_BASE}/flashcard-engine/calculate`, async ({ request }) => {
    const body = await request.json().catch(() => ({}))
    return HttpResponse.json({
      nextInterval: 3,
      nextEaseFactor: 2.5,
      nextReviewDate: new Date(Date.now() + 259200000).toISOString(),
    })
  }),
]
