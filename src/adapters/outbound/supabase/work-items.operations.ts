import 'server-only'

import { array, parse } from 'valibot'
import { throwIfError } from '@/adapters/supabase/throw-supabase-error'
import type { TablesInsert, TablesUpdate, SupabaseServerClient } from '@/adapters/supabase/types'
import {
  WorkItemSchema,
  type CreateWorkItem,
  type UpdateWorkItem,
  type WorkItem,
} from '@/domain/work-item/work-item'
import type { PaginatedWorkItemsResult, WorkItemListParams } from '@/use-cases/work-items/types'

const WORK_ITEM_SELECT = Object.keys(WorkItemSchema.entries).join(', ')
const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 20

function escapeIlike(value: string): string {
  return value
    .replaceAll(',', String.raw`\,`)
    .replaceAll('%', String.raw`\%`)
    .replaceAll('_', String.raw`\_`)
}

function normalizePagination(params: WorkItemListParams) {
  return {
    page: Math.max(params.page ?? DEFAULT_PAGE, 1),
    pageSize: Math.min(Math.max(params.pageSize ?? DEFAULT_PAGE_SIZE, 1), 100),
  }
}

export async function listWorkItemsOperation(
  supabase: SupabaseServerClient,
  params: WorkItemListParams = {}
): Promise<PaginatedWorkItemsResult> {
  const { page, pageSize } = normalizePagination(params)
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase.from('work_items').select(WORK_ITEM_SELECT, { count: 'exact' })

  if (params.status) {
    query = query.eq('status', params.status)
  }

  if (params.priorityOnly) {
    query = query.eq('is_priority', true)
  }

  if (params.labelId) {
    query = query.contains('label_ids', [params.labelId])
  }

  if (params.search) {
    const search = escapeIlike(params.search.trim())
    if (search.length > 0) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }
  }

  const { data, count, error } = await query
    .order('is_priority', { ascending: false })
    .order('updated_at', { ascending: false })
    .range(from, to)

  throwIfError(error, 'list work items')

  return {
    items: parse(array(WorkItemSchema), data ?? []),
    total: count ?? 0,
    page,
    pageSize,
  }
}

export async function getWorkItemOperation(
  supabase: SupabaseServerClient,
  id: string
): Promise<WorkItem> {
  const { data, error } = await supabase
    .from('work_items')
    .select(WORK_ITEM_SELECT)
    .eq('id', id)
    .single()

  throwIfError(error, 'get work item')

  return parse(WorkItemSchema, data)
}

export async function createWorkItemOperation(
  supabase: SupabaseServerClient,
  userId: string,
  input: CreateWorkItem
): Promise<WorkItem> {
  const payload: TablesInsert<'work_items'> = {
    title: input.title,
    description: input.description ?? null,
    is_priority: input.is_priority ?? false,
    label_ids: input.label_ids ?? [],
    created_by: userId,
  }

  const { data, error } = await supabase
    .from('work_items')
    .insert(payload)
    .select(WORK_ITEM_SELECT)
    .single()

  throwIfError(error, 'create work item')

  return parse(WorkItemSchema, data)
}

export async function updateWorkItemOperation(
  supabase: SupabaseServerClient,
  id: string,
  input: UpdateWorkItem
): Promise<WorkItem> {
  const payload: TablesUpdate<'work_items'> = {
    updated_at: new Date().toISOString(),
  }

  if (input.title !== undefined) payload.title = input.title
  if (input.description !== undefined) payload.description = input.description
  if (input.is_priority !== undefined) payload.is_priority = input.is_priority
  if (input.label_ids !== undefined) payload.label_ids = input.label_ids

  const { data, error } = await supabase
    .from('work_items')
    .update(payload)
    .eq('id', id)
    .select(WORK_ITEM_SELECT)
    .single()

  throwIfError(error, 'update work item')

  return parse(WorkItemSchema, data)
}

async function updateWorkItemStatus(
  supabase: SupabaseServerClient,
  id: string,
  status: 'active' | 'archived'
): Promise<WorkItem> {
  const { data, error } = await supabase
    .from('work_items')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(WORK_ITEM_SELECT)
    .single()

  throwIfError(error, `set work item status to ${status}`)

  return parse(WorkItemSchema, data)
}

export function archiveWorkItemOperation(supabase: SupabaseServerClient, id: string) {
  return updateWorkItemStatus(supabase, id, 'archived')
}

export function restoreWorkItemOperation(supabase: SupabaseServerClient, id: string) {
  return updateWorkItemStatus(supabase, id, 'active')
}
