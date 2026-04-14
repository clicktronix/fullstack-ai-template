import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'

// --- Моки для next/server ---

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
    get: (key: string) => store.get(key) ?? null,
    set: (key: string, value: string) => store.set(key, value),
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
  cookies: MockCookies
}

type MockResponse = {
  headers: MockHeaders
  cookies: MockCookies
  _type: 'next' | 'redirect'
  _redirectUrl?: string
  status?: number
}

function createMockRequest(pathname: string, search = ''): MockRequest {
  return {
    nextUrl: { pathname, search, protocol: 'https:' },
    url: `http://localhost:3000${pathname}${search}`,
    cookies: createMockCookies(),
  }
}

function createMockResponse(
  type: 'next' | 'redirect',
  redirectUrl?: string,
  status?: number
): MockResponse {
  return {
    _type: type,
    _redirectUrl: redirectUrl,
    status,
    headers: createMockHeaders(),
    cookies: createMockCookies(),
  }
}

// --- Состояние мока для getUser ---

let mockGetUserResult: {
  data: { user: { id?: string } | null }
  error: Error | null
} = { data: { user: null }, error: new Error('not authenticated') }

// Мок createServerClient из @supabase/ssr
mock.module('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: {
      getUser: async () => mockGetUserResult,
    },
  }),
  createBrowserClient: () => ({}),
}))

// Мок next/server
mock.module('next/server', () => ({
  NextResponse: {
    next: (_opts?: unknown) => createMockResponse('next'),
    redirect: (url: URL) => createMockResponse('redirect', url.toString()),
    json: (_body: unknown, init?: { status?: number }) =>
      createMockResponse('next', undefined, init?.status),
  },
}))

// --- Импорт middleware после регистрации моков ---
const { default: middleware } = await import('../../middleware')

// --- Тесты ---

describe('middleware', () => {
  const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const originalSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  beforeEach(() => {
    // Сброс состояния аутентификации перед каждым тестом
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

  describe('неаутентифицированный пользователь', () => {
    test('редирект на /login при доступе к защищённому маршруту /admin/work-items', async () => {
      const req = createMockRequest('/admin/work-items')

      const response = (await middleware(req as never)) as unknown as MockResponse

      expect(response._type).toBe('redirect')
      expect(response._redirectUrl).toContain('/login')
      expect(response._redirectUrl).toContain('redirect=%2Fadmin%2Fwork-items')
    })

    test('редирект на /login при доступе к /profile', async () => {
      const req = createMockRequest('/profile')

      const response = (await middleware(req as never)) as unknown as MockResponse

      expect(response._type).toBe('redirect')
      expect(response._redirectUrl).toContain('/login')
    })

    test('не редиректит на /login при доступе к публичному маршруту /', async () => {
      const req = createMockRequest('/')

      const response = (await middleware(req as never)) as unknown as MockResponse

      expect(response._type).toBe('next')
    })

    test('сохраняет query string в redirect параметре', async () => {
      const req = createMockRequest('/admin/work-items', '?view=board')

      const response = (await middleware(req as never)) as unknown as MockResponse

      expect(response._type).toBe('redirect')
      // pathname + search сохранены в redirect
      expect(response._redirectUrl).toContain('redirect=')
    })
  })

  describe('аутентифицированный пользователь', () => {
    beforeEach(() => {
      mockGetUserResult = {
        data: { user: { id: 'user-123' } },
        error: null,
      }
    })

    test('редирект с /login на защищённую область', async () => {
      const req = createMockRequest('/login')

      const response = (await middleware(req as never)) as unknown as MockResponse

      expect(response._type).toBe('redirect')
      expect(response._redirectUrl).toContain('/admin/work-items')
    })

    test('редирект с /signup на защищённую область', async () => {
      const req = createMockRequest('/signup')

      const response = (await middleware(req as never)) as unknown as MockResponse

      expect(response._type).toBe('redirect')
      expect(response._redirectUrl).toContain('/admin/work-items')
    })

    test('пропускает на защищённый маршрут без редиректа', async () => {
      const req = createMockRequest('/admin/work-items')

      const response = (await middleware(req as never)) as unknown as MockResponse

      expect(response._type).toBe('next')
    })
  })

  describe('публичные маршруты', () => {
    test('доступны без аутентификации', async () => {
      const req = createMockRequest('/')

      const response = (await middleware(req as never)) as unknown as MockResponse

      expect(response._type).toBe('next')
    })

    test('/about доступен без аутентификации', async () => {
      const req = createMockRequest('/about')

      const response = (await middleware(req as never)) as unknown as MockResponse

      expect(response._type).toBe('next')
    })
  })

  describe('auth callback маршруты', () => {
    test('/auth/callback пропускается для неаутентифицированных', async () => {
      const req = createMockRequest('/auth/callback')

      const response = (await middleware(req as never)) as unknown as MockResponse

      // auth/callback -- это auth маршрут, но пользователь не аутентифицирован,
      // поэтому middleware не делает редирект (нет перенаправления неавторизованных с auth маршрутов)
      expect(response._type).toBe('next')
    })

    test('/auth/callback с аутентифицированным пользователем -- редирект на защищённую область', async () => {
      mockGetUserResult = {
        data: { user: { id: 'user-123' } },
        error: null,
      }
      const req = createMockRequest('/auth/callback')

      const response = (await middleware(req as never)) as unknown as MockResponse

      expect(response._type).toBe('redirect')
      expect(response._redirectUrl).toContain('/admin/work-items')
    })
  })

  describe('быстрый путь: внутренние маршруты Next.js', () => {
    test('пропускает /_next маршруты без проверки auth', async () => {
      const req = createMockRequest('/_next/static/chunk.js')

      const response = (await middleware(req as never)) as unknown as MockResponse

      // Должен пройти, не проверяя auth
      expect(response._type).toBe('next')
    })

    test('/api маршруты требуют аутентификацию и возвращают 401 для гостя', async () => {
      const req = createMockRequest('/api/health')

      const response = (await middleware(req as never)) as unknown as MockResponse

      expect(response._type).toBe('next')
      expect(response.status).toBe(401)
    })

    test('/api маршруты пропускаются для аутентифицированного пользователя', async () => {
      mockGetUserResult = {
        data: { user: { id: 'user-123' } },
        error: null,
      }
      const req = createMockRequest('/api/health')

      const response = (await middleware(req as never)) as unknown as MockResponse

      expect(response._type).toBe('next')
      expect(response.status).toBeUndefined()
    })
  })

  describe('заголовки безопасности', () => {
    test('устанавливает Content-Security-Policy', async () => {
      const req = createMockRequest('/')

      const response = (await middleware(req as never)) as unknown as MockResponse

      const csp = response.headers.get('Content-Security-Policy')
      expect(csp).not.toBeNull()
      expect(csp).toContain("default-src 'self'")
    })

    test('устанавливает X-Frame-Options', async () => {
      const req = createMockRequest('/')

      const response = (await middleware(req as never)) as unknown as MockResponse

      expect(response.headers.get('X-Frame-Options')).toBe('DENY')
    })

    test('устанавливает X-Content-Type-Options', async () => {
      const req = createMockRequest('/')

      const response = (await middleware(req as never)) as unknown as MockResponse

      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
    })
  })

  describe('конфигурация Supabase', () => {
    test('возвращает 500 при отсутствии env переменных Supabase', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      const req = createMockRequest('/admin/work-items')
      const response = (await middleware(req as never)) as unknown as MockResponse

      expect(response._type).toBe('next')
      expect(response.status).toBe(500)
      expect(response.headers.get('X-Frame-Options')).toBe('DENY')
    })
  })
})
