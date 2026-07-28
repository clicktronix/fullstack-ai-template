import 'server-only'

import { createActionError } from '@/shared/kernel/errors/action-error'
import { AUTHORIZATION_ERROR } from '@/shared/kernel/errors/codes'
import type { SupabaseServerClient } from '@/shared/server/supabase/types'
import {
  CreateWorkItemSchema,
  UpdateWorkItemSchema,
  WorkItemStatusSchema,
  type CreateWorkItem,
  type UpdateWorkItem,
  type WorkItem,
} from './domain/work-item'
import type { PaginatedWorkItemsResult, WorkItemListParams } from './domain/work-item-list'
import {
  archiveWorkItemInStore,
  createWorkItemInStore,
  getWorkItemFromStore,
  listWorkItemsFromStore,
  restoreWorkItemInStore,
  updateWorkItemInStore,
} from './server/store'

export type WorkItemsIdentity = {
  actorId: string
  role: string
}

export type WorkItemsEffects = {
  supabase: SupabaseServerClient
}

function assertCanManageWorkItems(identity: WorkItemsIdentity): void {
  if (identity.role !== 'owner' && identity.role !== 'admin') {
    throw createActionError(AUTHORIZATION_ERROR, 'workItems: insufficient role')
  }
}

export function listWorkItems(
  identity: WorkItemsIdentity,
  effects: WorkItemsEffects,
  params: WorkItemListParams = {}
): Promise<PaginatedWorkItemsResult> {
  assertCanManageWorkItems(identity)
  return listWorkItemsFromStore(effects.supabase, params)
}

export function getWorkItem(
  identity: WorkItemsIdentity,
  effects: WorkItemsEffects,
  id: string
): Promise<WorkItem> {
  assertCanManageWorkItems(identity)
  return getWorkItemFromStore(effects.supabase, id)
}

export function createWorkItem(
  identity: WorkItemsIdentity,
  effects: WorkItemsEffects,
  input: CreateWorkItem
): Promise<WorkItem> {
  assertCanManageWorkItems(identity)
  return createWorkItemInStore(effects.supabase, identity.actorId, input)
}

export function updateWorkItem(
  identity: WorkItemsIdentity,
  effects: WorkItemsEffects,
  id: string,
  input: UpdateWorkItem
): Promise<WorkItem> {
  assertCanManageWorkItems(identity)
  return updateWorkItemInStore(effects.supabase, id, input)
}

export function archiveWorkItem(
  identity: WorkItemsIdentity,
  effects: WorkItemsEffects,
  id: string
): Promise<WorkItem> {
  assertCanManageWorkItems(identity)
  return archiveWorkItemInStore(effects.supabase, id)
}

export function restoreWorkItem(
  identity: WorkItemsIdentity,
  effects: WorkItemsEffects,
  id: string
): Promise<WorkItem> {
  assertCanManageWorkItems(identity)
  return restoreWorkItemInStore(effects.supabase, id)
}

export {
  CreateWorkItemSchema,
  UpdateWorkItemSchema,
  WorkItemStatusSchema,
  type CreateWorkItem,
  type UpdateWorkItem,
  type WorkItem,
}
export type { PaginatedWorkItemsResult, WorkItemListParams } from './domain/work-item-list'
