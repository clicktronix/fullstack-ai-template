import 'server-only'

import type { QueryClient } from '@tanstack/react-query'
import { readIdentityContext } from '@/modules/identity/server'
import { createAuthenticatedContext } from '@/shared/server/auth/authenticated-context'
import { workItemKeys } from './query-cache'
import { getWorkItem, listWorkItems, type WorkItemListParams } from './server'

async function toCapabilityContext(
  context: Awaited<ReturnType<typeof createAuthenticatedContext>>
) {
  return {
    identity: await readIdentityContext({ supabase: context.supabase }, context.userId),
    effects: { supabase: context.supabase },
  }
}

export async function readWorkItems(params: WorkItemListParams = {}) {
  const context = await toCapabilityContext(await createAuthenticatedContext())
  return listWorkItems(context.identity, context.effects, params)
}

export async function readWorkItem(id: string) {
  const context = await toCapabilityContext(await createAuthenticatedContext())
  return getWorkItem(context.identity, context.effects, id)
}

export function prefetchWorkItems(queryClient: QueryClient, params: WorkItemListParams = {}) {
  return queryClient.prefetchQuery({
    queryKey: workItemKeys.list(params),
    queryFn: () => readWorkItems(params),
  })
}

export function prefetchWorkItem(queryClient: QueryClient, id: string) {
  return queryClient.prefetchQuery({
    queryKey: workItemKeys.detail(id),
    queryFn: () => readWorkItem(id),
  })
}

export type { PaginatedWorkItemsResult, WorkItem, WorkItemListParams } from './server'
