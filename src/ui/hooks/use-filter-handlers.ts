import { useCallback } from 'react'

type UseFilterHandlersOptions<T> = {
  filters: T
  onFiltersChange: (filters: T | ((prev: T) => T)) => void
}

/**
 * Hook for creating filter change handlers.
 * Reduces boilerplate when handling filter changes in components.
 *
 * @example
 * const { createHandler, createSelectHandler, createNumberHandler } = useFilterHandlers({
 *   filters,
 *   onFiltersChange,
 * })
 *
 * // For simple value changes (string, etc.)
 * handleSearchChange('value')
 *
 * // For Mantine Select components (accepts string | null)
 * <Select onChange={createSelectHandler('city')} />
 *
 * // For NumberInput components
 * <NumberInput onChange={createNumberHandler('min_followers')} />
 */
export function useFilterHandlers<T extends Record<string, unknown>>({
  filters,
  onFiltersChange,
}: UseFilterHandlersOptions<T>) {
  /**
   * Creates a handler for direct value changes.
   * Converts null/empty to undefined for optional filter values.
   */
  const createHandler = useCallback(
    <K extends keyof T>(key: K) => {
      return (value: T[K] | null | undefined) => {
        onFiltersChange((prev) => ({
          ...prev,
          [key]: value == null || value === '' ? undefined : value,
        }))
      }
    },
    [onFiltersChange]
  )

  /**
   * Creates a handler for Mantine Select components.
   * Accepts string | null from Select onChange and converts to filter type.
   */
  const createSelectHandler = useCallback(
    <K extends keyof T>(key: K) => {
      return (value: string | null) => {
        onFiltersChange((prev) => ({ ...prev, [key]: (value ?? undefined) as T[K] }))
      }
    },
    [onFiltersChange]
  )

  /**
   * Creates a handler for TextInput components.
   * Extracts value from event and converts empty string to undefined.
   */
  const createInputHandler = useCallback(
    <K extends keyof T>(key: K) => {
      return (e: React.ChangeEvent<HTMLInputElement>) => {
        onFiltersChange((prev) => ({ ...prev, [key]: e.target.value || undefined }))
      }
    },
    [onFiltersChange]
  )

  /**
   * Creates a handler for NumberInput components.
   * Converts empty string to undefined for optional number values.
   */
  const createNumberHandler = useCallback(
    <K extends keyof T>(key: K) => {
      return (value: string | number) => {
        const numValue = typeof value === 'string' ? undefined : value
        onFiltersChange((prev) => ({ ...prev, [key]: numValue }))
      }
    },
    [onFiltersChange]
  )

  /**
   * Creates a handler for MultiSelect components with arrays.
   * Converts empty array to undefined for optional array values.
   */
  const createArrayHandler = useCallback(
    <K extends keyof T>(key: K) => {
      return (value: string[]) => {
        onFiltersChange((prev) => ({ ...prev, [key]: value.length > 0 ? value : undefined }))
      }
    },
    [onFiltersChange]
  )

  return {
    createHandler,
    createSelectHandler,
    createInputHandler,
    createNumberHandler,
    createArrayHandler,
  }
}
