'use client'

import { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { useWorkItem } from '@/ui/server-state/work-items/queries'
import messages from './messages.json'

export type WorkItemDetailPanelProps = {
  id: string
  variant: 'page' | 'modal'
  onClose?: () => void
}

export type WorkItemDetailPanelViewProps = {
  variant: 'page' | 'modal'
  title: string
  description: string | null
  statusLabel: string
  updatedAtLabel: string
  isPriority: boolean
  isLoading: boolean
  isError: boolean
  labelsCount: number
  onClose?: () => void
}

export function useWorkItemDetailPanelProps({
  id,
  variant,
  onClose,
}: WorkItemDetailPanelProps): WorkItemDetailPanelViewProps {
  const intl = useIntl()
  const { data, isPending, isError } = useWorkItem(id)

  const handleClose = useCallback(() => {
    onClose?.()
  }, [onClose])

  return {
    variant,
    title: data?.title ?? intl.formatMessage(messages.fallbackTitle),
    description: data?.description ?? null,
    statusLabel:
      data?.status === 'archived'
        ? intl.formatMessage(messages.statusArchived)
        : intl.formatMessage(messages.statusActive),
    updatedAtLabel: data
      ? intl.formatMessage(messages.updatedAt, {
          value: new Date(data.updated_at).toLocaleString(),
        })
      : intl.formatMessage(messages.loading),
    isPriority: data?.is_priority ?? false,
    isLoading: isPending,
    isError,
    labelsCount: data?.label_ids.length ?? 0,
    onClose: handleClose,
  }
}
