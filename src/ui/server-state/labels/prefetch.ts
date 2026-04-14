import type { QueryClient } from '@tanstack/react-query'
import { getLabelsAction } from '@/adapters/inbound/next/server-actions/labels'
import { labelKeys } from './keys'

export function prefetchLabels(queryClient: QueryClient) {
  return queryClient.prefetchQuery({
    queryKey: labelKeys.list(),
    queryFn: () => getLabelsAction(),
  })
}
