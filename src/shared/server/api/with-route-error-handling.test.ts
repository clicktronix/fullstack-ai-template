import { beforeEach, describe, expect, mock, test } from 'bun:test'

const mockCaptureError = mock()

mock.module('@/shared/server/observability/capture', () => ({
  captureError: mockCaptureError,
  getSentry: () =>
    Promise.resolve({
      addBreadcrumb: mock(),
      captureException: mock(),
    }),
}))

const { withRouteErrorHandling } = await import('./with-route-error-handling')
const { UnauthorizedError } = await import('@/shared/kernel/errors/api-error')

function makeRequest(requestId = 'req-1') {
  return new Request('https://template.test/api/example', {
    method: 'POST',
    headers: { 'x-request-id': requestId },
  })
}

beforeEach(() => {
  mockCaptureError.mockReset()
})

describe('withRouteErrorHandling', () => {
  test('passes through a successful response unchanged', async () => {
    const handler = withRouteErrorHandling('example', async () => Response.json({ ok: true }))

    const response = await handler(makeRequest())

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
    expect(mockCaptureError).not.toHaveBeenCalled()
  })

  test('maps a typed ApiError to its status + public envelope without capturing', async () => {
    const handler = withRouteErrorHandling('example', async () => {
      throw new UnauthorizedError('nope')
    })

    const response = await handler(makeRequest('req-2'))
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body).toEqual({
      error: { code: 'AUTHENTICATION_ERROR', message: 'Authentication required' },
      requestId: 'req-2',
    })
    expect(mockCaptureError).not.toHaveBeenCalled()
  })

  test('maps an unexpected error to 500, never leaking the raw message, and captures once', async () => {
    const raw = new Error('database connection string leaked here')
    const handler = withRouteErrorHandling('example', async () => {
      throw raw
    })

    const response = await handler(makeRequest('req-3'))
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error.code).toBe('INTERNAL_ERROR')
    expect(JSON.stringify(body)).not.toContain('database connection string')

    expect(mockCaptureError).toHaveBeenCalledTimes(1)
    expect(mockCaptureError.mock.calls[0]?.[0]).toBe(raw)
    expect(mockCaptureError.mock.calls[0]?.[1]).toEqual({
      tags: { route: 'example', method: 'POST' },
      extra: { requestId: 'req-3' },
    })
  })
})
