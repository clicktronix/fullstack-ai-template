import { readIdentityContext } from '@/modules/identity/server'
import { listLabels } from '@/modules/labels/server'
import { createApiHandlerContext } from '@/shared/server/api/context'
import { apiJson } from '@/shared/server/api/response'
import { withRouteErrorHandling } from '@/shared/server/api/with-route-error-handling'

export type LabelsRouteDependencies = {
  createContext: typeof createApiHandlerContext
  listLabels: typeof listLabels
  readIdentityContext: typeof readIdentityContext
}

const defaultDependencies: LabelsRouteDependencies = {
  createContext: createApiHandlerContext,
  listLabels,
  readIdentityContext,
}

export function createLabelsRouteHandler(overrides: Partial<LabelsRouteDependencies> = {}) {
  const dependencies: LabelsRouteDependencies = { ...defaultDependencies, ...overrides }

  return withRouteErrorHandling('labels', async (request: Request) => {
    const context = await dependencies.createContext(request)
    const identity = await dependencies.readIdentityContext(
      { supabase: context.supabase },
      context.userId
    )
    const labels = await dependencies.listLabels(identity, { supabase: context.supabase })
    return apiJson(labels, context.requestId)
  })
}

export const GET = createLabelsRouteHandler()
