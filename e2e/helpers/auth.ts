import { expect, type Page } from '@playwright/test'

const LOGIN_ATTEMPTS = 2
const LOGIN_REDIRECT_TIMEOUT_MS = 30_000
const LOGIN_NAVIGATION_TIMEOUT_MS = 120_000

type RequiredEnvKey = 'E2E_USER_EMAIL' | 'E2E_USER_PASSWORD'

function getOptionalEnv(name: RequiredEnvKey): string | null {
  const rawValue = process.env[name]
  const value = rawValue?.trim()

  return value || null
}

function getRequiredEnv(name: RequiredEnvKey): string {
  const value = getOptionalEnv(name)

  if (!value) {
    throw new Error(`${name} is required for E2E auth`)
  }
  return value
}

export function hasE2EAuthCredentials(): boolean {
  return getOptionalEnv('E2E_USER_EMAIL') !== null && getOptionalEnv('E2E_USER_PASSWORD') !== null
}

export async function loginAsTestUser(page: Page): Promise<void> {
  const email = getRequiredEnv('E2E_USER_EMAIL')
  const password = getRequiredEnv('E2E_USER_PASSWORD')
  let lastError: unknown = null

  for (let attempt = 1; attempt <= LOGIN_ATTEMPTS; attempt += 1) {
    try {
      await page.goto('/login', {
        waitUntil: 'domcontentloaded',
        timeout: LOGIN_NAVIGATION_TIMEOUT_MS,
      })
      await Promise.race([
        page.getByTestId('login-submit').waitFor({
          state: 'visible',
          timeout: LOGIN_NAVIGATION_TIMEOUT_MS,
        }),
        page.waitForURL(/\/admin\/work-items/, { timeout: LOGIN_NAVIGATION_TIMEOUT_MS }),
      ])
      if (page.url().includes('/admin/work-items')) {
        return
      }

      const emailInput = page.getByTestId('login-email')
      await emailInput.waitFor({ state: 'visible', timeout: 10_000 })
      await emailInput.click()
      await emailInput.clear()
      await emailInput.fill(email)

      const passwordInput = page.getByTestId('login-password')
      await passwordInput.waitFor({ state: 'visible', timeout: 10_000 })
      await passwordInput.click()
      await passwordInput.clear()
      await passwordInput.fill(password)
      await page.getByTestId('login-submit').click({ timeout: 10_000 })

      await page
        .waitForLoadState('networkidle', { timeout: LOGIN_REDIRECT_TIMEOUT_MS })
        .catch(() => {
          // The page can keep background requests alive; URL/error checks below are authoritative.
        })

      const formError = page.getByTestId('form-error-alert')
      if (await formError.isVisible().catch(() => false)) {
        const text = await formError.textContent()
        const message = text?.trim() || 'Unknown login error'
        throw new Error(`Login failed: ${message}`)
      }

      await expect(page).toHaveURL(/\/admin\/work-items/, { timeout: LOGIN_REDIRECT_TIMEOUT_MS })
      return
    } catch (error) {
      lastError = error
      if (attempt === LOGIN_ATTEMPTS) {
        throw error
      }

      await page.context().clearCookies()
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Login failed after retry attempts')
}
