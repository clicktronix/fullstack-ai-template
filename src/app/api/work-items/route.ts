import { boolean, number, object, optional, parse, string } from 'valibot'
import { readIdentityContext } from '@/modules/identity/server'
import {
  createWorkItem,
  listWorkItems,
  CreateWorkItemSchema,
  WorkItemStatusSchema,
  type WorkItem,
  type WorkItemListParams,
} from '@/modules/work-items/server'
import { createActionError } from '@/shared/kernel/errors/action-error'
import { VALIDATION_ERROR } from '@/shared/kernel/errors/codes'
import { createApiHandlerContext } from '@/shared/server/api/context'
import { runIdempotentCommand } from '@/shared/server/api/idempotency'
import { apiErrorWithCode, apiJson } from '@/shared/server/api/response'
import { withRouteErrorHandling } from '@/shared/server/api/with-route-error-handling'

const WorkItemsApiQuerySchema = object({
  search: optional(string()),
  labelId: optional(string()),
  priorityOnly: optional(boolean()),
  status: optional(WorkItemStatusSchema),
  page: optional(number()),
  pageSize: optional(number()),
})

function parseOptionalPositiveInteger(value: string | null, field: string): number | undefined {
  if (value === null) return undefined
  const numberValue = Number(value)
  if (!value.trim() || !Number.isInteger(numberValue) || numberValue < 1) {
    throw createActionError(VALIDATION_ERROR, `workItems.query.${field}`)
  }
  return numberValue
}

function parseOptionalBoolean(value: string | null): boolean | undefined {
  if (value === null) return undefined
  if (value === 'true') return true
  if (value === 'false') return false
  throw createActionError(VALIDATION_ERROR, 'workItems.query.priorityOnly')
}

function parseListParams(request: Request): WorkItemListParams {
  const { searchParams } = new URL(request.url)
  const parsed = parse(WorkItemsApiQuerySchema, {
    search: searchParams.get('search') ?? undefined,
    labelId: searchParams.get('labelId') ?? undefined,
    priorityOnly: parseOptionalBoolean(searchParams.get('priorityOnly')),
    status: searchParams.get('status') ?? undefined,
    page: parseOptionalPositiveInteger(searchParams.get('page'), 'page'),
    pageSize: parseOptionalPositiveInteger(searchParams.get('pageSize'), 'pageSize'),
  })

  return parsed
}

async function capabilityContext(
  context: Awaited<ReturnType<typeof createApiHandlerContext>>,
  resolveIdentity: typeof readIdentityContext
) {
  return {
    identity: await resolveIdentity({ supabase: context.supabase }, context.userId),
    effects: { supabase: context.supabase },
  }
}

export type WorkItemsRouteDependencies = {
  createContext: typeof createApiHandlerContext
  createWorkItem: typeof createWorkItem
  listWorkItems: typeof listWorkItems
  readIdentityContext: typeof readIdentityContext
  runIdempotentCommand: typeof runIdempotentCommand<WorkItem>
}

const defaultDependencies: WorkItemsRouteDependencies = {
  createContext: createApiHandlerContext,
  createWorkItem,
  listWorkItems,
  readIdentityContext,
  runIdempotentCommand,
}

export function createWorkItemsRouteHandlers(overrides: Partial<WorkItemsRouteDependencies> = {}) {
  const dependencies: WorkItemsRouteDependencies = { ...defaultDependencies, ...overrides }

  const GET = withRouteErrorHandling('work-items', async (request: Request) => {
    const context = await dependencies.createContext(request)
    const capability = await capabilityContext(context, dependencies.readIdentityContext)
    const result = await dependencies.listWorkItems(
      capability.identity,
      capability.effects,
      parseListParams(request)
    )
    return apiJson(result, context.requestId)
  })

  const POST = withRouteErrorHandling('work-items', async (request: Request) => {
    const context = await dependencies.createContext(request)
    const idempotencyKey = request.headers.get('idempotency-key')

    if (!idempotencyKey) {
      return apiErrorWithCode(VALIDATION_ERROR, context.requestId, 400)
    }

    const input = parse(CreateWorkItemSchema, await request.json())
    const capability = await capabilityContext(context, dependencies.readIdentityContext)
    const result = await dependencies.runIdempotentCommand({
      context,
      key: idempotencyKey,
      method: 'POST',
      path: new URL(request.url).pathname,
      requestBody: input,
      statusCode: 201,
      command: async () => {
        return dependencies.createWorkItem(capability.identity, capability.effects, input)
      },
    })

    return apiJson(result.data, context.requestId, {
      status: 201,
      headers: { 'x-idempotency-replayed': String(result.replayed) },
    })
  })

  return { GET, POST }
}

export const { GET, POST } = createWorkItemsRouteHandlers()
