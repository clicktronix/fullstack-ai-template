import { useForm } from '@mantine/form'
import type { UseFormInput } from '@mantine/form'
import { useEffect, useRef } from 'react'

/**
 * Options for useModalForm hook.
 */
export type UseModalFormOptions<T, V extends Record<string, unknown>> = {
  /** Whether the modal is currently open */
  opened: boolean
  /** Item to edit (null for create mode) */
  item: T | null
  /** Initial form values for create mode */
  initialValues: V
  /** Form validation rules */
  validate?: UseFormInput<V>['validate']
  /** Transform item to form values for edit mode */
  transformItemToValues: (item: T) => V
}

/**
 * Hook for managing form state in modal dialogs.
 *
 * Encapsulates the common pattern of:
 * - Creating a Mantine form with initial values and validation
 * - Resetting form to initial values when modal opens in create mode
 * - Populating form with item values when modal opens in edit mode
 *
 * @param options - Configuration options
 * @returns Mantine form instance with automatic reset/populate behavior
 *
 * @example
 * ```tsx
 * const form = useModalForm({
 *   opened,
 *   item: tag,
 *   initialValues: { name: '', color: '' },
 *   validate: {
 *     name: (value) => value.trim().length === 0 ? 'Required' : null,
 *   },
 *   transformItemToValues: (tag) => ({
 *     name: tag.name,
 *     color: tag.color ?? '',
 *   }),
 * })
 * ```
 */
export function useModalForm<T, V extends Record<string, unknown>>({
  opened,
  item,
  initialValues,
  validate,
  transformItemToValues,
}: UseModalFormOptions<T, V>) {
  const form = useForm<V>({
    initialValues,
    validate,
  })

  // Store refs for stable references in effects
  const transformFnRef = useRef(transformItemToValues)
  const formMethodsRef = useRef({
    setValues: form.setValues,
    reset: form.reset,
    clearErrors: form.clearErrors,
  })

  // Keep refs in sync via effect (not during render)
  useEffect(() => {
    transformFnRef.current = transformItemToValues
    formMethodsRef.current = {
      setValues: form.setValues,
      reset: form.reset,
      clearErrors: form.clearErrors,
    }
  }, [transformItemToValues, form.reset, form.setValues, form.clearErrors])

  // Reset form when item changes or modal opens
  useEffect(() => {
    if (opened) {
      if (item) {
        formMethodsRef.current.setValues(transformFnRef.current(item))
        formMethodsRef.current.clearErrors()
      } else {
        formMethodsRef.current.reset()
      }
    }
  }, [item, opened])

  return form
}
