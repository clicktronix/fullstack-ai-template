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
 * Session refresh is handled by middleware.
 *
 * Обёрнуто в React.cache() для дедупликации на уровне запроса —
 * при множественных вызовах в одном серверном рендере создаётся только один контекст.
 * Роль загружается один раз и кэшируется вместе с контекстом,
 * исключая повторные DB-запросы в assertNotPendingRole/assertOwnerRole.
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
