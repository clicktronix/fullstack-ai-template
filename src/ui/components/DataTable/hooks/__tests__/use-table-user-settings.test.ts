import { act, renderHook } from '@testing-library/react'
import { describe, expect, mock, test } from 'bun:test'
import type { ColumnConfig, DataTableConfig, UserTableSettings } from '../../interfaces'
import { useTableUserSettings } from '../use-table-user-settings'

type TestItem = { id: string; name: string; age: number }

const mockColumns: ColumnConfig<TestItem>[] = [
  { key: 'id', label: 'ID', width: 100, required: true, render: (item) => item.id },
  { key: 'name', label: 'Name', width: 200, render: (item) => item.name },
  { key: 'age', label: 'Age', width: 80, render: (item) => String(item.age) },
]

const defaultConfig: DataTableConfig = {
  striped: true,
  highlightOnHover: true,
  withColumnBorders: false,
}

describe('useTableUserSettings', () => {
  test('returns initial state', () => {
    const { result } = renderHook(() =>
      useTableUserSettings({
        columns: mockColumns,
        config: defaultConfig,
        enableUserSettings: true,
      })
    )

    expect(result.current.userVisibleColumns).toEqual(['id', 'name', 'age'])
    expect(result.current.settingsOpened).toBe(false)
  })

  test('returns empty column widths by default', () => {
    const { result } = renderHook(() =>
      useTableUserSettings({
        columns: mockColumns,
        config: defaultConfig,
        enableUserSettings: true,
      })
    )

    expect(result.current.userColumnWidths).toEqual({})
  })

  test('returns provided config as userTableConfig', () => {
    const { result } = renderHook(() =>
      useTableUserSettings({
        columns: mockColumns,
        config: defaultConfig,
        enableUserSettings: true,
      })
    )

    expect(result.current.userTableConfig).toEqual(defaultConfig)
  })

  test('returns config as finalConfig by default', () => {
    const { result } = renderHook(() =>
      useTableUserSettings({
        columns: mockColumns,
        config: defaultConfig,
        enableUserSettings: true,
      })
    )

    expect(result.current.finalConfig).toEqual(defaultConfig)
  })

  test('settings modal is closed by default', () => {
    const { result } = renderHook(() =>
      useTableUserSettings({
        columns: mockColumns,
        config: defaultConfig,
        enableUserSettings: true,
      })
    )

    expect(result.current.settingsOpened).toBe(false)
  })

  test('removes column from visible when toggled off', () => {
    const { result } = renderHook(() =>
      useTableUserSettings({
        columns: mockColumns,
        config: defaultConfig,
        enableUserSettings: true,
      })
    )

    expect(result.current.userVisibleColumns).toContain('name')

    act(() => {
      result.current.handleToggleColumn('name')
    })

    expect(result.current.userVisibleColumns).not.toContain('name')
  })

  test('opens settings modal', () => {
    const { result } = renderHook(() =>
      useTableUserSettings({
        columns: mockColumns,
        config: defaultConfig,
        enableUserSettings: true,
      })
    )

    expect(result.current.settingsOpened).toBe(false)

    act(() => {
      result.current.openSettings()
    })

    expect(result.current.settingsOpened).toBe(true)
  })

  test('updates column width', () => {
    const { result } = renderHook(() =>
      useTableUserSettings({
        columns: mockColumns,
        config: defaultConfig,
        enableUserSettings: true,
      })
    )

    act(() => {
      result.current.handleChangeColumnWidth('name', 300)
    })

    expect(result.current.userColumnWidths).toEqual({ name: 300 })
  })

  test('merges new config with existing', () => {
    const { result } = renderHook(() =>
      useTableUserSettings({
        columns: mockColumns,
        config: defaultConfig,
        enableUserSettings: true,
      })
    )

    act(() => {
      result.current.handleChangeTableConfig({ striped: false })
    })

    expect(result.current.userTableConfig).toEqual({
      ...defaultConfig,
      striped: false,
    })
  })

  test('resets all settings to defaults', () => {
    const { result } = renderHook(() =>
      useTableUserSettings({
        columns: mockColumns,
        config: defaultConfig,
        enableUserSettings: true,
      })
    )

    // First toggle off a column
    act(() => {
      result.current.handleToggleColumn('name')
    })

    expect(result.current.userVisibleColumns).not.toContain('name')

    // Then reset
    act(() => {
      result.current.handleResetSettings()
    })

    expect(result.current.userVisibleColumns).toEqual(['id', 'name', 'age'])
  })

  test('uses defaultUserSettings when provided', () => {
    const defaultSettings = { visibleColumns: ['id'] }
    const { result } = renderHook(() =>
      useTableUserSettings({
        columns: mockColumns,
        config: defaultConfig,
        enableUserSettings: true,
        defaultUserSettings: defaultSettings,
      })
    )

    expect(result.current.userVisibleColumns).toEqual(['id'])
  })

  test('resets to all columns when using defaultUserSettings', () => {
    const defaultSettings = { visibleColumns: ['id'] }
    const { result } = renderHook(() =>
      useTableUserSettings({
        columns: mockColumns,
        config: defaultConfig,
        enableUserSettings: true,
        defaultUserSettings: defaultSettings,
      })
    )

    expect(result.current.userVisibleColumns).toEqual(['id'])

    act(() => {
      result.current.handleResetSettings()
    })

    expect(result.current.userVisibleColumns).toEqual(['id', 'name', 'age'])
  })

  test('closes settings modal', () => {
    const { result } = renderHook(() =>
      useTableUserSettings({
        columns: mockColumns,
        config: defaultConfig,
        enableUserSettings: true,
      })
    )

    act(() => {
      result.current.openSettings()
    })

    expect(result.current.settingsOpened).toBe(true)

    act(() => {
      result.current.closeSettings()
    })

    expect(result.current.settingsOpened).toBe(false)
  })

  test('adds column back when toggled on', () => {
    const defaultSettings = { visibleColumns: ['id'] }
    const { result } = renderHook(() =>
      useTableUserSettings({
        columns: mockColumns,
        config: defaultConfig,
        enableUserSettings: true,
        defaultUserSettings: defaultSettings,
      })
    )

    expect(result.current.userVisibleColumns).not.toContain('name')

    act(() => {
      result.current.handleToggleColumn('name')
    })

    expect(result.current.userVisibleColumns).toContain('name')
  })

  test('finalConfig returns userTableConfig when enableUserSettings is true', () => {
    const customConfig = { striped: false }
    const defaultSettings = { tableConfig: customConfig }
    const { result } = renderHook(() =>
      useTableUserSettings({
        columns: mockColumns,
        config: defaultConfig,
        enableUserSettings: true,
        defaultUserSettings: defaultSettings,
      })
    )

    expect(result.current.finalConfig).toEqual(customConfig)
  })

  test('finalConfig returns base config when enableUserSettings is false', () => {
    const customConfig = { striped: false }
    const defaultSettings = { tableConfig: customConfig }
    const { result } = renderHook(() =>
      useTableUserSettings({
        columns: mockColumns,
        config: defaultConfig,
        enableUserSettings: false,
        defaultUserSettings: defaultSettings,
      })
    )

    expect(result.current.finalConfig).toEqual(defaultConfig)
  })

  describe('onUserSettingsChange callback', () => {
    test('calls onUserSettingsChange when toggling column', () => {
      const onUserSettingsChange = mock(() => {})
      const { result } = renderHook(() =>
        useTableUserSettings({
          columns: mockColumns,
          config: defaultConfig,
          enableUserSettings: true,
          onUserSettingsChange,
        })
      )

      act(() => {
        result.current.handleToggleColumn('name')
      })

      expect(onUserSettingsChange).toHaveBeenCalledWith({
        visibleColumns: ['id', 'age'],
        columnWidths: {},
        columnOrder: ['id', 'name', 'age'],
        tableConfig: defaultConfig,
      })
    })

    test('calls onUserSettingsChange when changing column width', () => {
      const onUserSettingsChange = mock(() => {})
      const { result } = renderHook(() =>
        useTableUserSettings({
          columns: mockColumns,
          config: defaultConfig,
          enableUserSettings: true,
          onUserSettingsChange,
        })
      )

      act(() => {
        result.current.handleChangeColumnWidth('name', 300)
      })

      expect(onUserSettingsChange).toHaveBeenCalledWith({
        visibleColumns: ['id', 'name', 'age'],
        columnWidths: { name: 300 },
        columnOrder: ['id', 'name', 'age'],
        tableConfig: defaultConfig,
      })
    })

    test('calls onUserSettingsChange when changing table config', () => {
      const onUserSettingsChange = mock(() => {})
      const { result } = renderHook(() =>
        useTableUserSettings({
          columns: mockColumns,
          config: defaultConfig,
          enableUserSettings: true,
          onUserSettingsChange,
        })
      )

      act(() => {
        result.current.handleChangeTableConfig({ striped: false })
      })

      expect(onUserSettingsChange).toHaveBeenCalledWith({
        visibleColumns: ['id', 'name', 'age'],
        columnWidths: {},
        columnOrder: ['id', 'name', 'age'],
        tableConfig: { ...defaultConfig, striped: false },
      })
    })

    test('calls onUserSettingsChange when resetting settings', () => {
      const onUserSettingsChange = mock(() => {})
      const defaultSettings = { visibleColumns: ['id'] }
      const { result } = renderHook(() =>
        useTableUserSettings({
          columns: mockColumns,
          config: defaultConfig,
          enableUserSettings: true,
          defaultUserSettings: defaultSettings,
          onUserSettingsChange,
        })
      )

      act(() => {
        result.current.handleResetSettings()
      })

      expect(onUserSettingsChange).toHaveBeenCalledWith({
        visibleColumns: ['id', 'name', 'age'],
        columnWidths: {},
        columnOrder: ['id', 'name', 'age'],
        tableConfig: defaultConfig,
      })
    })

    test('does not call onUserSettingsChange when enableUserSettings is false', () => {
      const onUserSettingsChange = mock(() => {})
      const { result } = renderHook(() =>
        useTableUserSettings({
          columns: mockColumns,
          config: defaultConfig,
          enableUserSettings: false,
          onUserSettingsChange,
        })
      )

      act(() => {
        result.current.handleToggleColumn('name')
      })

      expect(onUserSettingsChange).not.toHaveBeenCalled()
    })
  })

  describe('syncing with external defaultUserSettings', () => {
    test('uses initial defaultUserSettings value', () => {
      const initialSettings = { visibleColumns: ['id'] }
      const { result } = renderHook(() =>
        useTableUserSettings({
          columns: mockColumns,
          config: defaultConfig,
          enableUserSettings: true,
          defaultUserSettings: initialSettings,
        })
      )

      expect(result.current.userVisibleColumns).toEqual(['id'])
    })

    test('uses defaultUserSettings for columnWidths', () => {
      const initialSettings = { columnWidths: { name: 250 } }
      const { result } = renderHook(() =>
        useTableUserSettings({
          columns: mockColumns,
          config: defaultConfig,
          enableUserSettings: true,
          defaultUserSettings: initialSettings,
        })
      )

      expect(result.current.userColumnWidths).toEqual({ name: 250 })
    })

    test('uses defaultUserSettings for tableConfig', () => {
      const customConfig = { striped: false, withColumnBorders: true }
      const initialSettings = { tableConfig: customConfig }
      const { result } = renderHook(() =>
        useTableUserSettings({
          columns: mockColumns,
          config: defaultConfig,
          enableUserSettings: true,
          defaultUserSettings: initialSettings,
        })
      )

      expect(result.current.userTableConfig).toEqual(customConfig)
    })

    test('syncs state when defaultUserSettings reference changes', () => {
      let settings: Partial<UserTableSettings> = {
        visibleColumns: ['id'],
        columnOrder: ['id', 'name', 'age'],
      }

      const { result, rerender } = renderHook(() =>
        useTableUserSettings({
          columns: mockColumns,
          config: defaultConfig,
          enableUserSettings: true,
          defaultUserSettings: settings,
        })
      )

      expect(result.current.userVisibleColumns).toEqual(['id'])

      settings = {
        visibleColumns: ['id', 'name'],
        columnOrder: ['id', 'name', 'age'],
      }
      rerender()

      expect(result.current.userVisibleColumns).toEqual(['id', 'name'])
    })
  })

  describe('column reconciliation', () => {
    const extendedColumns: ColumnConfig<TestItem & { email: string }>[] = [
      ...mockColumns,
      {
        key: 'email',
        label: 'Email',
        width: 200,
        render: (item) => item.email,
      },
    ]

    test('appends new columns to saved columnOrder', () => {
      const savedSettings = {
        columnOrder: ['id', 'name', 'age'],
        visibleColumns: ['id', 'name', 'age'],
      }

      const { result } = renderHook(() =>
        useTableUserSettings({
          columns: extendedColumns,
          config: defaultConfig,
          enableUserSettings: true,
          defaultUserSettings: savedSettings,
        })
      )

      expect(result.current.userColumnOrder).toEqual(['id', 'name', 'age', 'email'])
    })

    test('appends new columns to visible columns', () => {
      const savedSettings = {
        columnOrder: ['id', 'name', 'age'],
        visibleColumns: ['id', 'name'],
      }

      const { result } = renderHook(() =>
        useTableUserSettings({
          columns: extendedColumns,
          config: defaultConfig,
          enableUserSettings: true,
          defaultUserSettings: savedSettings,
        })
      )

      expect(result.current.userVisibleColumns).toEqual(['id', 'name', 'email'])
    })

    test('removes stale columns from saved columnOrder', () => {
      const reducedColumns: ColumnConfig<{ id: string; name: string }>[] = [
        { key: 'id', label: 'ID', width: 100, required: true, render: (item) => item.id },
        { key: 'name', label: 'Name', width: 200, render: (item) => item.name },
      ]

      const savedSettings = {
        columnOrder: ['id', 'name', 'age'],
        visibleColumns: ['id', 'name', 'age'],
      }

      const { result } = renderHook(() =>
        useTableUserSettings({
          columns: reducedColumns,
          config: defaultConfig,
          enableUserSettings: true,
          defaultUserSettings: savedSettings,
        })
      )

      expect(result.current.userColumnOrder).toEqual(['id', 'name'])
      expect(result.current.userVisibleColumns).toEqual(['id', 'name'])
    })

    test('preserves user column order when adding new columns', () => {
      const savedSettings = {
        columnOrder: ['age', 'name', 'id'],
        visibleColumns: ['age', 'name', 'id'],
      }

      const { result } = renderHook(() =>
        useTableUserSettings({
          columns: extendedColumns,
          config: defaultConfig,
          enableUserSettings: true,
          defaultUserSettings: savedSettings,
        })
      )

      expect(result.current.userColumnOrder).toEqual(['age', 'name', 'id', 'email'])
    })

    test('does not add new columns when columnOrder is absent', () => {
      const savedSettings = {
        visibleColumns: ['id'],
      }

      const { result } = renderHook(() =>
        useTableUserSettings({
          columns: extendedColumns,
          config: defaultConfig,
          enableUserSettings: true,
          defaultUserSettings: savedSettings,
        })
      )

      expect(result.current.userVisibleColumns).toEqual(['id'])
    })

    test('uses all column keys when no saved settings', () => {
      const { result } = renderHook(() =>
        useTableUserSettings({
          columns: extendedColumns,
          config: defaultConfig,
          enableUserSettings: true,
        })
      )

      expect(result.current.userColumnOrder).toEqual(['id', 'name', 'age', 'email'])
      expect(result.current.userVisibleColumns).toEqual(['id', 'name', 'age', 'email'])
    })

    test('reconciles on defaultUserSettings change', () => {
      let settings: Partial<UserTableSettings> = {
        columnOrder: ['id', 'name'],
        visibleColumns: ['id', 'name'],
      }

      const { result, rerender } = renderHook(() =>
        useTableUserSettings({
          columns: mockColumns,
          config: defaultConfig,
          enableUserSettings: true,
          defaultUserSettings: settings,
        })
      )

      expect(result.current.userColumnOrder).toEqual(['id', 'name', 'age'])
      expect(result.current.userVisibleColumns).toEqual(['id', 'name', 'age'])

      settings = {
        columnOrder: ['name', 'id'],
        visibleColumns: ['name'],
      }
      rerender()

      expect(result.current.userColumnOrder).toEqual(['name', 'id', 'age'])
      expect(result.current.userVisibleColumns).toEqual(['name', 'age'])
    })

    test('handles both add and remove simultaneously', () => {
      const newColumns: ColumnConfig<{ id: string; email: string }>[] = [
        { key: 'id', label: 'ID', width: 100, required: true, render: (item) => item.id },
        { key: 'email', label: 'Email', width: 200, render: (item) => item.email },
      ]

      const savedSettings = {
        columnOrder: ['id', 'name', 'age'],
        visibleColumns: ['id', 'name'],
      }

      const { result } = renderHook(() =>
        useTableUserSettings({
          columns: newColumns,
          config: defaultConfig,
          enableUserSettings: true,
          defaultUserSettings: savedSettings,
        })
      )

      expect(result.current.userColumnOrder).toEqual(['id', 'email'])
      expect(result.current.userVisibleColumns).toEqual(['id', 'email'])
    })

    test('drag reorder works after reconciliation', () => {
      const savedSettings = {
        columnOrder: ['id', 'name'],
        visibleColumns: ['id', 'name'],
      }

      const { result } = renderHook(() =>
        useTableUserSettings({
          columns: mockColumns,
          config: defaultConfig,
          enableUserSettings: true,
          defaultUserSettings: savedSettings,
        })
      )

      expect(result.current.userColumnOrder).toEqual(['id', 'name', 'age'])

      act(() => {
        result.current.handleChangeColumnOrder(['age', 'id', 'name'])
      })

      expect(result.current.userColumnOrder).toEqual(['age', 'id', 'name'])
    })
  })
})
