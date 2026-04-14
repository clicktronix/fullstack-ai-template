'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useIntl } from 'react-intl'
import { extractErrorCode } from '@/lib/errors/action-error'
import { presentError } from '@/lib/errors/presentation'
import { notifications } from '@/lib/mantine-notifications'

let sentryPromise: Promise<typeof import('@sentry/nextjs')> | null = null
function getSentry() {
  sentryPromise ??= import('@sentry/nextjs')
  return sentryPromise
}

/**
 * Global mutation error handler.
 *
 * Subscribes to TanStack Query MutationCache and shows
 * localized error notifications for any failed mutation.
 * This keeps notification logic in the UI layer,
 * while use-cases stay clean (data + rollback only).
 */
export function MutationErrorNotifier() {
  const queryClient = useQueryClient()
  const intl = useIntl()

  useEffect(() => {
    const unsubscribe = queryClient.getMutationCache().subscribe((event) => {
      if (event.type === 'updated' && event.action.type === 'error') {
        const error = event.action.error
        const presentation = presentError(error)

        notifications.show({
          title: intl.formatMessage(presentation.titleDescriptor),
          message: intl.formatMessage(presentation.messageDescriptor, presentation.messageValues),
          color: 'red',
        })

        getSentry().then((Sentry) => {
          Sentry.addBreadcrumb({
            category: 'mutation.error',
            message: error instanceof Error ? error.message : String(error),
            data: {
              errorCode: error instanceof Error ? extractErrorCode(error.message) : null,
            },
            level: 'error',
          })
        })
      }
    })

    return unsubscribe
  }, [queryClient, intl])

  return null
}
