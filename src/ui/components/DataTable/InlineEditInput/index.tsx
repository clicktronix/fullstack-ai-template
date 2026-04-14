'use client'

import { TextInput } from '@mantine/core'
import { composeHooks } from '@/ui/hooks/compose-hooks'
import styles from '../styles.module.css'
import type { InlineEditInputExternalProps, InlineEditInputViewProps } from './interfaces'
import { useInlineEditInputProps } from './lib'

/**
 * Inline edit input with auto-focus.
 * Keeps row height stable and matches table text sizing.
 */
function InlineEditInputView({
  value,
  onBlur,
  onKeyDown,
  inputRef,
  handleChange,
  handleClick,
  editAriaLabel,
}: InlineEditInputViewProps) {
  return (
    <TextInput
      ref={inputRef}
      aria-label={editAriaLabel}
      value={value}
      onChange={handleChange}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      name="inline-edit"
      autoComplete="off"
      size="sm"
      variant="unstyled"
      onClick={handleClick}
      classNames={{
        root: styles.inlineEditRoot,
        wrapper: styles.inlineEditWrapper,
        input: styles.inlineEditInput,
      }}
    />
  )
}

export type { InlineEditInputProps } from './interfaces'
export const InlineEditInput = composeHooks<InlineEditInputViewProps, InlineEditInputExternalProps>(
  InlineEditInputView
)(useInlineEditInputProps)
