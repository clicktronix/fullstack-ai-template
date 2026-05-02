import 'server-only'

import { revalidateTag } from 'next/cache'
import { boolean, number, object, optional, parse, string } from 'valibot'
import { createSupabaseWorkItemsRepository } from '@/adapters/outbound/supabase/work-items.repository'
import { CreateWorkItemSchema, WorkItemStatusSchema } from '@/domain/work-item/work-item'
import { createApiHandlerContext, getRequestId } from '@/infrastructure/api/context'
import { runIdempotentCommand } from '@/infrastructure/api/idempotency'
import { apiError, apiErrorWithCode, apiJson } from '@/infrastructure/api/response'
import { cacheTags } from '@/infrastructure/cache/tags'
import { VALIDATION_ERROR } from '@/lib/errors/codes'
import { createWorkItem, listWorkItems } from '@/use-cases/work-items/work-items'

const WorkItemsApiQuerySchema = object({
  search: optional(string()),
  labelId: optional(string()),
  priorityOnly: optional(boolean()),
  status: optional(WorkItemStatusSchema),
  page: optional(number()),
  pageSize: optional(number()),
})

function parseOptionalNumber(value: string | null): number | undefined {
  if (!value) return undefined
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : undefined
}

function parseOptionalBoolean(value: string | null): boolean | undefined {
  if (value === null) return undefined
  return value === 'true'
}

function parseListParams(request: Request) {
  const { searchParams } = new URL(request.url)
  return parse(WorkItemsApiQuerySchema, {
    search: searchParams.get('search') ?? undefined,
    labelId: searchParams.get('labelId') ?? undefined,
    priorityOnly: parseOptionalBoolean(searchParams.get('priorityOnly')),
    status: searchParams.get('status') ?? undefined,
    page: parseOptionalNumber(searchParams.get('page')),
    pageSize: parseOptionalNumber(searchParams.get('pageSize')),
  })
}

function revalidateWorkItemsApiCache(userId: string, id?: string) {
  revalidateTag(cacheTags.workItems.user(userId), 'minutes')
  revalidateTag(cacheTags.workItems.lists(userId), 'minutes')
  revalidateTag(cacheTags.workItems.all, 'minutes')

  if (id) {
    revalidateTag(cacheTags.workItems.detail(userId, id), 'minutes')
  }
}

export async function handleListWorkItemsRequest(request: Request) {
  const requestId = getRequestId(request)

  try {
    const context = await createApiHandlerContext(request, { allowedRoles: ['owner', 'admin'] })
    const result = await listWorkItems(
      { workItems: createSupabaseWorkItemsRepository(context.supabase, context.userId) },
      parseListParams(request)
    )

    return apiJson(result, context.requestId)
  } catch (error) {
    return apiError(error, requestId)
  }
}

export async function handleCreateWorkItemRequest(request: Request) {
  const requestId = getRequestId(request)

  try {
    const context = await createApiHandlerContext(request, { allowedRoles: ['owner', 'admin'] })
    const idempotencyKey = request.headers.get('idempotency-key')

    if (!idempotencyKey) {
      return apiErrorWithCode(VALIDATION_ERROR, context.requestId, 400)
    }

    const body = await request.json()
    const input = parse(CreateWorkItemSchema, body)

    const result = await runIdempotentCommand({
      context,
      key: idempotencyKey,
      method: 'POST',
      path: new URL(request.url).pathname,
      requestBody: input,
      statusCode: 201,
      command: async () => {
        const workItem = await createWorkItem(
          { workItems: createSupabaseWorkItemsRepository(context.supabase, context.userId) },
          input
        )
        revalidateWorkItemsApiCache(context.userId, workItem.id)
        return workItem
      },
    })

    return apiJson(result.data, context.requestId, {
      status: 201,
      headers: {
        'x-idempotency-replayed': String(result.replayed),
      },
    })
  } catch (error) {
    return apiError(error, requestId)
  }
}
