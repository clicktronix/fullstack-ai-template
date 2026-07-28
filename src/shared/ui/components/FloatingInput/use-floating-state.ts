import { useState, useCallback, useMemo, type FocusEvent } from 'react'

export type FloatingFocusHandler = (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void

type UseFloatingStateProps<T> = {
  value?: T
  defaultValue?: T
  onFocus?: FloatingFocusHandler
  onBlur?: FloatingFocusHandler
  error?: unknown
}

type UseFloatingStateReturn<T> = {
  floating: boolean | undefined
  internalValue: T
  setInternalValue: (value: T) => void
  handleFocus: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleBlur: (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  labelProps: { 'data-floating': boolean | undefined; 'data-error': string | undefined }
}

/**
 * Hook for managing floating label state.
 * Tracks focus and internal value to determine if label should float.
 *
 * @param value - Controlled value from props
 * @param defaultValue - Default value for uncontrolled mode
 * @param onFocus - External focus handler to chain
 * @param onBlur - External blur handler to chain
 */
export function useFloatingState<T>({
  value,
  defaultValue,
  onFocus,
  onBlur,
  error,
}: UseFloatingStateProps<T>): UseFloatingStateReturn<T> {
  const [focused, setFocused] = useState(false)
  const [internalValue, setInternalValue] = useState<T>(() => (value ?? defaultValue) as T)

  const handleFocus = useCallback(
    (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFocused(true)
      onFocus?.(e)
    },
    [onFocus]
  )

  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFocused(false)
      onBlur?.(e)
    },
    [onBlur]
  )

  const currentValue = value === undefined ? internalValue : value
  const hasValue = checkHasValue(currentValue)
  const floating = focused || hasValue || undefined

  const labelProps = useMemo(
    () => ({ 'data-floating': floating, 'data-error': error ? ('true' as const) : undefined }),
    [floating, error]
  )

  return {
    floating,
    internalValue,
    setInternalValue,
    handleFocus,
    handleBlur,
    labelProps,
  }
}

function checkHasValue<T>(value: T): boolean {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'number') return true
  return !!value
}
