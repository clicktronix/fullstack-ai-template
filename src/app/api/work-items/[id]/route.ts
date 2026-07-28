import { readIdentityContext } from '@/modules/identity/server'
import { getWorkItem } from '@/modules/work-items/server'
import { createApiHandlerContext } from '@/shared/server/api/context'
import { apiJson } from '@/shared/server/api/response'
import { withRouteErrorHandling } from '@/shared/server/api/with-route-error-handling'

type RouteContext = {
  params: Promise<{ id: string }>
}

export type WorkItemRouteDependencies = {
  createContext: typeof createApiHandlerContext
  getWorkItem: typeof getWorkItem
  readIdentityContext: typeof readIdentityContext
}

const defaultDependencies: WorkItemRouteDependencies = {
  createContext: createApiHandlerContext,
  getWorkItem,
  readIdentityContext,
}

export function createWorkItemRouteHandler(overrides: Partial<WorkItemRouteDependencies> = {}) {
  const dependencies: WorkItemRouteDependencies = { ...defaultDependencies, ...overrides }

  return withRouteErrorHandling('work-item', async (request: Request, { params }: RouteContext) => {
    const context = await dependencies.createContext(request)
    const identity = await dependencies.readIdentityContext(
      { supabase: context.supabase },
      context.userId
    )
    const { id } = await params
    const result = await dependencies.getWorkItem(identity, { supabase: context.supabase }, id)
    return apiJson(result, context.requestId)
  })
}

export const GET = createWorkItemRouteHandler()
