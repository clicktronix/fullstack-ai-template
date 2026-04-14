'use client'

/**
 * Hook for generic action confirmation modals with i18n support.
 *
 * Provides a localized confirm dialog for any destructive or important action.
 */

import { modals } from '@mantine/modals'
import { useCallback } from 'react'
import { useIntl } from 'react-intl'

const defaultMessages = {
  confirm: { id: 'common.confirm.action', defaultMessage: 'Подтвердить' },
  cancel: { id: 'common.confirm.cancel', defaultMessage: 'Отмена' },
}

type ConfirmActionOptions = {
  title: string
  message: string
  confirmLabel?: string
  confirmColor?: string
}

/**
 * Hook that provides a localized action confirmation dialog.
 *
 * @example
 * ```tsx
 * const { confirm } = useConfirmAction()
 *
 * const handleArchive = () => {
 *   confirm(() => archiveMutation.mutate(id), {
 *     title: intl.formatMessage({ id: 'workItems.archive.confirmTitle', defaultMessage: 'Archive work item' }),
 *     message: intl.formatMessage({ id: 'workItems.archive.confirmMessage', defaultMessage: 'Are you sure?' }),
 *     confirmColor: 'orange',
 *   })
 * }
 * ```
 */
export function useConfirmAction() {
  const intl = useIntl()

  const confirm = useCallback(
    (onConfirm: () => void, options: ConfirmActionOptions) => {
      modals.openConfirmModal({
        title: options.title,
        children: options.message,
        labels: {
          confirm: options.confirmLabel ?? intl.formatMessage(defaultMessages.confirm),
          cancel: intl.formatMessage(defaultMessages.cancel),
        },
        confirmProps: {
          color: options.confirmColor ?? 'blue',
          'data-testid': 'confirm-action-btn',
        },
        cancelProps: { 'data-testid': 'confirm-action-cancel-btn' },
        onConfirm,
      })
    },
    [intl]
  )

  return { confirm }
}
