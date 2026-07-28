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
 * Shared auth verifies the provider identity only. Product roles and account state belong
 * to the identity capability and are resolved through its public server surface.
 */
export const createAuthenticatedContext = cache(async (): Promise<AuthenticatedContext> => {
  const supabase = await createClient()
  const userId = await requireAuthenticatedUserId(supabase)
  return { supabase, userId }
})
