import type { WorkItemListParams } from '@/use-cases/work-items/types'

export const workItemKeys = {
  all: ['work-items'] as const,
  lists: () => [...workItemKeys.all, 'list'] as const,
  list: (params?: WorkItemListParams) => [...workItemKeys.lists(), params ?? {}] as const,
  details: () => [...workItemKeys.all, 'detail'] as const,
  detail: (id: string) => [...workItemKeys.details(), id] as const,
}
