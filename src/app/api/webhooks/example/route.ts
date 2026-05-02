import { getRequestId } from '@/infrastructure/api/context'
import { apiErrorWithCode, apiJson } from '@/infrastructure/api/response'
import { verifyWebhookSignature } from '@/infrastructure/api/webhooks'
import { getServerEnv } from '@/infrastructure/env/server'
import { AUTHENTICATION_ERROR, INTERNAL_ERROR } from '@/lib/errors/codes'
import { serverLogger } from '@/lib/server-logger'

export async function POST(request: Request) {
  const requestId = getRequestId(request)
  const payload = await request.text()
  const secret = getServerEnv().EXAMPLE_WEBHOOK_SECRET

  if (!secret) {
    serverLogger.error({ requestId }, 'example webhook secret is not configured')
    return apiErrorWithCode(INTERNAL_ERROR, requestId)
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
}
