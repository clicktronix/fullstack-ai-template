'use client'

import { Select, type SelectProps } from '@mantine/core'
import { useCallback } from 'react'
import styles from './styles.module.css'
import { useFloatingState, type FloatingFocusHandler } from './use-floating-state'

type FloatingSelectProps = Omit<SelectProps, 'classNames'>

/**
 * Select with floating label animation.
 * Based on https://ui.mantine.dev/category/inputs/
 */
export function FloatingSelect({
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
}: FloatingSelectProps) {
  const { floating, setInternalValue, handleFocus, handleBlur, labelProps } = useFloatingState<
    string | null
  >({
    value: value as string | null | undefined,
    defaultValue: (defaultValue ?? null) as string | null,
    onFocus: onFocus as FloatingFocusHandler | undefined,
    onBlur: onBlur as FloatingFocusHandler | undefined,
    error,
  })

  const handleChange = useCallback(
    (val: string | null, option: { value: string; label: string }) => {
      setInternalValue(val)
      onChange?.(val, option)
    },
    [setInternalValue, onChange]
  )

  return (
    <Select
      label={label}
      value={value}
      defaultValue={defaultValue}
      onChange={handleChange}
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
