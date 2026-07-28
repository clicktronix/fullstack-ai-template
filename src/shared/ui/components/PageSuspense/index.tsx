'use client'

import { Center, Loader, Stack, Text } from '@mantine/core'
import { Suspense, type ReactNode } from 'react'
import { FormattedMessage } from 'react-intl'
import messages from './messages.json'

export type PageSuspenseProps = {
  children: ReactNode
  /** Loading message - defaults to translated "Loading...". Pass null to hide. */
  message?: ReactNode | null
  /** Loader size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Full height loading indicator */
  fullHeight?: boolean
}

/**
 * Default loading fallback for page-level Suspense
 */
export function PageLoadingFallback({
  message,
  size = 'lg',
  fullHeight = true,
}: Omit<PageSuspenseProps, 'children'>) {
  const displayMessage =
    message === null ? null : (message ?? <FormattedMessage {...messages.loading} />)

  return (
    <Center h={fullHeight ? '100dvh' : '100%'} w="100%" role="status" aria-live="polite">
      <Stack align="center" gap="md">
        <Loader size={size} type="dots" />
        {displayMessage !== null && (
          <Text size="sm" c="dimmed">
            {displayMessage}
          </Text>
        )}
      </Stack>
    </Center>
  )
}

/**
 * Page-level Suspense wrapper with default translated loading message.
 *
 * @example
 * ```tsx
 * // Uses default "Loading..." message
 * <PageSuspense>
 *   <DashboardView />
 * </PageSuspense>
 *
 * // Custom message
 * <PageSuspense message={<FormattedMessage {...messages.loadingWidgets} />}>
 *   <WidgetGrid />
 * </PageSuspense>
 * ```
 */
export function PageSuspense({
  children,
  message,
  size = 'lg',
  fullHeight = true,
}: PageSuspenseProps) {
  return (
    <Suspense
      fallback={<PageLoadingFallback message={message} size={size} fullHeight={fullHeight} />}
    >
      {children}
    </Suspense>
  )
}
