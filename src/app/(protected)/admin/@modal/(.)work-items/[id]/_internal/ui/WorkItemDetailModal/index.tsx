'use client'

import { Modal } from '@mantine/core'
import { WorkItemDetailPanel } from '@/app/(protected)/admin/work-items/[id]/_internal/ui/WorkItemDetailPanel'
import { TranslationText } from '@/ui/components/TranslationText'
import { composeHooks } from '@/ui/hooks/compose-hooks'
import type { WorkItemDetailModalProps, WorkItemDetailModalViewProps } from './lib'
import { useWorkItemDetailModalProps } from './lib'
import messages from './messages.json'

export function WorkItemDetailModalView({ id, opened, onClose }: WorkItemDetailModalViewProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<TranslationText {...messages.title} />}
      size="lg"
      centered
      data-testid="work-item-detail-modal"
    >
      <WorkItemDetailPanel id={id} variant="modal" onClose={onClose} />
    </Modal>
  )
}

export const WorkItemDetailModal = composeHooks<
  WorkItemDetailModalViewProps,
  WorkItemDetailModalProps
>(WorkItemDetailModalView)(useWorkItemDetailModalProps)
