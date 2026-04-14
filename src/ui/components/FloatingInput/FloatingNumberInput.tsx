'use client'

import { NumberInput, type NumberInputProps } from '@mantine/core'
import styles from './styles.module.css'
import { useFloatingState, type FloatingFocusHandler } from './use-floating-state'

type FloatingNumberInputProps = Omit<NumberInputProps, 'classNames'>

/**
 * NumberInput with floating label animation.
 * Based on https://ui.mantine.dev/category/inputs/
 */
export function FloatingNumberInput({
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
}: FloatingNumberInputProps) {
  const { floating, setInternalValue, handleFocus, handleBlur, labelProps } = useFloatingState<
    string | number | undefined
  >({
    value,
    defaultValue,
    onFocus: onFocus as FloatingFocusHandler | undefined,
    onBlur: onBlur as FloatingFocusHandler | undefined,
    error,
  })

  return (
    <NumberInput
      label={label}
      value={value}
      defaultValue={defaultValue}
      onChange={(val) => {
        setInternalValue(val)
        onChange?.(val)
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
