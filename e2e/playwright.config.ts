import path from 'path'
import { defineConfig } from '@playwright/test'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(__dirname, '..', '.env.test') })
dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') })

if (process.env.NO_COLOR && process.env.FORCE_COLOR) {
  delete process.env.NO_COLOR
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_URL) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.SUPABASE_URL
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.SUPABASE_ANON_KEY) {
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://template.supabase.co'
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlbXBsYXRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjcwMDAwMDAwMH0.signature'
}

const E2E_RUN_ID = process.env.E2E_RUN_ID ?? `${Date.now()}`
const E2E_WORKERS = Number.parseInt(process.env.E2E_WORKERS ?? '1', 10)
const E2E_PORT = Number.parseInt(process.env.E2E_PORT ?? '3100', 10)
const IS_CI = process.env.CI === 'true'
const E2E_WEB_SERVER_COMMAND =
  process.env.E2E_WEB_SERVER_COMMAND ?? `bun run build && PORT=${E2E_PORT} bun run start`
const E2E_REUSE_SERVER = process.env.E2E_REUSE_SERVER === 'true'

process.env.E2E_RUN_ID = E2E_RUN_ID

export default defineConfig({
  testDir: '.',
  timeout: 60_000,
  expect: { timeout: 5000 },
  fullyParallel: false,
  retries: IS_CI ? 1 : 0,
  workers: Number.isNaN(E2E_WORKERS) ? 1 : E2E_WORKERS,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: process.env.E2E_BASE_URL ?? `http://localhost:${E2E_PORT}`,
    screenshot: 'only-on-failure',
    trace: IS_CI ? 'retain-on-failure' : 'off',
    locale: 'en-US',
    viewport: { width: 1920, height: 1080 },
  },

  projects: [
    {
      name: 'setup',
      testMatch: /global-setup\.ts/,
      timeout: 240_000,
      teardown: 'teardown',
    },
    {
      name: 'teardown',
      testMatch: /global-teardown\.ts/,
    },
    {
      name: 'auth',
      testMatch: /e2e\/auth\//,
      use: {
        browserName: 'chromium',
      },
      dependencies: ['setup'],
    },
  ],

  webServer: {
    command: E2E_WEB_SERVER_COMMAND,
    cwd: path.resolve(__dirname, '..'),
    port: E2E_PORT,
    reuseExistingServer: E2E_REUSE_SERVER,
    timeout: 240_000,
  },
})
