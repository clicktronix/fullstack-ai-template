import { expect, test } from '@playwright/test'

test.use({
  javaScriptEnabled: false,
  storageState: { cookies: [], origins: [] },
})

test('login form renders as a server-action form without JavaScript', async ({ page }) => {
  await page.goto('/login?redirect=/admin/work-items')

  const form = page.locator('form').first()

  await expect(form).toBeVisible()
  await expect(form.locator('input[name="email"]')).toBeVisible()
  await expect(form.locator('input[name="password"]')).toBeVisible()
  await expect(form.locator('input[name="redirect"]')).toBeAttached()
  await expect(form.locator('button[type="submit"]')).toBeVisible()
})

test('signup form renders as a server-action form without JavaScript', async ({ page }) => {
  await page.goto('/signup?redirect=/admin/work-items')

  const form = page.locator('form').first()

  await expect(form).toBeVisible()
  await expect(form.locator('input[name="fullName"]')).toBeVisible()
  await expect(form.locator('input[name="email"]')).toBeVisible()
  await expect(form.locator('input[name="password"]')).toBeVisible()
  await expect(form.locator('input[name="confirmPassword"]')).toBeVisible()
  await expect(form.locator('input[name="redirect"]')).toBeAttached()
  await expect(form.locator('button[type="submit"]')).toBeVisible()
})
