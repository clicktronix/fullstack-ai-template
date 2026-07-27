import { getRequestId } from '@/infrastructure/api/context'
import { apiJson } from '@/infrastructure/api/response'
import { withRouteErrorHandling } from '@/infrastructure/api/with-route-error-handling'
import { pilotWorkItemsServer } from '@/modules/pilot-work-items/server'

export const GET = withRouteErrorHandling(
  'architecture-pilot/work-items',
  async (request: Request) => {
    const items = await pilotWorkItemsServer.list()
    return apiJson(items, getRequestId(request))
  }
)
