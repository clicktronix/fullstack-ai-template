import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, mock, test } from 'bun:test'
import { useInlineCellEditing } from '../use-inline-cell-editing'

type TestItem = { id: string; name: string; age: number }

const createTestItem = (overrides?: Partial<TestItem>): TestItem => ({
  id: '1',
  name: 'Test User',
  age: 25,
  ...overrides,
})

const createDefaultProps = (overrides?: Record<string, unknown>) => ({
  keyExtractor: (item: TestItem) => item.id,
  onCellEditStart: mock(() => {}),
  onCellEditEnd: mock(() => {}),
  ...overrides,
})

describe('useInlineCellEditing', () => {
  afterEach(() => {
    mock.restore()
  })

  describe('initial state', () => {
    test('editingCell is null initially', () => {
      const { result } = renderHook(() => useInlineCellEditing<TestItem>(createDefaultProps()))

      expect(result.current.editingCell).toBeNull()
    })

    test('cellEditValue is empty string initially', () => {
      const { result } = renderHook(() => useInlineCellEditing<TestItem>(createDefaultProps()))

      expect(result.current.cellEditValue).toBe('')
    })
  })

  describe('handleCellDoubleClick', () => {
    test('sets editingCell when onCellSave is provided', () => {
      const onCellSave = mock(() => {})
      const onCellEditStart = mock(() => {})
      const { result } = renderHook(() =>
        useInlineCellEditing<TestItem>(createDefaultProps({ onCellSave, onCellEditStart }))
      )

      const item = createTestItem()

      act(() => {
        result.current.handleCellDoubleClick(item, 'name', 'Test User')
      })

      expect(result.current.editingCell).toEqual({ rowKey: '1', columnKey: 'name' })
      expect(result.current.cellEditValue).toBe('Test User')
      expect(onCellEditStart).toHaveBeenCalledTimes(1)
    })

    test('does nothing when onCellSave is not provided', () => {
      const onCellEditStart = mock(() => {})
      const { result } = renderHook(() =>
        useInlineCellEditing<TestItem>(createDefaultProps({ onCellEditStart }))
      )

      const item = createTestItem()

      act(() => {
        result.current.handleCellDoubleClick(item, 'name', 'Test User')
      })

      expect(result.current.editingCell).toBeNull()
      expect(onCellEditStart).not.toHaveBeenCalled()
    })
  })

  describe('handleCellValueChange', () => {
    test('updates cellEditValue', () => {
      const onCellSave = mock(() => {})
      const { result } = renderHook(() =>
        useInlineCellEditing<TestItem>(createDefaultProps({ onCellSave }))
      )

      const item = createTestItem()

      act(() => {
        result.current.handleCellDoubleClick(item, 'name', 'Test User')
      })

      act(() => {
        result.current.handleCellValueChange('New Name')
      })

      expect(result.current.cellEditValue).toBe('New Name')
    })
  })

  describe('handleCellBlur', () => {
    test('calls onCellSave with current value and clears editing state', () => {
      const onCellSave = mock(() => {})
      const onCellEditEnd = mock(() => {})
      const { result } = renderHook(() =>
        useInlineCellEditing<TestItem>(createDefaultProps({ onCellSave, onCellEditEnd }))
      )

      const item = createTestItem()

      act(() => {
        result.current.handleCellDoubleClick(item, 'name', 'Test User')
      })

      act(() => {
        result.current.handleCellValueChange('Updated Name')
      })

      act(() => {
        result.current.handleCellBlur()
      })

      expect(onCellSave).toHaveBeenCalledWith(item, 'name', 'Updated Name')
      expect(result.current.editingCell).toBeNull()
      expect(result.current.cellEditValue).toBe('')
      expect(onCellEditEnd).toHaveBeenCalledTimes(1)
    })

    test('does nothing when not editing', () => {
      const onCellSave = mock(() => {})
      const onCellEditEnd = mock(() => {})
      const { result } = renderHook(() =>
        useInlineCellEditing<TestItem>(createDefaultProps({ onCellSave, onCellEditEnd }))
      )

      act(() => {
        result.current.handleCellBlur()
      })

      expect(onCellSave).not.toHaveBeenCalled()
      expect(onCellEditEnd).not.toHaveBeenCalled()
    })
  })

  describe('handleCellKeyDown', () => {
    test('Enter key saves and closes editing', () => {
      const onCellSave = mock(() => {})
      const onCellEditEnd = mock(() => {})
      const { result } = renderHook(() =>
        useInlineCellEditing<TestItem>(createDefaultProps({ onCellSave, onCellEditEnd }))
      )

      const item = createTestItem()

      act(() => {
        result.current.handleCellDoubleClick(item, 'name', 'Test User')
      })

      act(() => {
        result.current.handleCellValueChange('Updated Name')
      })

      const mockEvent = {
        key: 'Enter',
        preventDefault: mock(() => {}),
      } as unknown as React.KeyboardEvent

      act(() => {
        result.current.handleCellKeyDown(mockEvent)
      })

      expect(onCellSave).toHaveBeenCalledWith(item, 'name', 'Updated Name')
      expect(result.current.editingCell).toBeNull()
      expect(onCellEditEnd).toHaveBeenCalledTimes(1)
    })

    test('Escape key cancels editing without saving', () => {
      const onCellSave = mock(() => {})
      const onCellEditEnd = mock(() => {})
      const { result } = renderHook(() =>
        useInlineCellEditing<TestItem>(createDefaultProps({ onCellSave, onCellEditEnd }))
      )

      const item = createTestItem()

      act(() => {
        result.current.handleCellDoubleClick(item, 'name', 'Test User')
      })

      act(() => {
        result.current.handleCellValueChange('Updated Name')
      })

      const mockEvent = {
        key: 'Escape',
        preventDefault: mock(() => {}),
      } as unknown as React.KeyboardEvent

      act(() => {
        result.current.handleCellKeyDown(mockEvent)
      })

      expect(onCellSave).not.toHaveBeenCalled()
      expect(result.current.editingCell).toBeNull()
      expect(result.current.cellEditValue).toBe('')
      expect(onCellEditEnd).toHaveBeenCalledTimes(1)
    })

    test('other keys do nothing', () => {
      const onCellSave = mock(() => {})
      const { result } = renderHook(() =>
        useInlineCellEditing<TestItem>(createDefaultProps({ onCellSave }))
      )

      const item = createTestItem()

      act(() => {
        result.current.handleCellDoubleClick(item, 'name', 'Test User')
      })

      const mockEvent = {
        key: 'a',
        preventDefault: mock(() => {}),
      } as unknown as React.KeyboardEvent

      act(() => {
        result.current.handleCellKeyDown(mockEvent)
      })

      expect(result.current.editingCell).not.toBeNull()
    })
  })

  describe('isCellEditing', () => {
    test('returns true for the cell being edited', () => {
      const onCellSave = mock(() => {})
      const { result } = renderHook(() =>
        useInlineCellEditing<TestItem>(createDefaultProps({ onCellSave }))
      )

      const item = createTestItem()

      act(() => {
        result.current.handleCellDoubleClick(item, 'name', 'Test User')
      })

      expect(result.current.isCellEditing('1', 'name')).toBe(true)
      expect(result.current.isCellEditing('1', 'age')).toBe(false)
      expect(result.current.isCellEditing('2', 'name')).toBe(false)
    })

    test('returns false when not editing', () => {
      const { result } = renderHook(() => useInlineCellEditing<TestItem>(createDefaultProps()))

      expect(result.current.isCellEditing('1', 'name')).toBe(false)
    })
  })

  describe('double-click starts editing', () => {
    test('double-click enters edit mode', () => {
      const onCellSave = mock(() => {})
      const { result } = renderHook(() =>
        useInlineCellEditing<TestItem>(createDefaultProps({ onCellSave }))
      )

      const item = createTestItem()

      act(() => {
        result.current.handleCellDoubleClick(item, 'name', 'Test User')
      })

      expect(result.current.editingCell).toEqual({ rowKey: '1', columnKey: 'name' })
    })
  })
})
