/**
 * Query keys factory for auth-related queries.
 * Follows TanStack Query best practices for cache management.
 */
export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
  user: () => [...authKeys.all, 'user'] as const,
}
