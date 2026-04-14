'use client'

import { ActionIcon, Box, Group, Popover, Stack, Tooltip } from '@mantine/core'
import type { PopoverProps } from '@mantine/core'
import { IconCheck, IconX } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { composeHooks } from '@/ui/hooks/compose-hooks'
import { useActionPopoverProps } from './lib'
import styles from './styles.module.css'

type ActionPopoverViewProps = {
  opened: boolean
  onChange?: (opened: boolean) => void
  width?: PopoverProps['width']
  position?: PopoverProps['position']
  closeOnClickOutside?: boolean
  target: ReactNode
  children: ReactNode
  onCancel: () => void
  onConfirm: () => void
  cancelLabel: ReactNode
  confirmLabel: ReactNode
  cancelAriaLabel?: string
  confirmAriaLabel?: string
  resolvedCancelAriaLabel: string
  resolvedConfirmAriaLabel: string
  confirmLoading?: boolean
  confirmDisabled?: boolean
}

type ActionPopoverProps = {
  opened: boolean
  onChange?: (opened: boolean) => void
  width?: PopoverProps['width']
  position?: PopoverProps['position']
  closeOnClickOutside?: boolean
  target: ReactNode
  children: ReactNode
  onCancel: () => void
  onConfirm: () => void
  cancelLabel: ReactNode
  confirmLabel: ReactNode
  cancelAriaLabel?: string
  confirmAriaLabel?: string
  confirmLoading?: boolean
  confirmDisabled?: boolean
}

export function ActionPopoverView({
  opened,
  onChange,
  width = 280,
  position = 'bottom',
  closeOnClickOutside,
  target,
  children,
  onCancel,
  onConfirm,
  cancelLabel,
  confirmLabel,
  resolvedCancelAriaLabel,
  resolvedConfirmAriaLabel,
  confirmLoading,
  confirmDisabled,
}: ActionPopoverViewProps) {
  return (
    <Popover
      opened={opened}
      onChange={onChange}
      width={width}
      position={position}
      withArrow
      offset={4}
      closeOnClickOutside={closeOnClickOutside}
    >
      <Popover.Target>{target}</Popover.Target>
      <Popover.Dropdown onClick={(e) => e.stopPropagation()} className={styles.dropdown}>
        <Stack gap={0}>
          <Box className={styles.content}>{children}</Box>
          <Box className={styles.footer}>
            <Group justify="flex-end" gap="xs">
              <Tooltip label={cancelLabel} openDelay={250}>
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  onClick={onCancel}
                  aria-label={resolvedCancelAriaLabel}
                  data-testid="popover-cancel-btn"
                >
                  <IconX size={14} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label={confirmLabel} openDelay={250}>
                <ActionIcon
                  data-testid="popover-save-btn"
                  variant="light"
                  size="sm"
                  onClick={onConfirm}
                  loading={confirmLoading}
                  disabled={confirmDisabled}
                  aria-label={resolvedConfirmAriaLabel}
                >
                  <IconCheck size={14} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Box>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  )
}

/**
 * ActionPopover - Popover with confirm/cancel actions.
 *
 * `confirmLoading` and `confirmDisabled` are controlled by the parent component
 * which owns the mutation state (e.g. useMutation's isPending). This is intentional:
 * the popover is a generic UI primitive that does not know about specific mutations.
 *
 * Features:
 * - Localized aria labels with intl fallbacks
 * - Confirm and cancel action icons
 */
export const ActionPopover = composeHooks<ActionPopoverViewProps, ActionPopoverProps>(
  ActionPopoverView
)(useActionPopoverProps)
