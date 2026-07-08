import type { QueryClient } from '@tanstack/react-query'
import { getLabelsAction } from '@/adapters/inbound/next/server-actions/labels'
import { labelKeys } from './keys'

// NOTE: this queryFn runs through the same QueryClient/QueryCache as client-side fetches, so
// query failures here are already captured exactly once by the QueryCache onError config in
// ui/providers/query-client.ts. Do not also wrap this with withServerReadErrorHandling —
// prefetchQuery shares the cache's error dispatch, so that would double-capture the same
// failure. withServerReadErrorHandling is for RSC reads that bypass TanStack Query entirely.
export function prefetchLabels(queryClient: QueryClient) {
  return queryClient.prefetchQuery({
    queryKey: labelKeys.list(),
    queryFn: () => getLabelsAction(),
  })
}
