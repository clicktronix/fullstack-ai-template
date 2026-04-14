import { parse } from 'valibot'
import {
  CreateWorkItemSchema,
  UpdateWorkItemSchema,
  type CreateWorkItem,
  type UpdateWorkItem,
  type WorkItem,
} from '@/domain/work-item/work-item'
import type { WorkItemsRepository } from './ports'
import type { PaginatedWorkItemsResult, WorkItemListParams } from './types'

type WorkItemsDeps = {
  workItems: WorkItemsRepository
}

export async function listWorkItems(
  deps: WorkItemsDeps,
  params: WorkItemListParams = {}
): Promise<PaginatedWorkItemsResult> {
  return deps.workItems.list(params)
}

export async function getWorkItem(deps: WorkItemsDeps, id: string): Promise<WorkItem> {
  return deps.workItems.getById(id)
}

export async function createWorkItem(
  deps: WorkItemsDeps,
  input: CreateWorkItem
): Promise<WorkItem> {
  const validated = parse(CreateWorkItemSchema, input)
  return deps.workItems.create(validated)
}

export async function updateWorkItem(
  deps: WorkItemsDeps,
  id: string,
  input: UpdateWorkItem
): Promise<WorkItem> {
  const validated = parse(UpdateWorkItemSchema, input)
  return deps.workItems.update(id, validated)
}

export async function archiveWorkItem(deps: WorkItemsDeps, id: string): Promise<WorkItem> {
  return deps.workItems.archive(id)
}

export async function restoreWorkItem(deps: WorkItemsDeps, id: string): Promise<WorkItem> {
  return deps.workItems.restore(id)
}
