import { expect, test } from '@playwright/test'

test('CSP headers are applied to static and PPR pages without nonce mismatch', async ({ page }) => {
  const cspViolations: string[] = []

  page.on('console', (message) => {
    const text = message.text()
    if (text.includes('Content Security Policy') || text.includes('violates the following')) {
      cspViolations.push(text)
    }
  })

  const rootResponse = await page.goto('/')
  expect(rootResponse?.headers()['content-security-policy']).toContain("script-src 'self'")

  const loginResponse = await page.goto('/login')
  const loginCsp = loginResponse?.headers()['content-security-policy']

  expect(loginCsp).toContain("default-src 'self'")
  expect(loginCsp).toContain("form-action 'self'")
  expect(loginCsp).toContain("script-src 'self' 'unsafe-inline'")
  expect(loginCsp).not.toContain("'nonce-")
  expect(cspViolations).toEqual([])
})
