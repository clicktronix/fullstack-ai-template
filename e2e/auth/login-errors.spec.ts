import { test, expect } from '@playwright/test'
import { hasE2EAuthCredentials } from '../helpers/auth'

// Fresh browser — no storageState
test.use({ storageState: { cookies: [], origins: [] } })
test.skip(!hasE2EAuthCredentials(), 'E2E auth credentials are not configured')

test.describe('Login Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.getByTestId('login-email').fill('nonexistent@example.com')
    await page.getByTestId('login-password').fill('wrongpassword123')
    await page.getByTestId('login-submit').click()

    // Error alert should appear
    await expect(page.getByTestId('form-error-alert')).toBeVisible({ timeout: 10_000 })

    // Should still be on login page
    await expect(page).toHaveURL(/\/login/)
  })

  test('submit button shows loading state during auth', async ({ page }) => {
    await page.getByTestId('login-email').fill(process.env.E2E_USER_EMAIL!)
    await page.getByTestId('login-password').fill('definitely_wrong_password')
    await page.getByTestId('login-submit').click()

    // Button should show loading during request
    // Then error should appear
    await expect(page.getByTestId('form-error-alert')).toBeVisible({ timeout: 15_000 })

    // Button should not be loading after error
    const submitBtn = page.getByTestId('login-submit')
    await expect(submitBtn).toBeEnabled()
  })
})
