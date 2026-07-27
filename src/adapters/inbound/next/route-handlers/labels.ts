import 'server-only'

import { createSupabaseLabelsRepository } from '@/adapters/outbound/supabase/labels.repository'
import { createApiHandlerContext } from '@/infrastructure/api/context'
import { apiJson } from '@/infrastructure/api/response'
import { withRouteErrorHandling } from '@/infrastructure/api/with-route-error-handling'
import { listLabels } from '@/use-cases/labels/labels'

export const handleListLabelsRequest = withRouteErrorHandling(
  'labels',
  async (request: Request) => {
    const context = await createApiHandlerContext(request, { allowedRoles: ['owner', 'admin'] })
    const labels = await listLabels({
      labels: createSupabaseLabelsRepository(context.supabase),
    })

    return apiJson(labels, context.requestId)
  }
)
