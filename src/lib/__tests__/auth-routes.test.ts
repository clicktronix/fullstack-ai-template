import { describe, expect, test } from 'bun:test'
import { DEFAULT_AUTHENTICATED_ROUTE } from '@/lib/constants'
import { isAuthRoute, isProtectedRoute, isPublicRoute, getPostLoginRedirect } from '../auth-routes'

describe('isAuthRoute', () => {
  test('returns true for /login', () => {
    expect(isAuthRoute('/login')).toBe(true)
  })

  test('returns true for /auth/callback', () => {
    expect(isAuthRoute('/auth/callback')).toBe(true)
  })

  test('returns true for /login with nested path', () => {
    expect(isAuthRoute('/login/extra')).toBe(true)
  })

  test('returns true for /auth/callback with query params', () => {
    expect(isAuthRoute('/auth/callback?code=123')).toBe(true)
  })

  test('returns false for /admin/work-items', () => {
    expect(isAuthRoute('/admin/work-items')).toBe(false)
  })

  test('returns false for /', () => {
    expect(isAuthRoute('/')).toBe(false)
  })

  test('returns false for /profile', () => {
    expect(isAuthRoute('/profile')).toBe(false)
  })

  test('returns true for /loginpage (startsWith /login)', () => {
    expect(isAuthRoute('/loginpage')).toBe(true)
  })

  test('returns false for empty string', () => {
    expect(isAuthRoute('')).toBe(false)
  })
})

describe('isProtectedRoute', () => {
  test('returns true for /admin', () => {
    expect(isProtectedRoute('/admin')).toBe(true)
  })

  test('returns true for /admin/work-items', () => {
    expect(isProtectedRoute('/admin/work-items')).toBe(true)
  })

  test('returns true for /profile', () => {
    expect(isProtectedRoute('/profile')).toBe(true)
  })

  test('returns false for /docs', () => {
    expect(isProtectedRoute('/docs')).toBe(false)
  })

  test('returns false for /docs/getting-started', () => {
    expect(isProtectedRoute('/docs/getting-started')).toBe(false)
  })

  test('returns true for /profile/edit', () => {
    expect(isProtectedRoute('/profile/edit')).toBe(true)
  })

  test('returns false for /login', () => {
    expect(isProtectedRoute('/login')).toBe(false)
  })

  test('returns false for /', () => {
    expect(isProtectedRoute('/')).toBe(false)
  })

  test('returns false for /about', () => {
    expect(isProtectedRoute('/about')).toBe(false)
  })

  test('returns false for empty string', () => {
    expect(isProtectedRoute('')).toBe(false)
  })
})

describe('isPublicRoute', () => {
  test('returns true for /', () => {
    expect(isPublicRoute('/')).toBe(true)
  })

  test('returns true for /about', () => {
    expect(isPublicRoute('/about')).toBe(true)
  })

  test('returns true for /pricing', () => {
    expect(isPublicRoute('/pricing')).toBe(true)
  })

  test('returns true for /terms', () => {
    expect(isPublicRoute('/terms')).toBe(true)
  })

  test('returns false for /admin (protected)', () => {
    expect(isPublicRoute('/admin')).toBe(false)
  })

  test('returns false for /login (auth)', () => {
    expect(isPublicRoute('/login')).toBe(false)
  })

  test('returns false for /profile (protected)', () => {
    expect(isPublicRoute('/profile')).toBe(false)
  })

  test('returns false for /auth/callback (auth)', () => {
    expect(isPublicRoute('/auth/callback')).toBe(false)
  })

  test('returns true for unknown routes', () => {
    expect(isPublicRoute('/unknown/route')).toBe(true)
  })

  test('returns true for empty string', () => {
    expect(isPublicRoute('')).toBe(true)
  })
})

describe('getPostLoginRedirect', () => {
  test('returns redirect param when valid protected route', () => {
    const params = new URLSearchParams('redirect=/admin/work-items')

    expect(getPostLoginRedirect(params)).toBe('/admin/work-items')
  })

  test('returns redirect param when valid public route', () => {
    const params = new URLSearchParams('redirect=/about')

    expect(getPostLoginRedirect(params)).toBe('/about')
  })

  test('returns DEFAULT_AUTHENTICATED_ROUTE when redirect is auth route (prevent loop)', () => {
    const params = new URLSearchParams('redirect=/login')

    expect(getPostLoginRedirect(params)).toBe(DEFAULT_AUTHENTICATED_ROUTE)
  })

  test('returns DEFAULT_AUTHENTICATED_ROUTE when redirect is /auth/callback', () => {
    const params = new URLSearchParams('redirect=/auth/callback')

    expect(getPostLoginRedirect(params)).toBe(DEFAULT_AUTHENTICATED_ROUTE)
  })

  test('returns DEFAULT_AUTHENTICATED_ROUTE when no redirect param', () => {
    const params = new URLSearchParams('')

    expect(getPostLoginRedirect(params)).toBe(DEFAULT_AUTHENTICATED_ROUTE)
  })

  test('returns DEFAULT_AUTHENTICATED_ROUTE when redirect param is empty', () => {
    const params = new URLSearchParams('redirect=')

    expect(getPostLoginRedirect(params)).toBe(DEFAULT_AUTHENTICATED_ROUTE)
  })

  test('preserves full path with query params in redirect', () => {
    const params = new URLSearchParams('redirect=/admin/work-items?view=board')

    expect(getPostLoginRedirect(params)).toBe('/admin/work-items?view=board')
  })

  test('returns redirect when it is root path', () => {
    const params = new URLSearchParams('redirect=/')

    expect(getPostLoginRedirect(params)).toBe('/')
  })

  test('handles multiple params correctly', () => {
    const params = new URLSearchParams('redirect=/profile&other=value')

    expect(getPostLoginRedirect(params)).toBe('/profile')
  })
})
