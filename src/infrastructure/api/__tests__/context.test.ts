import { beforeEach, describe, expect, mock, test } from 'bun:test'

const mockCreateAuthenticatedContext = mock()

mock.module('@/infrastructure/auth/authenticated-context', () => ({
  createAuthenticatedContext: mockCreateAuthenticatedContext,
}))

const { createApiHandlerContext, getRequestId } = await import('../context')

function makeAuthContext(role = 'admin') {
  return { supabase: {}, userId: 'user-1', role }
}

beforeEach(() => {
  mockCreateAuthenticatedContext.mockReset()
  mockCreateAuthenticatedContext.mockResolvedValue(makeAuthContext())
})

describe('getRequestId', () => {
  test('returns the header value when present', () => {
    const request = new Request('https://template.test/api/example', {
      headers: { 'x-request-id': 'req-from-header' },
    })

    expect(getRequestId(request)).toBe('req-from-header')
  })

  // Regression test for finding 5: getRequestId(request) is called both by
  // withRouteErrorHandling and by createApiHandlerContext for the same Request. Without
  // memoization, each call to `crypto.randomUUID()` mints a different id when no header is
  // present, so a success response's x-request-id would disagree with the id used to tag an
  // error/Sentry capture for the very same request.
  test('memoizes the minted id per Request instance when no header is present', () => {
    const request = new Request('https://template.test/api/example')

    const first = getRequestId(request)
    const second = getRequestId(request)

    expect(first).toBe(second)
  })

  test('a different Request instance gets its own minted id', () => {
    const requestA = new Request('https://template.test/api/example')
    const requestB = new Request('https://template.test/api/example')

    expect(getRequestId(requestA)).not.toBe(getRequestId(requestB))
  })
})

describe('createApiHandlerContext + getRequestId agreement', () => {
  test('the id withRouteErrorHandling would use matches the handler context requestId', async () => {
    const request = new Request('https://template.test/api/example')

    // Simulates withRouteErrorHandling calling getRequestId(request) up front, before the
    // handler (which calls createApiHandlerContext) runs.
    const idFromRouteWrapper = getRequestId(request)
    const context = await createApiHandlerContext(request)

    expect(context.requestId).toBe(idFromRouteWrapper)
  })

  test('still agrees when createApiHandlerContext runs before the route wrapper reads it', async () => {
    const request = new Request('https://template.test/api/example')

    const context = await createApiHandlerContext(request)
    const idFromRouteWrapper = getRequestId(request)

    expect(context.requestId).toBe(idFromRouteWrapper)
  })

  test('an explicit x-request-id header flows through unchanged to the handler context', async () => {
    const request = new Request('https://template.test/api/example', {
      headers: { 'x-request-id': 'client-supplied-id' },
    })

    const context = await createApiHandlerContext(request)

    expect(context.requestId).toBe('client-supplied-id')
  })
})
