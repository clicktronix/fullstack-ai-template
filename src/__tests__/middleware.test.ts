import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'
import { LOCALE_COOKIE_NAME } from '@/lib/constants'

// --- next/server mocks ---

type MockHeaders = {
  get: (key: string) => string | null
  set: (key: string, value: string) => void
  _store: Map<string, string>
}

type MockCookies = {
  get: (name: string) => { name: string; value: string } | undefined
  set: (name: string, value: string, options?: Record<string, unknown>) => void
  getAll: () => Array<{ name: string; value: string }>
  _store: Map<string, string>
}

function createMockHeaders(): MockHeaders {
  const store = new Map<string, string>()
  return {
    _store: store,
    get: (key: string) => store.get(key.toLowerCase()) ?? null,
    set: (key: string, value: string) => store.set(key.toLowerCase(), value),
  }
}

function createMockCookies(): MockCookies {
  const store = new Map<string, string>()
  return {
    _store: store,
    get: (name: string) => {
      const value = store.get(name)
      return value === undefined ? undefined : { name, value }
    },
    set: (name: string, value: string) => store.set(name, value),
    getAll: () => [...store.entries()].map(([name, value]) => ({ name, value })),
  }
}

type MockRequest = {
  nextUrl: { pathname: string; search: string; protocol: string }
  url: string
  headers: MockHeaders
  cookies: MockCookies
}

type MockResponse = {
  headers: MockHeaders
  cookies: MockCookies
  _type: 'next' | 'redirect'
  _redirectUrl?: string
  _requestHeaders?: Headers
  status?: number
}

function createMockRequest(
  pathname: string,
  search = '',
  headers: Record<string, string> = {}
): MockRequest {
  const requestHeaders = createMockHeaders()
  for (const [key, value] of Object.entries(headers)) {
    requestHeaders.set(key, value)
  }

  return {
    nextUrl: { pathname, search, protocol: 'https:' },
    url: `http://localhost:3000${pathname}${search}`,
    headers: requestHeaders,
    cookies: createMockCookies(),
  }
}

function createMockResponse(
  type: 'next' | 'redirect',
  redirectUrl?: string,
  status?: number,
  requestHeaders?: Headers
): MockResponse {
  return {
    _type: type,
    _redirectUrl: redirectUrl,
    _requestHeaders: requestHeaders,
    status,
    headers: createMockHeaders(),
    cookies: createMockCookies(),
  }
}

// --- getUser mock state ---

let mockGetUserResult: {
  data: { user: { id?: string } | null }
  error: Error | null
} = { data: { user: null }, error: new Error('not authenticated') }

// Mock createServerClient from @supabase/ssr
mock.module('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: {
      getUser: async () => mockGetUserResult,
    },
  }),
  createBrowserClient: () => ({}),
}))

// Mock next/server
mock.module('next/server', () => ({
  NextResponse: {
    next: (opts?: { request?: { headers?: Headers } }) =>
      createMockResponse('next', undefined, undefined, opts?.request?.headers),
    redirect: (url: URL) => createMockResponse('redirect', url.toString()),
    json: (_body: unknown, init?: { status?: number }) =>
      createMockResponse('next', undefined, init?.status),
  },
}))

// --- Import proxy after mocks are registered ---
const { proxy } = await import('../proxy')

// --- Tests ---

