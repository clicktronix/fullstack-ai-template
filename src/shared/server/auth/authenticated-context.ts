import 'server-only'

import { cache } from 'react'
import { createClient } from '@/shared/server/supabase/server'
import { requireAuthenticatedUserId } from './authenticated-user'

export type AuthenticatedContext = {
  supabase: Awaited<ReturnType<typeof createClient>>
  userId: string
}

/**
 * Create the capability-neutral authenticated context for server-side code.
 *
 * This is a user-scoped context: the cookie client and verified actor come from
 * the same session. Product roles and account state belong to the identity
 * capability. Privileged clients use a separate context and factory.
 */
export const createAuthenticatedContext = cache(async (): Promise<AuthenticatedContext> => {
  const supabase = await createClient()
  const userId = await requireAuthenticatedUserId(supabase)
  return { supabase, userId }
})
