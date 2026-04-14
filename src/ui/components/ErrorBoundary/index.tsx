'use client'

import { Alert, Box, Button, Container, Group, Stack, Text } from '@mantine/core'
import {
  IconAlertCircle,
  IconLock,
  IconNetwork,
  IconRefresh,
  IconSearch,
  IconServerOff,
} from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { ErrorBoundary as ReactErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { useIntl } from 'react-intl'
import {
  ClientError,
  ForbiddenError,
  isApiError,
  NetworkError,
  NotFoundError,
  ServerError,
  UnauthorizedError,
} from '@/lib/errors/api-error'
import { logger } from '@/lib/logger'
import { StatusBadge } from '@/ui/components/StatusBadge'
import { TranslationText } from '@/ui/components/TranslationText'
import { TranslationTitle } from '@/ui/components/TranslationTitle'
import messages from './messages.json'

type ErrorBoundaryProps = {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, info: { componentStack?: string | null }) => void
}

/**
 * ErrorBoundary component using react-error-boundary library.
 * Catches JavaScript errors in child components and displays a fallback UI.
 */
export function ErrorBoundary({ children, fallback, onError }: ErrorBoundaryProps) {
  const handleError = (error: unknown, info: { componentStack?: string | null }) => {
    // Normalize error to Error instance
    const normalizedError = error instanceof Error ? error : new Error(String(error))

    // Use structured logging for API errors
    if (isApiError(normalizedError)) {
      logger.apiError('ErrorBoundary', normalizedError, {
        componentStack: info.componentStack,
      })
    } else {
      logger.error('ErrorBoundary caught an error:', normalizedError, info)
    }
    onError?.(normalizedError, info)
  }

  if (fallback) {
    return (
      <ReactErrorBoundary fallback={fallback} onError={handleError}>
        {children}
      </ReactErrorBoundary>
    )
  }

  return (
    <ReactErrorBoundary FallbackComponent={ErrorBoundaryContent} onError={handleError}>
      {children}
    </ReactErrorBoundary>
  )
}

// Hoisted static icons to avoid re-creating JSX on every render
const ALERT_ICON = <IconAlertCircle size={16} />
const LOCK_ICON = <IconLock size={16} />
const SEARCH_ICON = <IconSearch size={16} />
const NETWORK_ICON = <IconNetwork size={16} />
const SERVER_ICON = <IconServerOff size={16} />
const REFRESH_ICON = <IconRefresh size={16} />

/**
 * Fallback component shown when an error is caught.
 */
function ErrorBoundaryContent({ error, resetErrorBoundary }: FallbackProps) {
  const intl = useIntl()

  // Determine error type and customize UI accordingly
  const getErrorConfig = () => {
    if (!error) {
      return {
        icon: ALERT_ICON,
        color: 'red',
        title: intl.formatMessage(messages.unknownError),
        badge: null,
      }
    }

    // Typed error handling for API errors
    if (error instanceof UnauthorizedError) {
      return {
        icon: LOCK_ICON,
        color: 'amber',
        title: intl.formatMessage(messages.authRequired),
        badge: <StatusBadge color="amber">401</StatusBadge>,
      }
    }

    if (error instanceof ForbiddenError) {
      return {
        icon: LOCK_ICON,
        color: 'red',
        title: intl.formatMessage(messages.accessDenied),
        badge: <StatusBadge color="red">403</StatusBadge>,
      }
    }

    if (error instanceof NotFoundError) {
      return {
        icon: SEARCH_ICON,
        color: 'dark',
        title: intl.formatMessage(messages.notFound),
        badge: <StatusBadge color="dark">404</StatusBadge>,
      }
    }

    if (error instanceof NetworkError) {
      return {
        icon: NETWORK_ICON,
        color: 'sky',
        title: intl.formatMessage(messages.networkError),
        badge: (
          <StatusBadge color="sky">
            <TranslationText {...messages.networkBadge} />
          </StatusBadge>
        ),
      }
    }

    if (error instanceof ServerError) {
      return {
        icon: SERVER_ICON,
        color: 'red',
        title: intl.formatMessage(messages.serverError),
        badge: <StatusBadge color="red">{error.status}</StatusBadge>,
      }
    }

    if (error instanceof ClientError) {
      return {
        icon: ALERT_ICON,
        color: 'amber',
        title: intl.formatMessage(messages.requestError),
        badge: <StatusBadge color="amber">{error.status}</StatusBadge>,
      }
    }

    // Generic API error
    if (isApiError(error)) {
      return {
        icon: ALERT_ICON,
        color: 'red',
        title: intl.formatMessage(messages.apiError),
        badge: error.getStatus() ? (
          <StatusBadge color="red">{error.getStatus()}</StatusBadge>
        ) : null,
      }
    }

    // Non-API error
    return {
      icon: ALERT_ICON,
      color: 'red',
      title: intl.formatMessage(messages.applicationError),
      badge: null,
    }
  }

  const config = getErrorConfig()

  return (
    <Container size="md" py="xl">
      <Alert icon={config.icon} title={config.title} color={config.color}>
        <Stack gap="md">
          <Box>
            <Group gap="xs" align="center">
              <TranslationTitle {...messages.heading} order={4} />
              {config.badge}
            </Group>
            <Text size="sm" c="dimmed" mt="xs">
              <TranslationText {...messages.defaultError} />
            </Text>
          </Box>
          <Button leftSection={REFRESH_ICON} variant="light" onClick={resetErrorBoundary} size="sm">
            <TranslationText {...messages.tryAgain} />
          </Button>
        </Stack>
      </Alert>
    </Container>
  )
}

/**
 * Hook for creating error handlers.
 * Can be used with react-error-boundary's useErrorBoundary hook.
 */
export function useErrorHandler() {
  return (error: Error, info: { componentStack?: string }) => {
    logger.error('Error caught by useErrorHandler:', error, info)
  }
}
