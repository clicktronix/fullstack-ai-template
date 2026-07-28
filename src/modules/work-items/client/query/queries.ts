'use client'

import type { UseQueryOptions } from '@tanstack/react-query'
import { array, number, object, parse } from 'valibot'
import { useAuthenticatedQuery } from '@/modules/identity/client'
import { createHttpError } from '@/shared/kernel/errors/api-error'
import { GC_TIME, STALE_TIME } from '@/shared/ui/query/constants'
import { WorkItemSchema } from '../../domain/work-item'
import { workItemKeys } from '../../query-cache'
import type { PaginatedWorkItemsResult, WorkItem, WorkItemListParams } from './types'

const WorkItemsEnvelopeSchema = object({
  data: object({
    items: array(WorkItemSchema),
    total: number(),
    page: number(),
    pageSize: number(),
  }),
})

const WorkItemEnvelopeSchema = object({
  data: WorkItemSchema,
})

function toSearchParams(params: WorkItemListParams = {}): string {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) searchParams.set(key, String(value))
  }
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

async function readApiData(response: Response): Promise<unknown> {
  if (!response.ok) {
    throw createHttpError(response.status, `Request failed: ${response.statusText}`)
  }
  return response.json()
}

async function fetchWorkItems(params?: WorkItemListParams): Promise<PaginatedWorkItemsResult> {
  const response = await fetch(`/api/work-items${toSearchParams(params)}`, {
    method: 'GET',
    cache: 'no-store',
  })
  return parse(WorkItemsEnvelopeSchema, await readApiData(response)).data
}

async function fetchWorkItem(id: string): Promise<WorkItem> {
  const response = await fetch(`/api/work-items/${encodeURIComponent(id)}`, {
    method: 'GET',
    cache: 'no-store',
  })
  return parse(WorkItemEnvelopeSchema, await readApiData(response)).data
}

function getWorkItemsQueryOptions(params?: WorkItemListParams) {
  return {
    queryKey: workItemKeys.list(params),
    queryFn: () => fetchWorkItems(params),
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
    queryFn: () => fetchWorkItem(id),
    enabled: !!id,
    staleTime: STALE_TIME.FREQUENT_DATA,
    gcTime: GC_TIME.FREQUENT_DATA,
    ...options,
  })
}
