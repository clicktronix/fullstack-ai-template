import { createApiHandlerContext } from '@/infrastructure/api/context'
import { apiJson } from '@/infrastructure/api/response'
import { withRouteErrorHandling } from '@/infrastructure/api/with-route-error-handling'
import { createPilotWorkItemsServer } from '@/modules/pilot-work-items/server'

export const GET = withRouteErrorHandling(
  'architecture-pilot/work-items',
  async (request: Request) => {
    const context = await createApiHandlerContext(request, {
      allowedRoles: ['owner', 'admin'],
    })
    const items = await createPilotWorkItemsServer(context).list()
    return apiJson(items, context.requestId)
  }
)
