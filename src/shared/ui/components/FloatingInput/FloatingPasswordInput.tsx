'use client'

import { PasswordInput, type PasswordInputProps } from '@mantine/core'
import styles from './styles.module.css'
import { useFloatingState, type FloatingFocusHandler } from './use-floating-state'

type FloatingPasswordInputProps = Omit<PasswordInputProps, 'classNames'>

/**
 * PasswordInput with floating label animation.
 * Based on https://ui.mantine.dev/category/inputs/
 */
export function FloatingPasswordInput({
  label,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  error,
  mt,
  size = 'md',
  ...rest
}: FloatingPasswordInputProps) {
  const { floating, setInternalValue, handleFocus, handleBlur, labelProps } =
    useFloatingState<string>({
      value: value as string | undefined,
      defaultValue: (defaultValue ?? '') as string,
      onFocus: onFocus as FloatingFocusHandler | undefined,
      onBlur: onBlur as FloatingFocusHandler | undefined,
      error,
    })

  return (
    <PasswordInput
      label={label}
      value={value}
      defaultValue={defaultValue}
      onChange={(e) => {
        setInternalValue(e.currentTarget.value)
        onChange?.(e)
      }}
      onFocus={handleFocus}
      onBlur={handleBlur}
      error={error}
      mt={mt}
      size={size}
      classNames={{
        root: styles.root,
        label: styles.label,
        input: styles.input,
      }}
      data-floating={floating}
      labelProps={labelProps}
      {...rest}
    />
  )
}
