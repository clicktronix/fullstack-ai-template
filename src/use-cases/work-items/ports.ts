import type { CreateWorkItem, UpdateWorkItem, WorkItem } from '@/domain/work-item/work-item'
import type { PaginatedWorkItemsResult, WorkItemListParams } from './types'

export type WorkItemsRepository = {
  list: (params: WorkItemListParams) => Promise<PaginatedWorkItemsResult>
  getById: (id: string) => Promise<WorkItem>
  create: (input: CreateWorkItem) => Promise<WorkItem>
  update: (id: string, input: UpdateWorkItem) => Promise<WorkItem>
  archive: (id: string) => Promise<WorkItem>
  restore: (id: string) => Promise<WorkItem>
}
