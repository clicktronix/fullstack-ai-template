'use client'

import type { UseQueryOptions } from '@tanstack/react-query'
import {
  getWorkItemAction,
  getWorkItemsAction,
} from '@/adapters/inbound/next/server-actions/work-items'
import type { WorkItem } from '@/domain/work-item/work-item'
import { useAuthenticatedQuery } from '@/ui/server-state/auth/authenticated-query'
import { GC_TIME, STALE_TIME } from '@/ui/server-state/constants'
import type { PaginatedWorkItemsResult, WorkItemListParams } from '@/use-cases/work-items/types'
import { workItemKeys } from './keys'

export function getWorkItemsQueryOptions(params?: WorkItemListParams) {
  return {
    queryKey: workItemKeys.list(params),
    queryFn: () => getWorkItemsAction(params),
    staleTime: STALE_TIME.FREQUENT_DATA,
    gcTime: GC_TIME.FREQUENT_DATA,
  } as const
}

export function useWorkItems(
  params?: WorkItemListParams,
  options?: Omit<UseQueryOptions<PaginatedWorkItemsResult>, 'queryKey' | 'queryFn'>
) {
  return useAuthenticatedQuery({
    ...getWorkItemsQueryOptions(params),
    ...options,
  })
}

export function useWorkItem(
  id: string,
  options?: Omit<UseQueryOptions<WorkItem>, 'queryKey' | 'queryFn'>
) {
  return useAuthenticatedQuery({
    queryKey: workItemKeys.detail(id),
    queryFn: () => getWorkItemAction(id),
    enabled: !!id,
    staleTime: STALE_TIME.FREQUENT_DATA,
    gcTime: GC_TIME.FREQUENT_DATA,
    ...options,
  })
}
