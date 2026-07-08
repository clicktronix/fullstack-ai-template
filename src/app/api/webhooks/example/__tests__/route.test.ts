import { beforeEach, describe, expect, mock, test } from 'bun:test'

const mockCaptureError = mock()

mock.module('@/infrastructure/sentry/capture', () => ({
  captureError: mockCaptureError,
}))

const { POST } = await import('../route')

async function signPayload(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

describe('/api/webhooks/example route handler', () => {
  beforeEach(() => {
    process.env.EXAMPLE_WEBHOOK_SECRET = 'test-webhook-secret'
    mockCaptureError.mockReset()
  })

  // Regression test: a missing EXAMPLE_WEBHOOK_SECRET previously returned a 500 Response
  // directly, bypassing withRouteErrorHandling's catch block — so it was logged but never
  // captured to Sentry. It must now throw so the wrapper captures it.
  test('captures a 500 to Sentry (via a generic envelope) when EXAMPLE_WEBHOOK_SECRET is missing', async () => {
    delete process.env.EXAMPLE_WEBHOOK_SECRET

    const response = await POST(
      new Request('https://template.test/api/webhooks/example', {
        method: 'POST',
        body: JSON.stringify({ event: 'work_item.created' }),
      })
    )
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error.code).toBe('INTERNAL_ERROR')
    expect(body.error.message).toBe('Internal server error')
    expect(mockCaptureError).toHaveBeenCalledTimes(1)
  })

  test('rejects requests without a webhook signature', async () => {
    const response = await POST(
      new Request('https://template.test/api/webhooks/example', {
        method: 'POST',
        body: JSON.stringify({ event: 'work_item.created' }),
      })
    )
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error.code).toBe('AUTHENTICATION_ERROR')
  })

  test('rejects malformed webhook signatures without throwing', async () => {
    const response = await POST(
      new Request('https://template.test/api/webhooks/example', {
        method: 'POST',
        headers: { 'x-webhook-signature': 'z'.repeat(64) },
        body: JSON.stringify({ event: 'work_item.created' }),
      })
    )
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error.code).toBe('AUTHENTICATION_ERROR')
  })

  test('accepts requests with a valid HMAC signature', async () => {
    const payload = JSON.stringify({ event: 'work_item.created', id: 'evt_123' })
    const signature = await signPayload('test-webhook-secret', payload)

    const response = await POST(
      new Request('https://template.test/api/webhooks/example', {
        method: 'POST',
        headers: { 'x-webhook-signature': `sha256=${signature}` },
        body: payload,
      })
    )
    const body = await response.json()

    expect(response.status).toBe(202)
    expect(body.data).toEqual({ accepted: true })
    expect(body.requestId).toBeString()
  })
})
