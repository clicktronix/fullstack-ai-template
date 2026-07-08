import { getRequestId } from '@/infrastructure/api/context'
import { apiErrorWithCode, apiJson } from '@/infrastructure/api/response'
import { verifyWebhookSignature } from '@/infrastructure/api/webhooks'
import { withRouteErrorHandling } from '@/infrastructure/api/with-route-error-handling'
import { getServerEnv } from '@/infrastructure/env/server'
import { createHttpError } from '@/infrastructure/errors/api-error'
import { AUTHENTICATION_ERROR } from '@/infrastructure/errors/codes'
import { serverLogger } from '@/infrastructure/logging/server-logger'

export const POST = withRouteErrorHandling('webhooks/example', async (request: Request) => {
  const requestId = getRequestId(request)
  const payload = await request.text()
  const secret = getServerEnv().EXAMPLE_WEBHOOK_SECRET

  if (!secret) {
    serverLogger.error({ requestId }, 'example webhook secret is not configured')
    // Throw (instead of returning a Response) so withRouteErrorHandling's catch block
    // converts + captures this as an unexpected 5xx. The public envelope stays generic
    // (INTERNAL_ERROR / "Internal server error") — only the Sentry-side detail differs.
    throw createHttpError(500, 'EXAMPLE_WEBHOOK_SECRET is not configured')
  }

  const isValid = verifyWebhookSignature(
    payload,
    request.headers.get('x-webhook-signature'),
    secret
  )

  if (!isValid) {
    return apiErrorWithCode(AUTHENTICATION_ERROR, requestId)
  }

  serverLogger.info({ requestId }, 'example webhook accepted')
  return apiJson({ accepted: true }, requestId, { status: 202 })
})
