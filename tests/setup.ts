/// <reference lib="dom" />
/* eslint-disable import/order */

/**
 * Global test setup for Bun test runner
 *
 * This file is preloaded before all tests via bunfig.toml:
 * [test]
 * preload = ["./tests/setup.ts"]
 *
 * IMPORTANT: Order of operations matters!
 * 1. First register happy-dom globals (document, window, etc.)
 * 2. Then import testing libraries that depend on DOM
 * 3. Then setup mocks and afterEach hooks
 *
 * NOTE: Import order is intentionally non-standard here because GlobalRegistrator
 * must be called before any testing-library imports.
 */

import { afterEach, mock } from 'bun:test'
import { GlobalRegistrator } from '@happy-dom/global-registrator'

// Server-only is a Next.js guard that throws at import time.
// In tests we allow importing server modules but never execute server-only logic.
mock.module('server-only', () => ({}))

// Ensure Supabase env vars exist for test runs.
// Some client-side adapters initialize Supabase client at import time.
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
}

// Step 1: Register happy-dom globals BEFORE any testing-library imports
GlobalRegistrator.register()

// Step 2: Import testing libraries AFTER DOM is available
// NOTE: These must be dynamic imports. In ESM, static imports are evaluated
// before any top-level code runs, which would import testing-library before
// happy-dom globals exist and permanently break `screen`.
// @ts-expect-error jest-dom types are side-effect only import
await import('@testing-library/jest-dom')
const { cleanup } = await import('@testing-library/react')

// Step 4: Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock ResizeObserver (not implemented in happy-dom)
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock IntersectionObserver (not implemented in happy-dom)
globalThis.IntersectionObserver = class IntersectionObserver {
  readonly root: Element | Document | null = null
  readonly rootMargin: string = ''
  readonly thresholds: ReadonlyArray<number> = []

  constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {}

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

// Mock window.matchMedia (used by Mantine for responsive design)
Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: mock((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: mock(() => {}),
    removeListener: mock(() => {}),
    addEventListener: mock(() => {}),
    removeEventListener: mock(() => {}),
    dispatchEvent: mock(() => true),
  })),
})

// Mock window.scrollTo (used in navigation)
Object.defineProperty(globalThis, 'scrollTo', {
  writable: true,
  value: mock(() => {}),
})

// Mock crypto.randomUUID (used by Mantine for IDs)
if (!globalThis.crypto) {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      randomUUID: () => '00000000-0000-0000-0000-000000000000',
      getRandomValues: (array: Uint8Array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256)
        }
        return array
      },
    },
  })
}

// Mock localStorage (SSR-safe)
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  }
})()

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
})

// Mock next/navigation
mock.module('next/navigation', () => ({
  useRouter: () => ({
    push: mock(() => {}),
    replace: mock(() => {}),
    refresh: mock(() => {}),
    back: mock(() => {}),
    forward: mock(() => {}),
    prefetch: mock(() => {}),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: mock(() => {}),
  notFound: mock(() => {}),
}))

// Mock next/headers
mock.module('next/headers', () => ({
  cookies: async () => ({
    get: mock(() => {}),
    set: mock(() => {}),
    delete: mock(() => {}),
    getAll: mock(() => []),
    has: mock(() => false),
  }),
  headers: async () => ({
    get: mock(() => null),
    has: mock(() => false),
    entries: mock(() => []),
    forEach: mock(() => {}),
    keys: mock(() => []),
    values: mock(() => []),
  }),
}))

// Suppress React 19 console warnings in tests
const originalConsoleError = console.error
console.error = (...args: unknown[]) => {
  // Filter out React hydration warnings and other noise in tests
  const message = args[0]
  if (
    typeof message === 'string' &&
    (message.includes('Warning: ReactDOM.render is no longer supported') ||
      message.includes('Warning: useLayoutEffect does nothing on the server'))
  ) {
    return
  }
  originalConsoleError.apply(console, args)
}
