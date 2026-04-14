'use client'

import { Alert, Button, Center, Stack, Text, Title } from '@mantine/core'
import { IconAlertCircle, IconRefresh, IconWifi, IconServer, IconClock } from '@tabler/icons-react'
import { type ReactNode, useCallback, useEffect, useRef } from 'react'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { FormattedMessage, type MessageDescriptor } from 'react-intl'
import { UnauthorizedError, isApiError } from '@/lib/errors/api-error'
import { presentError } from '@/lib/errors/presentation'
import { logger } from '@/lib/logger'
import { useCountdown } from '@/ui/hooks/use-countdown'
import messages from './messages.json'

export type ApiErrorBoundaryProps = {
  children: ReactNode
  /** Called when user clicks retry */
  onRetry?: () => void
  /** Called on 401 errors - typically redirect to login */
  onUnauthorized?: () => void
  /** Custom fallback component */
  fallback?: ReactNode
  /** Display mode: full-page centered error or inline alert */
  variant?: 'fullPage' | 'inline'
  /** Keys that trigger automatic reset when changed */
  resetKeys?: unknown[]
}

/**
 * Get icon based on error kind
 */
function getErrorIcon(kind: string): ReactNode {
  switch (kind) {
    case 'network': {
      return <IconWifi size={48} aria-hidden="true" />
    }
    case 'rate_limit': {
      return <IconClock size={48} aria-hidden="true" />
    }
    case 'server': {
      return <IconServer size={48} aria-hidden="true" />
    }
    default: {
      return <IconAlertCircle size={48} aria-hidden="true" />
    }
  }
}

type RetryButtonProps = {
  onRetry: () => void
  countdownSeconds: number
  isCountdownActive: boolean
  variant?: 'light' | 'subtle'
  size?: 'xs' | 'sm'
  color?: string
}

function RetryButton({
  onRetry,
  countdownSeconds,
  isCountdownActive,
  variant = 'light',
  size,
  color,
}: RetryButtonProps) {
  return (
    <Button
      leftSection={<IconRefresh size={size === 'xs' ? 14 : 16} aria-hidden="true" />}
      onClick={onRetry}
      variant={variant}
      size={size}
      color={color}
      disabled={isCountdownActive}
    >
      {isCountdownActive ? (
        <FormattedMessage {...messages.retryIn} values={{ seconds: countdownSeconds }} />
      ) : (
        <FormattedMessage {...messages.tryAgain} />
      )}
    </Button>
  )
}

type ErrorContentProps = {
  titleDescriptor: MessageDescriptor
  messageDescriptor: MessageDescriptor
  messageValues?: Record<string, string | number>
  kind: string
  showRetry: boolean
  onRetry: () => void
  countdownSeconds: number
  isCountdownActive: boolean
}

function FullPageErrorContent({
  titleDescriptor,
  messageDescriptor,
  messageValues,
  kind,
  showRetry,
  onRetry,
  countdownSeconds,
  isCountdownActive,
}: ErrorContentProps) {
  return (
    <Center h="100vh" w="100%">
      <Stack align="center" gap="md" maw={400}>
        <Text c="red.6">{getErrorIcon(kind)}</Text>
        <Title order={3} ta="center">
          <FormattedMessage {...titleDescriptor} />
        </Title>
        <Text size="sm" c="dimmed" ta="center">
          <FormattedMessage {...messageDescriptor} values={messageValues} />
        </Text>
        {showRetry && (
          <RetryButton
            onRetry={onRetry}
            countdownSeconds={countdownSeconds}
            isCountdownActive={isCountdownActive}
          />
        )}
      </Stack>
    </Center>
  )
}

function InlineErrorContent({
  titleDescriptor,
  messageDescriptor,
  messageValues,
  showRetry,
  onRetry,
  countdownSeconds,
  isCountdownActive,
}: ErrorContentProps) {
  return (
    <Alert
      icon={<IconAlertCircle size={16} />}
      title={<FormattedMessage {...titleDescriptor} />}
      color="red"
      variant="light"
      withCloseButton={false}
    >
      <Stack gap="xs">
        <Text size="sm">
          <FormattedMessage {...messageDescriptor} values={messageValues} />
        </Text>
        {showRetry && (
          <RetryButton
            onRetry={onRetry}
            countdownSeconds={countdownSeconds}
            isCountdownActive={isCountdownActive}
            variant="subtle"
            size="xs"
            color="red"
          />
        )}
      </Stack>
    </Alert>
  )
}

