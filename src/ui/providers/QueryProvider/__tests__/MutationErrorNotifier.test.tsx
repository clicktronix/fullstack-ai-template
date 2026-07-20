import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { IntlProvider } from 'react-intl'

const mockNotificationsShow = mock()
const mockAddBreadcrumb = mock()
const mockCaptureException = mock()
const mockCaptureError = mock()

mock.module('@/ui/mantine-notifications', () => ({
  notifications: { show: mockNotificationsShow },
}))

// Regression test for finding 6: MutationErrorNotifier previously kept its own copy of the
// `getSentry` memoized-import helper duplicated from `infrastructure/sentry/capture.ts`. It
// now imports the shared `getSentry` export from that module instead.
mock.module('@/infrastructure/sentry/capture', () => ({
  captureError: mockCaptureError,
  getSentry: () =>
    Promise.resolve({
      addBreadcrumb: mockAddBreadcrumb,
      captureException: mockCaptureException,
    }),
}))

const { MutationErrorNotifier } = await import('../MutationErrorNotifier')

function Wrapper({ queryClient }: { queryClient: QueryClient }) {
  return (
    <IntlProvider locale="en" messages={{}}>
      <QueryClientProvider client={queryClient}>
        <MutationErrorNotifier />
      </QueryClientProvider>
    </IntlProvider>
  )
}

beforeEach(() => {
  mockNotificationsShow.mockReset()
  mockAddBreadcrumb.mockReset()
  mockCaptureError.mockReset()
  mockCaptureException.mockReset()
})

describe('MutationErrorNotifier', () => {
  test('shows a notification and adds a Sentry breadcrumb (not a capture) for a failed mutation', async () => {
    const queryClient = new QueryClient({
      mutationCache: new MutationCache(),
    })

    render(<Wrapper queryClient={queryClient} />)

    const error = new Error('[INTERNAL_ERROR] safeAction:captured')

    const mutation = queryClient
      .getMutationCache()
      .build(queryClient, { mutationFn: () => Promise.reject(error) })

    await mutation.execute(undefined).catch(() => {})

    await waitFor(() => {
      expect(mockNotificationsShow).toHaveBeenCalledTimes(1)
    })

    // This channel only breadcrumbs — the mutation was already captured once at its
    // originating boundary (safe-action's handleServerError). Capturing again here would
    // double-report the same incident.
    expect(mockAddBreadcrumb).toHaveBeenCalledTimes(1)
    expect(mockCaptureError).not.toHaveBeenCalled()
    expect(mockCaptureException).not.toHaveBeenCalled()
  })
})
