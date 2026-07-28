import type { WorkItem } from './work-item'

export type WorkItemListParams = {
  search?: string
  labelId?: string
  priorityOnly?: boolean
  status?: 'active' | 'archived'
  page?: number
  pageSize?: number
}

export type PaginatedWorkItemsResult = {
  items: WorkItem[]
  total: number
  page: number
  pageSize: number
}
