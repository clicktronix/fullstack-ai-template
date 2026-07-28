'use client'

import { Modal } from '@mantine/core'
import { WorkItemDetailPanel } from '@/app/(protected)/admin/work-items/[id]/_internal/ui/WorkItemDetailPanel'
import { TranslationText } from '@/shared/ui/components/TranslationText'
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

export function WorkItemDetailModal(props: WorkItemDetailModalProps) {
  return <WorkItemDetailModalView {...useWorkItemDetailModalProps(props)} />
}
