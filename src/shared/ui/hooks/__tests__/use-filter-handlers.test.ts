import { renderHook, act } from '@testing-library/react'
import { describe, test, expect, mock } from 'bun:test'
import { useFilterHandlers } from '../use-filter-handlers'

type TestFilters = {
  search?: string
  city?: string | null
  minFollowers?: number
  categories?: string[]
}

/**
 * Helper: calls onFiltersChange mock's first arg (functional updater)
 * with the provided prev state and returns the result.
 */
function getUpdatedFilters<T>(onFiltersChange: ReturnType<typeof mock>, prev: T): T {
  const lastCall = onFiltersChange.mock.calls.at(-1)
  const updater = lastCall?.[0]
  if (typeof updater === 'function') {
    return updater(prev) as T
  }
  return updater as T
}

describe('useFilterHandlers', () => {
  describe('createHandler', () => {
    test('creates handler that updates filter', () => {
      const onFiltersChange = mock(() => {})
      const filters = { search: '', city: null } as TestFilters
      const { result } = renderHook(() => useFilterHandlers({ filters, onFiltersChange }))

      const searchHandler = result.current.createHandler('search')
      act(() => searchHandler('test'))

      const updated = getUpdatedFilters(onFiltersChange, filters)
      expect(updated).toEqual({ search: 'test', city: null })
    })

    test('converts empty string to undefined', () => {
      const onFiltersChange = mock(() => {})
      const filters = { search: 'existing' } as TestFilters
      const { result } = renderHook(() => useFilterHandlers({ filters, onFiltersChange }))

      const searchHandler = result.current.createHandler('search')
      act(() => searchHandler(''))

      const updated = getUpdatedFilters(onFiltersChange, filters)
      expect(updated).toEqual({ search: undefined })
    })

    test('converts null to undefined', () => {
      const onFiltersChange = mock(() => {})
      const filters = { search: 'existing' } as TestFilters
      const { result } = renderHook(() => useFilterHandlers({ filters, onFiltersChange }))

      const searchHandler = result.current.createHandler('search')
      act(() => searchHandler(null))

      const updated = getUpdatedFilters(onFiltersChange, filters)
      expect(updated).toEqual({ search: undefined })
    })
  })

  describe('createSelectHandler', () => {
    test('handles string value from Mantine Select', () => {
      const onFiltersChange = mock(() => {})
      const filters = { city: null } as TestFilters
      const { result } = renderHook(() => useFilterHandlers({ filters, onFiltersChange }))

      const cityHandler = result.current.createSelectHandler('city')
      act(() => cityHandler('Moscow'))

      const updated = getUpdatedFilters(onFiltersChange, filters)
      expect(updated).toEqual({ city: 'Moscow' })
    })

    test('converts null to undefined', () => {
      const onFiltersChange = mock(() => {})
      const filters = { city: 'Moscow' } as TestFilters
      const { result } = renderHook(() => useFilterHandlers({ filters, onFiltersChange }))

      const cityHandler = result.current.createSelectHandler('city')
      act(() => cityHandler(null))

      const updated = getUpdatedFilters(onFiltersChange, filters)
      expect(updated).toEqual({ city: undefined })
    })
  })

  describe('createInputHandler', () => {
    test('extracts value from input event', () => {
      const onFiltersChange = mock(() => {})
      const filters = { search: '' } as TestFilters
      const { result } = renderHook(() => useFilterHandlers({ filters, onFiltersChange }))

      const searchHandler = result.current.createInputHandler('search')
      const mockEvent = { target: { value: 'new search' } } as React.ChangeEvent<HTMLInputElement>
      act(() => searchHandler(mockEvent))

      const updated = getUpdatedFilters(onFiltersChange, filters)
      expect(updated).toEqual({ search: 'new search' })
    })

    test('converts empty input value to undefined', () => {
      const onFiltersChange = mock(() => {})
      const filters = { search: 'existing' } as TestFilters
      const { result } = renderHook(() => useFilterHandlers({ filters, onFiltersChange }))

      const searchHandler = result.current.createInputHandler('search')
      const mockEvent = { target: { value: '' } } as React.ChangeEvent<HTMLInputElement>
      act(() => searchHandler(mockEvent))

      const updated = getUpdatedFilters(onFiltersChange, filters)
      expect(updated).toEqual({ search: undefined })
    })
  })

  describe('createNumberHandler', () => {
    test('handles numeric value from NumberInput', () => {
      const onFiltersChange = mock(() => {})
      const filters = { minFollowers: undefined } as TestFilters
      const { result } = renderHook(() => useFilterHandlers({ filters, onFiltersChange }))

      const numberHandler = result.current.createNumberHandler('minFollowers')
      act(() => numberHandler(1000))

      const updated = getUpdatedFilters(onFiltersChange, filters)
      expect(updated).toEqual({ minFollowers: 1000 })
    })

    test('converts empty string to undefined', () => {
      const onFiltersChange = mock(() => {})
      const filters = { minFollowers: 1000 } as TestFilters
      const { result } = renderHook(() => useFilterHandlers({ filters, onFiltersChange }))

      const numberHandler = result.current.createNumberHandler('minFollowers')
      act(() => numberHandler(''))

      const updated = getUpdatedFilters(onFiltersChange, filters)
      expect(updated).toEqual({ minFollowers: undefined })
    })
  })

  describe('createArrayHandler', () => {
    test('handles array value from MultiSelect', () => {
      const onFiltersChange = mock(() => {})
      const filters = { categories: undefined } as TestFilters
      const { result } = renderHook(() => useFilterHandlers({ filters, onFiltersChange }))

      const arrayHandler = result.current.createArrayHandler('categories')
      act(() => arrayHandler(['fashion', 'beauty']))

      const updated = getUpdatedFilters(onFiltersChange, filters)
      expect(updated).toEqual({ categories: ['fashion', 'beauty'] })
    })

    test('converts empty array to undefined', () => {
      const onFiltersChange = mock(() => {})
      const filters = { categories: ['fashion'] } as TestFilters
      const { result } = renderHook(() => useFilterHandlers({ filters, onFiltersChange }))

      const arrayHandler = result.current.createArrayHandler('categories')
      act(() => arrayHandler([]))

      const updated = getUpdatedFilters(onFiltersChange, filters)
      expect(updated).toEqual({ categories: undefined })
    })
  })

  describe('handler stability', () => {
    test('handlers are stable across renders with same dependencies', () => {
      const onFiltersChange = mock(() => {})
      const filters = { search: '' } as TestFilters

      const { result, rerender } = renderHook(() =>
        useFilterHandlers({
          filters,
          onFiltersChange,
        })
      )

      const firstCreateHandler = result.current.createHandler
      const firstCreateSelectHandler = result.current.createSelectHandler
      const firstCreateNumberHandler = result.current.createNumberHandler
      const firstCreateArrayHandler = result.current.createArrayHandler

      rerender()

      expect(result.current.createHandler).toBe(firstCreateHandler)
      expect(result.current.createSelectHandler).toBe(firstCreateSelectHandler)
      expect(result.current.createNumberHandler).toBe(firstCreateNumberHandler)
      expect(result.current.createArrayHandler).toBe(firstCreateArrayHandler)
    })
  })
})
