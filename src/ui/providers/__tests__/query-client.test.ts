import { beforeEach, describe, expect, mock, test } from 'bun:test'

const mockCaptureError = mock()
const mockNotificationsShow = mock()

mock.module('@/infrastructure/sentry/capture', () => ({
  captureError: mockCaptureError,
}))

mock.module('@/ui/mantine-notifications', () => ({
  notifications: { show: mockNotificationsShow },
}))

const { makeQueryClient, shouldReportQueryError } = await import('../query-client')
const { ServerError } = await import('@/infrastructure/errors/api-error')

beforeEach(() => {
  mockCaptureError.mockReset()
  mockNotificationsShow.mockReset()
})

describe('QueryCache onError', () => {
  test('captures a failing query once and shows a notification', async () => {
    const client = makeQueryClient()
    const error = new ServerError(500, 'boom')

    await client
      .fetchQuery({
        queryKey: ['query-client-test', 'once'],
        queryFn: () => Promise.reject(error),
        retry: false,
      })
      .catch(() => {})

    expect(mockCaptureError).toHaveBeenCalledTimes(1)
    expect(mockCaptureError.mock.calls[0]?.[0]).toBe(error)
    expect(mockNotificationsShow).toHaveBeenCalledTimes(1)
  })

  test('captures the terminal failure only once even after internal retries', async () => {
    const client = makeQueryClient()
    const error = new ServerError(500, 'boom')
    let attempts = 0

    await client
      .fetchQuery({
        queryKey: ['query-client-test', 'retries'],
        queryFn: () => {
          attempts++
          return Promise.reject(error)
        },
        retry: 2,
        retryDelay: 0,
      })
      .catch(() => {})

    expect(attempts).toBe(3) // 1 initial attempt + 2 retries
    expect(mockCaptureError).toHaveBeenCalledTimes(1)
  })

  test('respects meta.silent: still captures, but does not notify', async () => {
    const client = makeQueryClient()
    const error = new ServerError(500, 'boom')

    await client
      .fetchQuery({
        queryKey: ['query-client-test', 'silent'],
        queryFn: () => Promise.reject(error),
        retry: false,
        meta: { silent: true },
      })
      .catch(() => {})

    expect(mockCaptureError).toHaveBeenCalledTimes(1)
    expect(mockNotificationsShow).not.toHaveBeenCalled()
  })

  test('a later, distinct failure of the same query is reported again', async () => {
    const client = makeQueryClient()
    const queryKey = ['query-client-test', 'refetch']

    await client
      .fetchQuery({
        queryKey,
        queryFn: () => Promise.reject(new ServerError(500, 'first')),
        retry: false,
      })
      .catch(() => {})
    // Force a second fetch cycle (staleTime: 0 override) so a brand new terminal error occurs.
    await client
      .fetchQuery({
        queryKey,
        queryFn: () => Promise.reject(new ServerError(500, 'second')),
        retry: false,
        staleTime: 0,
      })
      .catch(() => {})

    expect(mockCaptureError).toHaveBeenCalledTimes(2)
  })

  test('two independent QueryClient instances each capture their own first failure for the same queryKey', async () => {
    // Regression test: dedupe must be scoped per client/query instance, not process-global by
    // queryHash. Server query clients are recreated per RSC request (getServerQueryClient uses
    // React cache()), and the browser client can also be recreated — a distinct client's first
    // terminal failure (errorUpdateCount === 1) for the same queryKey must never be suppressed
    // just because another client already reported errorUpdateCount === 1 for that hash.
    const queryKey = ['query-client-test', 'cross-client']
    const clientA = makeQueryClient()
    const clientB = makeQueryClient()

    await clientA
      .fetchQuery({
        queryKey,
        queryFn: () => Promise.reject(new ServerError(500, 'client-a failure')),
        retry: false,
      })
      .catch(() => {})

    await clientB
      .fetchQuery({
        queryKey,
        queryFn: () => Promise.reject(new ServerError(500, 'client-b failure')),
        retry: false,
      })
      .catch(() => {})

    expect(mockCaptureError).toHaveBeenCalledTimes(2)
  })

  test('a safe-action-shaped error (already captured server-side) is not captured again but is still notified', async () => {
    const client = makeQueryClient()
    const alreadyCapturedError = new Error('[INTERNAL_ERROR] safeAction:captured')

    await client
      .fetchQuery({
        queryKey: ['query-client-test', 'safe-action-captured'],
        queryFn: () => Promise.reject(alreadyCapturedError),
        retry: false,
      })
      .catch(() => {})

    expect(mockCaptureError).not.toHaveBeenCalled()
    expect(mockNotificationsShow).toHaveBeenCalledTimes(1)
  })

  test('a non-safe-action error is still captured normally', async () => {
    const client = makeQueryClient()
    const error = new ServerError(500, 'not from safe-action')

    await client
      .fetchQuery({
        queryKey: ['query-client-test', 'plain-error'],
        queryFn: () => Promise.reject(error),
        retry: false,
      })
      .catch(() => {})

    expect(mockCaptureError).toHaveBeenCalledTimes(1)
    expect(mockCaptureError.mock.calls[0]?.[0]).toBe(error)
  })
})

describe('shouldReportQueryError', () => {
  function fakeQuery(queryHash: string, errorUpdateCount: number) {
    return { queryHash, state: { errorUpdateCount } } as Parameters<
      typeof shouldReportQueryError
    >[0]
  }

  test('reports the first time a query hash/errorUpdatedAt pair is seen', () => {
    expect(shouldReportQueryError(fakeQuery('["dedupe-a"]', 1))).toBe(true)
  })

  test('does not report the same query hash/errorUpdatedAt pair twice', () => {
    const query = fakeQuery('["dedupe-b"]', 100)
    expect(shouldReportQueryError(query)).toBe(true)
    expect(shouldReportQueryError(query)).toBe(false)
  })

  test('reports again once errorUpdatedAt changes for the same query hash', () => {
    expect(shouldReportQueryError(fakeQuery('["dedupe-c"]', 1))).toBe(true)
    expect(shouldReportQueryError(fakeQuery('["dedupe-c"]', 2))).toBe(true)
  })
})
