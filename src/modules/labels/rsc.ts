import 'server-only'

import type { QueryClient } from '@tanstack/react-query'
import { readIdentityContext } from '@/modules/identity/server'
import { createAuthenticatedContext } from '@/shared/server/auth/authenticated-context'
import { labelKeys } from './cache'
import { listLabels } from './server'

export async function readLabels() {
  const context = await createAuthenticatedContext()
  const identity = await readIdentityContext({ supabase: context.supabase }, context.userId)
  return listLabels(identity, { supabase: context.supabase })
}

export function prefetchLabels(queryClient: QueryClient) {
  return queryClient.prefetchQuery({
    queryKey: labelKeys.list(),
    queryFn: readLabels,
  })
}

export type { Label } from './server'
