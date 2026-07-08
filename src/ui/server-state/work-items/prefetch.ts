import type { QueryClient } from '@tanstack/react-query'
import { getWorkItemsAction } from '@/adapters/inbound/next/server-actions/work-items'
import type { WorkItemListParams } from '@/use-cases/work-items/types'
import { workItemKeys } from './keys'

// NOTE: this queryFn runs through the same QueryClient/QueryCache as client-side fetches, so
// query failures here are already captured exactly once by the QueryCache onError config in
// ui/providers/query-client.ts. Do not also wrap this with withServerReadErrorHandling —
// prefetchQuery shares the cache's error dispatch, so that would double-capture the same
// failure. withServerReadErrorHandling is for RSC reads that bypass TanStack Query entirely.
export function prefetchWorkItems(queryClient: QueryClient, params?: WorkItemListParams) {
  return queryClient.prefetchQuery({
    queryKey: workItemKeys.list(params),
    queryFn: () => getWorkItemsAction(params),
  })
}
