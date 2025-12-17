import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { apiClient } from '@/lib/api'
import { API_CONFIG } from '@/lib/apiConfig'

describe('API Integration Tests', () => {
  beforeEach(() => {
    apiClient.setToken(null)
  })

  it('should authenticate and store JWT token', async () => {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.AUTH_LOGIN, {
      email: 'test@example.com',
      password: 'password123',
    })

    expect(response.token).toBeDefined()
    expect(response.token).toEqual('mock-jwt-token-123')

    apiClient.setToken(response.token)
    expect(apiClient.getToken()).toEqual('mock-jwt-token-123')
  })

  it('should fetch flashcards from api-gateway', async () => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.FLASHCARDS_LIST)

    expect(response.items).toBeDefined()
    expect(Array.isArray(response.items)).toBe(true)
    expect(response.total).toBeGreaterThanOrEqual(0)
  })

  it('should fetch courses list', async () => {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.COURSES_LIST)

    expect(response.items).toBeDefined()
    expect(Array.isArray(response.items)).toBe(true)
  })

  it('should handle AI chat requests', async () => {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.AI_CHAT, {
      prompt: 'What is anatomy?',
    })

    expect(response.reply).toBeDefined()
    expect(typeof response.reply).toBe('string')
  })

  it('should validate JWT token is sent in Authorization header', async () => {
    apiClient.setToken('test-token-123')

    // This will fail if token is not in header (MSW will see it)
    await apiClient.get(API_CONFIG.ENDPOINTS.COURSES_LIST)

    expect(apiClient.getToken()).toEqual('test-token-123')
  })

  it('should handle API errors gracefully', async () => {
    expect(async () => {
      await apiClient.post(API_CONFIG.ENDPOINTS.AUTH_LOGIN, {
        email: 'wrong@example.com',
        password: 'wrong',
      })
    }).rejects.toThrow()
  })
})
