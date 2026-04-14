import { DEFAULT_AUTHENTICATED_ROUTE, ROUTES } from '@/lib/constants'

/**
 * Check if pathname is an auth route (login, register, OAuth callback).
 * Auth routes are accessible only to unauthenticated users.
 *
 * @param pathname - Current pathname
 * @returns true if pathname is an auth route
 */
export function isAuthRoute(pathname: string): boolean {
  return ROUTES.AUTH.some((route) => pathname.startsWith(route))
}

/**
 * Check if pathname is a protected route (admin, profile).
 * Protected routes require authentication.
 *
 * @param pathname - Current pathname
 * @returns true if pathname is a protected route
 */
export function isProtectedRoute(pathname: string): boolean {
  return ROUTES.PROTECTED.some((route) => pathname.startsWith(route))
}

/**
 * Check if pathname is a public route (home, about, etc.).
 * Public routes are accessible to all users.
 *
 * @param pathname - Current pathname
 * @returns true if pathname is a public route
 */
export function isPublicRoute(pathname: string): boolean {
  return !isAuthRoute(pathname) && !isProtectedRoute(pathname)
}

/**
 * Get redirect URL after successful login.
 * Checks 'redirect' query param, validates it's a safe relative path, falls back to default route.
 *
 * @param searchParams - URLSearchParams from login page
 * @returns Safe redirect URL
 */
export function getPostLoginRedirect(searchParams: URLSearchParams): string {
  const redirect = searchParams.get('redirect')

  // Validate redirect:
  // 1. Must exist
  // 2. Must start with '/' (relative path only - prevents open redirect to external URLs)
  // 3. Must not start with '//' (protocol-relative URLs)
  // 4. Must not be an auth route (prevent redirect loops)
  if (
    redirect &&
    redirect.startsWith('/') &&
    !redirect.startsWith('//') &&
    !isAuthRoute(redirect)
  ) {
    return redirect
  }

  return DEFAULT_AUTHENTICATED_ROUTE
}
