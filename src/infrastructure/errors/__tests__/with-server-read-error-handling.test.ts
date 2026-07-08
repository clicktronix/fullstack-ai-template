import { beforeEach, describe, expect, mock, test } from 'bun:test'

const mockCaptureError = mock()

mock.module('@/infrastructure/sentry/capture', () => ({
  captureError: mockCaptureError,
}))

const { withServerReadErrorHandling } = await import('../with-server-read-error-handling')
const { createActionError } = await import('../action-error')
const { NotFoundError, ServerError } = await import('../api-error')
const { VALIDATION_ERROR } = await import('../codes')

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
    const read = withServerReadErrorHandling('example.read', async () => {
      throw serverError
    })

    await expect(read()).rejects.toBe(serverError)
    expect(mockCaptureError).toHaveBeenCalledTimes(1)
    expect(mockCaptureError).toHaveBeenCalledWith(serverError, { tags: { read: 'example.read' } })
  })

  test('captures a generic uncoded error exactly once, then rethrows it', async () => {
    const generic = new Error('unexpected failure')
    const read = withServerReadErrorHandling('example.read', async () => {
      throw generic
    })

    await expect(read()).rejects.toBe(generic)
    expect(mockCaptureError).toHaveBeenCalledTimes(1)
  })
})
