'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Hook for managing form state in modal windows
 *
 * @example
 * ```tsx
 * const initialValues = { campaignId: '', priceTypeCode: 'post', price: undefined }
 * const { values, setField, createFieldHandler, reset } = useFormState(initialValues)
 *
 * // Direct field update
 * setField('campaignId', '123')
 *
 * // Create handler for onChange prop
 * const onCampaignChange = createFieldHandler('campaignId')
 * <Select onChange={onCampaignChange} />
 * ```
 */
export function useFormState<T extends Record<string, unknown>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues)
  const initialValuesRef = useRef(initialValues)

  useEffect(() => {
    initialValuesRef.current = initialValues
  }, [initialValues])

  const setField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }, [])

  const createFieldHandler = useCallback(<K extends keyof T>(field: K, fallbackValue?: T[K]) => {
    // Returns a handler for Mantine onChange callbacks.
    // When value is null (e.g., Select cleared), resets to fallbackValue or initialValues.
    // Non-nullish values (including 0 and '') are kept as-is.
    return (value: T[K] | null) => {
      setValues((prev) => ({
        ...prev,
        [field]: value ?? fallbackValue ?? initialValuesRef.current[field],
      }))
    }
  }, [])

  const reset = useCallback(() => {
    setValues(initialValuesRef.current)
  }, [])

  return { values, setField, createFieldHandler, reset, setValues }
}
