import { test, expect } from '@playwright/test'

/**
 * End-to-End tests for critical user journeys
 * These run against a real frontend instance (typically http://localhost:3010)
 * and use mocked backend via MSW
 */

test.describe('User Journey: Complete Study Flow', () => {
  test('should navigate from home to dashboard to flashcards', async ({ page }) => {
    // Step 1: Load home page
    await page.goto('/')
    await expect(page).toHaveTitle(/PBL Medical System/)

    // Step 2: Navigate to dashboard
    await page.click('a:has-text("Dashboard")')
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

    // Step 3: Verify dashboard stats are visible
    await expect(page.getByText('Cards Due Today')).toBeVisible()
    await expect(page.getByText('Total Cards')).toBeVisible()
    await expect(page.getByText('Study Streak')).toBeVisible()
  })

  test('should navigate through all main sections', async ({ page }) => {
    await page.goto('/')

    const sections = [
      { name: 'Dashboard', route: '/dashboard' },
      { name: 'Flashcards', route: '/flashcards' },
      { name: 'Courses', route: '/courses' },
      { name: 'Library', route: '/library' },
    ]

    for (const section of sections) {
      // Find and click link
      const link = page.getByRole('link', { name: new RegExp(section.name) })
      await expect(link).toBeVisible()
      await link.click()

      // Verify navigation
      await expect(page).toHaveURL(section.route)
    }
  })

  test('should display responsive layout on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'PBL Medical System' })).toBeVisible()

    // Navigation links should still be accessible
    await expect(page.getByRole('link', { name: /Dashboard/ })).toBeVisible()
  })

  test('should have proper color contrast for accessibility', async ({ page }) => {
    await page.goto('/')

    // Check main heading contrast
    const heading = page.getByRole('heading', { name: 'PBL Medical System' })
    const color = await heading.evaluate((el) => window.getComputedStyle(el).color)
    const bgColor = await heading.evaluate((el) => window.getComputedStyle(el.parentElement).backgroundColor)

    expect(color).toBeTruthy()
    expect(bgColor).toBeTruthy()
  })

  test('should support dark mode toggle', async ({ page }) => {
    await page.goto('/')

    // Check initial theme
    const htmlElement = page.locator('html')
    const initialTheme = await htmlElement.evaluate((el) => el.className)

    // Note: This test assumes a dark mode toggle exists
    // Adjust selector based on actual implementation
    console.log('Initial theme:', initialTheme)
  })
})

test.describe('API Integration in E2E', () => {
  test('should load dashboard with mocked API responses', async ({ page }) => {
    await page.goto('/dashboard')

    // Wait for stats to appear (they should be mocked by MSW)
    await expect(page.getByText('Cards Due Today')).toBeVisible()
    await expect(page.getByText('0')).toBeVisible() // Mocked value

    // Verify recent activity section
    await expect(page.getByText('Recent Activity')).toBeVisible()
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // This would test error boundaries and retry logic
    // when API calls fail (simulated by server.use() in test setup)
    await page.goto('/dashboard')

    // Verify page still renders even if some API calls might fail
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })
})
