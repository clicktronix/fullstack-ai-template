import { test, expect } from '@playwright/test'

// Fresh browser — no storageState
test.use({ storageState: { cookies: [], origins: [] } })

test('unauthenticated user is redirected to /login from /admin/work-items', async ({ page }) => {
  await page.goto('/admin/work-items')
  await expect(page).toHaveURL(/\/login/)
})

test('unauthenticated user is redirected to /login from nested admin route', async ({ page }) => {
  await page.goto('/admin/work-items/archived')
  await expect(page).toHaveURL(/\/login/)
})
