import { test, expect } from '@playwright/test'

test('home page shows navigation cards', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'PBL Medical System' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Dashboard/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Flashcards/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Courses/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Library/ })).toBeVisible()
})
