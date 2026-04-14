/**
 * Application-wide constants
 */

/**
 * Default route for authenticated users after login
 */
export const DEFAULT_AUTHENTICATED_ROUTE = '/admin/work-items'

/**
 * Route configuration for authentication and authorization
 */
export const ROUTES = {
  /**
   * Protected routes that require authentication
   * Users without valid session will be redirected to login
   */
  PROTECTED: ['/profile', '/admin'] as const,

  /**
   * Auth routes that authenticated users should not access
   * Authenticated users will be redirected to DEFAULT_AUTHENTICATED_ROUTE
   */
  AUTH: ['/login', '/signup', '/auth/callback', '/auth/error'] as const,

  /**
   * Public routes
   */
  PUBLIC: {
    HOME: '/',
  } as const,
} as const

/**
 * Type-safe route helpers
 */
export type ProtectedRoute = (typeof ROUTES.PROTECTED)[number]
export type AuthRoute = (typeof ROUTES.AUTH)[number]
export type PublicRoute = (typeof ROUTES.PUBLIC)[keyof typeof ROUTES.PUBLIC]