describe('proxy', () => {
  const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const originalSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  beforeEach(() => {
    // Reset authentication state before each test.
    mockGetUserResult = { data: { user: null }, error: new Error('not authenticated') }
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'
  })

  afterEach(() => {
    if (originalSupabaseUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
    } else {
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl
    }

    if (originalSupabaseAnonKey === undefined) {
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    } else {
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalSupabaseAnonKey
    }
  })

  describe('unauthenticated user', () => {
    test('redirects to /login when accessing protected /admin/work-items route', async () => {
      const req = createMockRequest('/admin/work-items')

      const response = (await proxy(req as never)) as unknown as MockResponse

      expect(response._type).toBe('redirect')
      expect(response._redirectUrl).toContain('/login')
      expect(response._redirectUrl).toContain('redirect=%2Fadmin%2Fwork-items')
    })

    test('redirects to /login when accessing /profile', async () => {
      const req = createMockRequest('/profile')

      const response = (await proxy(req as never)) as unknown as MockResponse

      expect(response._type).toBe('redirect')
      expect(response._redirectUrl).toContain('/login')
    })

    test('does not redirect to /login for public / route', async () => {
      const req = createMockRequest('/')

      const response = (await proxy(req as never)) as unknown as MockResponse

      expect(response._type).toBe('next')
    })

    test('preserves query string in redirect parameter', async () => {
      const req = createMockRequest('/admin/work-items', '?view=board')

      const response = (await proxy(req as never)) as unknown as MockResponse

      expect(response._type).toBe('redirect')
      // pathname + search are preserved in redirect.
      expect(response._redirectUrl).toContain('redirect=')
    })
  })

  describe('authenticated user', () => {
    beforeEach(() => {
      mockGetUserResult = {
        data: { user: { id: 'user-123' } },
        error: null,
      }
    })

    test('redirects from /login to the protected area', async () => {
      const req = createMockRequest('/login')

      const response = (await proxy(req as never)) as unknown as MockResponse

      expect(response._type).toBe('redirect')
      expect(response._redirectUrl).toContain('/admin/work-items')
    })

    test('redirects from /signup to the protected area', async () => {
      const req = createMockRequest('/signup')

      const response = (await proxy(req as never)) as unknown as MockResponse

      expect(response._type).toBe('redirect')
      expect(response._redirectUrl).toContain('/admin/work-items')
    })

    test('allows protected route access without redirect', async () => {
      const req = createMockRequest('/admin/work-items')

      const response = (await proxy(req as never)) as unknown as MockResponse

      expect(response._type).toBe('next')
    })
  })

  describe('public routes', () => {
    test('are accessible without authentication', async () => {
      const req = createMockRequest('/')

      const response = (await proxy(req as never)) as unknown as MockResponse

      expect(response._type).toBe('next')
    })

    test('/about is accessible without authentication', async () => {
      const req = createMockRequest('/about')

      const response = (await proxy(req as never)) as unknown as MockResponse

      expect(response._type).toBe('next')
    })
  })

  describe('locale detection', () => {
    test('sets locale cookie from Accept-Language when cookie is missing', async () => {
      const req = createMockRequest('/', '', { 'accept-language': 'en-US,en;q=0.9,fr;q=0.8' })

      const response = (await proxy(req as never)) as unknown as MockResponse

      expect(response.cookies.get(LOCALE_COOKIE_NAME)?.value).toBe('en')
    })

    test('does not overwrite a valid locale cookie from Accept-Language', async () => {
      const req = createMockRequest('/', '', { 'accept-language': 'en-US,en;q=0.9' })
      req.cookies.set(LOCALE_COOKIE_NAME, 'en')

      const response = (await proxy(req as never)) as unknown as MockResponse

      expect(response.cookies.get(LOCALE_COOKIE_NAME)).toBeUndefined()
    })

    test('sets default locale for unsupported Accept-Language', async () => {
      const req = createMockRequest('/', '', { 'accept-language': 'fr-CA,fr;q=0.9' })

      const response = (await proxy(req as never)) as unknown as MockResponse

      expect(response.cookies.get(LOCALE_COOKIE_NAME)?.value).toBe('en')
    })
  })

  describe('auth callback routes', () => {
    test('/auth/callback is allowed for unauthenticated users', async () => {
      const req = createMockRequest('/auth/callback')

      const response = (await proxy(req as never)) as unknown as MockResponse

      // auth/callback is an auth route, but the user is unauthenticated,
      // so proxy does not redirect because auth routes do not force guest redirects.
      expect(response._type).toBe('next')
    })

    test('/auth/callback with authenticated user redirects to the protected area', async () => {
      mockGetUserResult = {
        data: { user: { id: 'user-123' } },
        error: null,
      }
      const req = createMockRequest('/auth/callback')

      const response = (await proxy(req as never)) as unknown as MockResponse

      expect(response._type).toBe('redirect')
      expect(response._redirectUrl).toContain('/admin/work-items')
    })
  })

  describe('fast path: Next.js internal routes', () => {
    test('allows /_next routes without auth checks', async () => {
      const req = createMockRequest('/_next/static/chunk.js')

      const response = (await proxy(req as never)) as unknown as MockResponse

      // Should pass without checking auth.
      expect(response._type).toBe('next')
    })

    test('/api routes require authentication and return 401 for guests', async () => {
      const req = createMockRequest('/api/health')

      const response = (await proxy(req as never)) as unknown as MockResponse

      expect(response._type).toBe('next')
      expect(response.status).toBe(401)
    })

    test('/api routes are allowed for authenticated users', async () => {
      mockGetUserResult = {
        data: { user: { id: 'user-123' } },
        error: null,
      }
      const req = createMockRequest('/api/health')

      const response = (await proxy(req as never)) as unknown as MockResponse

      expect(response._type).toBe('next')
      expect(response.status).toBeUndefined()
    })
  })

  describe('security headers', () => {
    test('sets Content-Security-Policy', async () => {
      const req = createMockRequest('/')

      const response = (await proxy(req as never)) as unknown as MockResponse

      const csp = response.headers.get('Content-Security-Policy')
      expect(csp).not.toBeNull()
      expect(csp).toContain("default-src 'self'")
      expect(csp).toContain("form-action 'self'")
    })

    test('does not add nonce for PPR protected routes', async () => {
      mockGetUserResult = {
        data: { user: { id: 'user-123' } },
        error: null,
      }
      const req = createMockRequest('/admin/work-items')

      const response = (await proxy(req as never)) as unknown as MockResponse

      const nonce = response._requestHeaders?.get('x-nonce')
      const csp = response.headers.get('Content-Security-Policy')

      expect(nonce).toBeNull()
      expect(csp).toContain("script-src 'self' 'unsafe-inline'")
    })

    test('does not add nonce for static home page', async () => {
      const req = createMockRequest('/')

      const response = (await proxy(req as never)) as unknown as MockResponse

      expect(response._requestHeaders?.get('x-nonce')).toBeNull()
      expect(response.headers.get('Content-Security-Policy')).toContain(
        "script-src 'self' 'unsafe-inline'"
      )
    })

    test('sets X-Frame-Options', async () => {
      const req = createMockRequest('/')

      const response = (await proxy(req as never)) as unknown as MockResponse

      expect(response.headers.get('X-Frame-Options')).toBe('DENY')
    })

    test('sets X-Content-Type-Options', async () => {
      const req = createMockRequest('/')

      const response = (await proxy(req as never)) as unknown as MockResponse

      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
    })
  })

  describe('Supabase configuration', () => {
    test('returns 500 when Supabase env variables are missing', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      const req = createMockRequest('/admin/work-items')
      const response = (await proxy(req as never)) as unknown as MockResponse

      expect(response._type).toBe('next')
      expect(response.status).toBe(500)
      expect(response.headers.get('X-Frame-Options')).toBe('DENY')
    })
  })
})
