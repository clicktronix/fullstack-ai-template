import 'server-only'

import { cache } from 'react'
import { createClient } from '@/adapters/supabase/server'
import { requireAuthenticatedUserId } from './authenticated-user'

export type AuthenticatedContext = {
  supabase: Awaited<ReturnType<typeof createClient>>
  userId: string
  role: string
}

/**
 * Create authenticated context for server-side code.
 * Works in Server Components, Server Actions, and Route Handlers.
 * Session refresh is handled by proxy.
 *
 * Wrapped in React.cache() for per-request deduplication.
 * Multiple calls during one server render create only one context.
 * Role is loaded once and cached with the context, avoiding repeated
 * DB queries in assertNotPendingRole/assertOwnerRole.
 *
 * Performance note: the template reads role from `public.users` for portability.
 * At scale, move stable role data into Supabase JWT custom claims via Auth Hooks
 * and read it from the verified token to remove this DB round-trip.
 */
export const createAuthenticatedContext = cache(async (): Promise<AuthenticatedContext> => {
  const supabase = await createClient()
  const userId = await requireAuthenticatedUserId(supabase)

  const { data: user, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (error || !user) {
    throw new Error('Failed to fetch user role')
  }

  return { supabase, userId, role: user.role as string }
})
