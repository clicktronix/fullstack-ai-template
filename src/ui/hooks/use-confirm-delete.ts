'use client'

/**
 * Hook for delete confirmation modals with i18n support.
 *
 * Provides a localized confirm dialog for delete operations.
 */

import { modals } from '@mantine/modals'
import { useCallback } from 'react'
import { useIntl } from 'react-intl'

const messages = {
  title: { id: 'common.confirm.deleteTitle', defaultMessage: 'Подтвердите удаление' },
  message: {
    id: 'common.confirm.deleteMessage',
    defaultMessage: 'Вы уверены, что хотите удалить этот элемент?',
  },
  confirm: { id: 'common.confirm.delete', defaultMessage: 'Удалить' },
  cancel: { id: 'common.confirm.cancel', defaultMessage: 'Отмена' },
}

type ConfirmDeleteOptions = {
  title?: string
  message?: string
}

/**
 * Hook that provides a localized delete confirmation dialog.
 *
 * @example
 * ```tsx
 * const { confirm } = useConfirmDelete()
 *
 * const handleDelete = () => {
 *   confirm(() => deleteMutation.mutate(id))
 * }
 *
 * // With custom messages
 * const handleDeleteCustom = () => {
 *   confirm(() => deleteMutation.mutate(id), {
 *     title: 'Delete work item?',
 *     message: 'This action cannot be undone.'
 *   })
 * }
 * ```
 */
export function useConfirmDelete() {
  const intl = useIntl()

  const confirm = useCallback(
    (onConfirm: () => void, options?: ConfirmDeleteOptions) => {
      modals.openConfirmModal({
        title: options?.title ?? intl.formatMessage(messages.title),
        children: options?.message ?? intl.formatMessage(messages.message),
        labels: {
          confirm: intl.formatMessage(messages.confirm),
          cancel: intl.formatMessage(messages.cancel),
        },
        confirmProps: { color: 'red', 'data-testid': 'confirm-delete-btn' },
        cancelProps: { 'data-testid': 'confirm-delete-cancel-btn' },
        onConfirm,
      })
    },
    [intl]
  )

  return { confirm }
}
