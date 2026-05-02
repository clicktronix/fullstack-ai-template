import { MantineProvider } from '@mantine/core'
import { cleanup, render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, test, mock, beforeAll, afterAll, afterEach } from 'bun:test'
import { IntlProvider } from 'react-intl'
import {
  NetworkError,
  ServerError,
  RateLimitError,
  UnauthorizedError,
  ClientError,
  createHttpError,
} from '@/lib/errors/api-error'
import { VALIDATION_ERROR } from '@/lib/errors/codes'
import { ApiErrorBoundary, withApiErrorBoundary } from '../index'

// Wrapper for Mantine and Intl components
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <IntlProvider locale="en" messages={{}}>
      <MantineProvider>{children}</MantineProvider>
    </IntlProvider>
  )
}

// Component that throws an error
function ThrowingComponent({ error }: { error: Error }): never {
  throw error
}

// Normal component
function NormalComponent() {
  return <div>Normal content</div>
}

describe('ApiErrorBoundary', () => {
  // Suppress console.error during tests
  const originalError = console.error
  beforeAll(() => {
    console.error = () => {}
  })
  afterAll(() => {
    console.error = originalError
  })
  afterEach(() => {
    cleanup()
  })

  describe('rendering', () => {
    test('renders children when no error', () => {
      render(
        <TestWrapper>
          <ApiErrorBoundary>
            <NormalComponent />
          </ApiErrorBoundary>
        </TestWrapper>
      )

      expect(screen.getByText('Normal content')).toBeDefined()
    })

    test('renders custom fallback when provided', () => {
      const fallback = <div>Custom fallback</div>

      render(
        <TestWrapper>
          <ApiErrorBoundary fallback={fallback}>
            <ThrowingComponent error={new Error('Test error')} />
          </ApiErrorBoundary>
        </TestWrapper>
      )

      expect(screen.getByText('Custom fallback')).toBeDefined()
    })
  })

  describe('error types', () => {
    test('displays network error message', () => {
      render(
        <TestWrapper>
          <ApiErrorBoundary>
            <ThrowingComponent error={new NetworkError('Network failed')} />
          </ApiErrorBoundary>
        </TestWrapper>
      )

      expect(screen.getByText('Connection Error')).toBeDefined()
      expect(screen.getByText(/check your internet connection/i)).toBeDefined()
    })

    test('displays server error message', () => {
      render(
        <TestWrapper>
          <ApiErrorBoundary>
            <ThrowingComponent error={new ServerError(500, 'Internal Server Error')} />
          </ApiErrorBoundary>
        </TestWrapper>
      )

      expect(screen.getByText('Server Error')).toBeDefined()
      expect(screen.getByText(/try again later/i)).toBeDefined()
    })

    test('displays rate limit error with retry delay', () => {
      render(
        <TestWrapper>
          <ApiErrorBoundary>
            <ThrowingComponent error={new RateLimitError(30, 'Rate limited')} />
          </ApiErrorBoundary>
        </TestWrapper>
      )

      expect(screen.getByText('Too Many Requests')).toBeDefined()
      expect(screen.getByText(/30 seconds/i)).toBeDefined()
    })

    test('displays unauthorized error message', () => {
      render(
        <TestWrapper>
          <ApiErrorBoundary>
            <ThrowingComponent error={new UnauthorizedError('Unauthorized')} />
          </ApiErrorBoundary>
        </TestWrapper>
      )

      expect(screen.getByText('Session Expired')).toBeDefined()
    })

    test('displays generic client error message', () => {
      render(
        <TestWrapper>
          <ApiErrorBoundary>
            <ThrowingComponent error={new ClientError(400, 'Bad request')} />
          </ApiErrorBoundary>
        </TestWrapper>
      )

      expect(screen.getByText('Request Failed')).toBeDefined()
    })

    test('maps backend error_code to user-friendly message', () => {
      render(
        <TestWrapper>
          <ApiErrorBoundary>
            <ThrowingComponent
              error={createHttpError(422, 'Unprocessable', { errorCode: VALIDATION_ERROR })}
            />
          </ApiErrorBoundary>
        </TestWrapper>
      )

      // Title should be "Invalid Input"
      expect(screen.getByText('Invalid Input')).toBeDefined()
      // Message should contain user-friendly text (use getAllByText as both title and message contain "invalid")
      expect(screen.getAllByText(/invalid/i).length).toBeGreaterThan(0)
    })

    test('displays generic error message for non-API errors', () => {
      render(
        <TestWrapper>
          <ApiErrorBoundary>
            <ThrowingComponent error={new Error('Random error')} />
          </ApiErrorBoundary>
        </TestWrapper>
      )

      expect(screen.getByText('Unexpected Error')).toBeDefined()
    })
  })

  describe('retry functionality', () => {
    test('shows retry button for retryable errors', () => {
      const onRetry = mock(() => {})

      render(
        <TestWrapper>
          <ApiErrorBoundary onRetry={onRetry}>
            <ThrowingComponent error={new NetworkError('Network failed')} />
          </ApiErrorBoundary>
        </TestWrapper>
      )

      expect(screen.getByText('Try Again')).toBeDefined()
    })

    test('calls onRetry when retry button clicked', () => {
      const onRetry = mock(() => {})

      render(
        <TestWrapper>
          <ApiErrorBoundary onRetry={onRetry}>
            <ThrowingComponent error={new NetworkError('Network failed')} />
          </ApiErrorBoundary>
        </TestWrapper>
      )

      fireEvent.click(screen.getByText('Try Again'))
      expect(onRetry).toHaveBeenCalled()
    })

    test('does not show retry button for non-retryable errors when no onRetry', () => {
      render(
        <TestWrapper>
          <ApiErrorBoundary>
            <ThrowingComponent error={new ClientError(400, 'Bad request')} />
          </ApiErrorBoundary>
        </TestWrapper>
      )

      expect(screen.queryByText('Try Again')).toBeNull()
    })
  })

  describe('unauthorized handling', () => {
    test('calls onUnauthorized for 401 errors', () => {
      const onUnauthorized = mock(() => {})

      render(
        <TestWrapper>
          <ApiErrorBoundary onUnauthorized={onUnauthorized}>
            <ThrowingComponent error={new UnauthorizedError('Unauthorized')} />
          </ApiErrorBoundary>
        </TestWrapper>
      )

      expect(onUnauthorized).toHaveBeenCalled()
    })
  })

  describe('variant prop', () => {
    test('renders centered full-page error when variant is fullPage', () => {
      const { container } = render(
        <TestWrapper>
          <ApiErrorBoundary variant="fullPage">
            <ThrowingComponent error={new NetworkError('Network failed')} />
          </ApiErrorBoundary>
        </TestWrapper>
      )

      // Should have a centered container with 100vh height
      const centerElement = container.querySelector('[class*="mantine-Center"]')
      expect(centerElement).toBeDefined()
    })

    test('renders inline alert when variant is inline', () => {
      render(
        <TestWrapper>
          <ApiErrorBoundary variant="inline">
            <ThrowingComponent error={new NetworkError('Network failed')} />
          </ApiErrorBoundary>
        </TestWrapper>
      )

      // Should render as Alert component
      expect(screen.getByRole('alert')).toBeDefined()
    })
  })

  describe('countdown for rate limits', () => {
    test('shows countdown for rate limit errors', () => {
      render(
        <TestWrapper>
          <ApiErrorBoundary>
            <ThrowingComponent error={new RateLimitError(30, 'Rate limited')} />
          </ApiErrorBoundary>
        </TestWrapper>
      )

      // Should show countdown in button or message
      expect(screen.getByText(/30 seconds/i)).toBeDefined()
    })

    test('disables retry button during countdown', () => {
      render(
        <TestWrapper>
          <ApiErrorBoundary>
            <ThrowingComponent error={new RateLimitError(30, 'Rate limited')} />
          </ApiErrorBoundary>
        </TestWrapper>
      )

      // Button should be disabled during countdown
      // Mantine uses data-disabled attribute instead of HTML disabled
      const retryButton = screen.getByRole('button')
      expect(retryButton.dataset.disabled).toBe('true')
    })
  })

  describe('resetKeys prop', () => {
    test('resets error boundary when resetKeys change', () => {
      let throwError = true

      function ConditionalErrorComponent() {
        if (throwError) {
          throw new NetworkError('Network failed')
        }
        return <div>Success content</div>
      }

      const { rerender } = render(
        <TestWrapper>
          <ApiErrorBoundary resetKeys={['key1']}>
            <ConditionalErrorComponent />
          </ApiErrorBoundary>
        </TestWrapper>
      )

      // Should show error
      expect(screen.getByText('Connection Error')).toBeDefined()

      // Change the condition and resetKeys
      throwError = false
      rerender(
        <TestWrapper>
          <ApiErrorBoundary resetKeys={['key2']}>
            <ConditionalErrorComponent />
          </ApiErrorBoundary>
        </TestWrapper>
      )

      // Should now show success content
      expect(screen.getByText('Success content')).toBeDefined()
    })
  })
})

describe('withApiErrorBoundary HOC', () => {
  // Suppress console.error during tests
  const originalError = console.error
  beforeAll(() => {
    console.error = () => {}
  })
  afterAll(() => {
    console.error = originalError
  })
  afterEach(() => {
    cleanup()
  })

  test('wraps component with error boundary', () => {
    const WrappedComponent = withApiErrorBoundary(NormalComponent)

    render(
      <TestWrapper>
        <WrappedComponent />
      </TestWrapper>
    )

    expect(screen.getByText('Normal content')).toBeDefined()
  })

  test('catches errors in wrapped component', () => {
    const ErrorComponent = () => {
      throw new NetworkError('Network error')
    }
    const WrappedComponent = withApiErrorBoundary(ErrorComponent)

    render(
      <TestWrapper>
        <WrappedComponent />
      </TestWrapper>
    )

    expect(screen.getByText('Connection Error')).toBeDefined()
  })
})
