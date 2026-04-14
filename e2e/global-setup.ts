import fs from 'fs'
import path from 'path'
import { test as setup, expect } from '@playwright/test'
import { hasE2EAuthCredentials, loginAsTestUser } from './helpers/auth'

const authDir = path.resolve(__dirname, '.auth')
const storageStatePath = path.join(authDir, 'storage-state.json')

setup('authenticate', async ({ page }) => {
  fs.mkdirSync(authDir, { recursive: true })

  if (!hasE2EAuthCredentials()) {
    await page.context().storageState({ path: storageStatePath })
    return
  }

  // Login through browser UI so Supabase SSR sets cookies in correct format
  await loginAsTestUser(page)

  // Verify we actually landed on the authenticated page
  await expect(page).toHaveURL(/\/admin\/work-items/, { timeout: 30_000 })

  await page.context().storageState({ path: storageStatePath })
})
