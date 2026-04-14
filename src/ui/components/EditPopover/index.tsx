'use client'

import { Box } from '@mantine/core'
import { ActionPopover } from '@/ui/components/ActionPopover'
import { TranslationText } from '@/ui/components/TranslationText'
import { composeHooks } from '@/ui/hooks/compose-hooks'
import type { EditPopoverProps, EditPopoverViewProps } from './interfaces'
import { useEditPopoverProps } from './lib'
import messages from './messages.json'
import styles from './styles.module.css'

export function EditPopoverView({
  opened,
  onSave,
  loading,
  disabled,
  width,
  position,
  closeOnClickOutside,
  children,
  target,
  handleClose,
  handlePopoverChange,
  handleTargetDoubleClick,
  handleTargetKeyDown,
  cancelAriaLabel,
  confirmAriaLabel,
}: EditPopoverViewProps) {
  return (
    <ActionPopover
      opened={opened}
      onChange={handlePopoverChange}
      width={width}
      position={position}
      closeOnClickOutside={closeOnClickOutside}
      target={
        <Box
          component="span"
          className={[styles.target, opened && styles.targetEditing].filter(Boolean).join(' ')}
          onDoubleClick={handleTargetDoubleClick}
          onKeyDown={handleTargetKeyDown}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-haspopup="dialog"
          aria-expanded={opened}
        >
          {target}
        </Box>
      }
      onCancel={handleClose}
      onConfirm={onSave}
      cancelLabel={<TranslationText {...messages.cancel} />}
      confirmLabel={<TranslationText {...messages.save} />}
      cancelAriaLabel={cancelAriaLabel}
      confirmAriaLabel={confirmAriaLabel}
      confirmLoading={loading}
      confirmDisabled={disabled}
    >
      {children}
    </ActionPopover>
  )
}

export const EditPopover = composeHooks<EditPopoverViewProps, EditPopoverProps>(EditPopoverView)(
  useEditPopoverProps
)
