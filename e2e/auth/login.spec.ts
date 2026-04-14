import { test, expect } from '@playwright/test'
import { hasE2EAuthCredentials, loginAsTestUser } from '../helpers/auth'

// Fresh browser — no storageState
test.use({ storageState: { cookies: [], origins: [] } })
test.skip(!hasE2EAuthCredentials(), 'E2E auth credentials are not configured')

test('successful login redirects to /admin/work-items', async ({ page }) => {
  await loginAsTestUser(page)
  await expect(page).toHaveURL(/\/admin\/work-items/, { timeout: 10_000 })
})

test('logout redirects to /login', async ({ page }) => {
  await loginAsTestUser(page)
  await expect(page).toHaveURL(/\/admin\/work-items/, { timeout: 10_000 })

  // Open user menu and sign out
  await page.getByTestId('user-menu-trigger').click()
  await page.getByTestId('user-menu-logout').click()

  // Expect redirect to /login
  await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
})
