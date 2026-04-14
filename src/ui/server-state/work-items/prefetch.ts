import type { QueryClient } from '@tanstack/react-query'
import { getWorkItemsAction } from '@/adapters/inbound/next/server-actions/work-items'
import type { WorkItemListParams } from '@/use-cases/work-items/types'
import { workItemKeys } from './keys'

export function prefetchWorkItems(queryClient: QueryClient, params?: WorkItemListParams) {
  return queryClient.prefetchQuery({
    queryKey: workItemKeys.list(params),
    queryFn: () => getWorkItemsAction(params),
  })
}
