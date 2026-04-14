import { Modal, Stack } from '@mantine/core'
import type { ReactNode } from 'react'
import { FormActions } from '@/ui/components/FormActions'

type FormModalShellProps = {
  opened: boolean
  onClose: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  title: ReactNode
  children: ReactNode
  submitLabel: ReactNode
  cancelLabel: ReactNode
  isSubmitting?: boolean
}

export function FormModalShell({
  opened,
  onClose,
  onSubmit,
  title,
  children,
  submitLabel,
  cancelLabel,
  isSubmitting = false,
}: FormModalShellProps) {
  return (
    <Modal opened={opened} onClose={onClose} title={title}>
      <form onSubmit={onSubmit}>
        <Stack gap="md">
          {children}
          <FormActions
            submitType="submit"
            onCancel={onClose}
            submitLabel={submitLabel}
            cancelLabel={cancelLabel}
            isSubmitting={isSubmitting}
          />
        </Stack>
      </form>
    </Modal>
  )
}