/**
 * Error fallback UI component for react-error-boundary.
 *
 * Exception: Error boundary fallback requires hooks co-located with resetErrorBoundary callback.
 * The composeHooks pattern doesn't apply to error boundary fallbacks because:
 * 1. useCountdown drives retry timer UI state (needs resetErrorBoundary for retry)
 * 2. useRef + useEffect handle one-shot unauthorized redirect (tied to error instance lifecycle)
 * 3. react-error-boundary's FallbackComponent API requires a single component with FallbackProps
 */
function ErrorFallback({
  error,
  resetErrorBoundary,
  onUnauthorized,
  variant = 'inline',
}: FallbackProps & {
  onUnauthorized?: () => void
  variant?: 'fullPage' | 'inline'
}) {
  const presented = presentError(error)
  const { titleDescriptor, messageDescriptor, messageValues, kind, showRetry, retryAfterSeconds } =
    presented
  const { remaining: countdownSeconds, isActive: isCountdownActive } =
    useCountdown(retryAfterSeconds)

  // Handle unauthorized errors (SIDE EFFECT)
  // Important: do not navigate / mutate state during render. It can break Suspense + concurrent rendering.
  const hasHandledUnauthorizedRef = useRef(false)
  const shouldHandleUnauthorized = error instanceof UnauthorizedError && !!onUnauthorized

  useEffect(() => {
    if (!shouldHandleUnauthorized) return
    if (hasHandledUnauthorizedRef.current) return
    hasHandledUnauthorizedRef.current = true
    onUnauthorized?.()
  }, [shouldHandleUnauthorized, onUnauthorized])

  if (shouldHandleUnauthorized) {
    return null
  }

  const contentProps: ErrorContentProps = {
    titleDescriptor,
    messageDescriptor,
    messageValues,
    kind,
    showRetry,
    onRetry: resetErrorBoundary,
    countdownSeconds,
    isCountdownActive,
  }

  return variant === 'fullPage' ? (
    <FullPageErrorContent {...contentProps} />
  ) : (
    <InlineErrorContent {...contentProps} />
  )
}

/**
 * Error boundary for handling API errors with retry functionality.
 * Built on react-error-boundary for better reset handling and TypeScript support.
 *
 * Features:
 * - Automatic reset when resetKeys change
 * - Built-in retry with countdown for rate limits
 * - Unauthorized error handling with redirect callback
 * - Full-page or inline error display modes
 *
 * @example
 * ```tsx
 * <ApiErrorBoundary
 *   onRetry={() => refetch()}
 *   onUnauthorized={() => router.push('/login')}
 *   resetKeys={[userId]} // Reset when userId changes
 * >
 *   <DataFetchingComponent />
 * </ApiErrorBoundary>
 * ```
 */
export function ApiErrorBoundary({
  children,
  onRetry,
  onUnauthorized,
  fallback,
  variant = 'inline',
  resetKeys,
}: ApiErrorBoundaryProps) {
  const handleReset = () => {
    onRetry?.()
  }

  const handleError = (error: unknown, info: React.ErrorInfo) => {
    // Log error details
    logger.error('[ApiErrorBoundary] Error caught:', {
      error: isApiError(error) ? error.toJSON() : error,
      componentStack: info.componentStack,
    })
  }

  const FallbackWrapper = useCallback(
    (props: FallbackProps) => (
      <ErrorFallback {...props} onUnauthorized={onUnauthorized} variant={variant} />
    ),
    [onUnauthorized, variant]
  )

  if (fallback) {
    return (
      <ErrorBoundary fallback={fallback} onReset={handleReset} onError={handleError}>
        {children}
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary
      FallbackComponent={FallbackWrapper}
      onReset={handleReset}
      onError={handleError}
      resetKeys={resetKeys}
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Hook-friendly wrapper for functional components
 */
export function withApiErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  boundaryProps?: Omit<ApiErrorBoundaryProps, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <ApiErrorBoundary {...boundaryProps}>
        <Component {...props} />
      </ApiErrorBoundary>
    )
  }
}
