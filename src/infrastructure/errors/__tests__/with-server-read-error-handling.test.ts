import { beforeEach, describe, expect, mock, test } from 'bun:test'

const mockCaptureError = mock()

mock.module('@/infrastructure/sentry/capture', () => ({
  captureError: mockCaptureError,
  getSentry: () =>
    Promise.resolve({
      addBreadcrumb: mock(),
      captureException: mock(),
    }),
}))

const { withServerReadErrorHandling } = await import('../with-server-read-error-handling')
const { createActionError, withCapturedActionContext } = await import('../action-error')
const { NotFoundError, ServerError } = await import('../api-error')
const { DATA_PROVIDER_ERROR, INTERNAL_ERROR, VALIDATION_ERROR } = await import('../codes')

beforeEach(() => {
  mockCaptureError.mockReset()
})

describe('withServerReadErrorHandling', () => {
  test('passes through a successful read unchanged', async () => {
    const read = withServerReadErrorHandling('example.read', async () => 'data')

    await expect(read()).resolves.toBe('data')
    expect(mockCaptureError).not.toHaveBeenCalled()
  })

  test('rethrows an already-coded action error without capturing again (already captured upstream)', async () => {
    const codedError = createActionError(VALIDATION_ERROR, 'someAction')
    const read = withServerReadErrorHandling('example.read', async () => {
      throw codedError
    })

    await expect(read()).rejects.toBe(codedError)
    expect(mockCaptureError).not.toHaveBeenCalled()
  })

  test('rethrows a typed 4xx ApiError for the error boundary, without capturing', async () => {
    const notFound = new NotFoundError('missing')
    const read = withServerReadErrorHandling('example.read', async () => {
      throw notFound
    })

    await expect(read()).rejects.toBe(notFound)
    expect(mockCaptureError).not.toHaveBeenCalled()
  })

  test('captures an unexpected (5xx) uncoded error exactly once, then rethrows it', async () => {
    const serverError = new ServerError(500, 'db unavailable')
    const read = withServerReadErrorHandling(
      'example.read',
      async () => {
        throw serverError
      },
      { requestId: 'read-request' }
    )

    await expect(read()).rejects.toBe(serverError)
    expect(mockCaptureError).toHaveBeenCalledTimes(1)
    expect(mockCaptureError).toHaveBeenCalledWith(serverError, {
      tags: { read: 'example.read' },
      request: { requestId: 'read-request' },
    })
  })

  test('captures a generic uncoded error exactly once, then rethrows it', async () => {
    const generic = new Error('unexpected failure')
    const read = withServerReadErrorHandling('example.read', async () => {
      throw generic
    })

    await expect(read()).rejects.toBe(generic)
    expect(mockCaptureError).toHaveBeenCalledTimes(1)
  })

  // Codex round-3: a CODED but UNMARKED 5xx error is not proof of an upstream capture —
  // only the :captured marker is. Unmarked 5xx-coded errors are captured here once.
  test('captures an unmarked 5xx-coded action error exactly once, then rethrows it', async () => {
    const coded = createActionError(DATA_PROVIDER_ERROR, 'useCaseOrigin')
    const read = withServerReadErrorHandling('readX', async () => {
      throw coded
    })

    await expect(read()).rejects.toThrow(coded.message)
    expect(mockCaptureError).toHaveBeenCalledTimes(1)
  })

  test('rethrows a MARKED coded error without capturing again', async () => {
    const marked = createActionError(INTERNAL_ERROR, withCapturedActionContext('origin'))
    const read = withServerReadErrorHandling('readY', async () => {
      throw marked
    })

    await expect(read()).rejects.toThrow(marked.message)
    expect(mockCaptureError).not.toHaveBeenCalled()
  })

  test('rethrows an unmarked 4xx-coded action error without capturing', async () => {
    const coded = createActionError(VALIDATION_ERROR, 'formOrigin')
    const read = withServerReadErrorHandling('readZ', async () => {
      throw coded
    })

    await expect(read()).rejects.toThrow(coded.message)
    expect(mockCaptureError).not.toHaveBeenCalled()
  })
})
