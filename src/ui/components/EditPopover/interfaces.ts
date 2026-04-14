import type { PopoverProps } from '@mantine/core'
import type { KeyboardEvent, ReactNode } from 'react'

/**
 * External API props for EditPopover component
 */
export type EditPopoverProps = {
  opened: boolean
  onClose: () => void
  onOpen: () => void
  onSave: () => void
  loading?: boolean
  disabled?: boolean
  width?: PopoverProps['width']
  position?: PopoverProps['position']
  closeOnClickOutside?: boolean
  children: ReactNode
  target: ReactNode
}

/**
 * View props for EditPopoverView (pure presentation)
 */
export type EditPopoverViewProps = {
  opened: boolean
  onSave: () => void
  loading: boolean
  disabled: boolean
  width: PopoverProps['width']
  position: PopoverProps['position']
  closeOnClickOutside?: boolean
  children: ReactNode
  target: ReactNode
  handleOpen: () => void
  handleClose: () => void
  handlePopoverChange: (isOpen: boolean) => void
  handleTargetDoubleClick: () => void
  handleTargetKeyDown: (event: KeyboardEvent<HTMLSpanElement>) => void
  cancelAriaLabel: string
  confirmAriaLabel: string
}
