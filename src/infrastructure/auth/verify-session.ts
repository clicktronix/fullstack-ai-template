import 'server-only'
import { cache } from 'react'
import { parse } from 'valibot'
import { createClient } from '@/adapters/supabase/server'
import { UserSchema, type User } from '@/domain/user/user'
import { logger } from '@/lib/logger'
import { getAuthenticatedUserId } from './authenticated-user'

/**
 * Session type for authenticated user.
 */
export type AuthSession = {
  user: User
}

/**
 * Verify user session using Supabase Auth.
 *
 * Architecture:
 * - Called in layout.tsx and page.tsx (React cache deduplicates within same render)
 * - Uses Supabase SSR client for session management
 * - Fetches user data from public.users table
 *
 * Flow:
 * 1. Get Supabase user from auth (validates JWT)
 * 2. Fetch user record from public.users table
 * 3. Return session with user data or null
 *
 * Cache Behavior:
 * - React cache() deduplicates calls within same SSR request
 * - Multiple verifySession() calls in layout + page = single execution
 * - Each navigation/refresh creates new cache instance
 *
 * @returns AuthSession with user data, or null if not authenticated
 *
 * @example
 * ```ts
 * // In layout.tsx or page.tsx
 * const session = await verifySession()
 * if (!session) redirect('/login')
 * ```
 */
export const verifySession = cache(async (): Promise<AuthSession | null> => {
  try {
    const supabase = await createClient()

    const userId = await getAuthenticatedUserId(supabase)
    if (!userId) return null

    // Fetch user record from public.users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, role, full_name, created_at, updated_at')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      logger.error('[Auth] User authenticated but no record in public.users:', {
        authUserId: userId,
        error: userError?.message,
      })
      return null
    }

    // Validate user data with schema
    const user = parse(UserSchema, userData)

    return { user }
  } catch (error) {
    logger.error('[Auth] Session verification failed:', error)
    return null
  }
})
