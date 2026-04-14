import { useDisclosure } from '@mantine/hooks'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ColumnConfig, DataTableConfig, UserTableSettings } from '../interfaces'

const EMPTY_CONFIG: DataTableConfig = {}

export type UseTableUserSettingsInput<T extends Record<string, unknown>> = {
  columns: ColumnConfig<T>[]
  config?: DataTableConfig
  enableUserSettings: boolean
  defaultUserSettings?: Partial<UserTableSettings>
  onUserSettingsChange?: (settings: UserTableSettings) => void
}

export type UseTableUserSettingsReturn = {
  settingsOpened: boolean
  openSettings: () => void
  closeSettings: () => void
  userVisibleColumns: string[]
  userColumnWidths: Record<string, number>
  userColumnOrder: string[]
  userTableConfig: DataTableConfig
  finalConfig: DataTableConfig
  handleToggleColumn: (key: string) => void
  handleChangeColumnWidth: (key: string, width: number) => void
  handleChangeColumnOrder: (order: string[]) => void
  handleChangeTableConfig: (newConfig: Partial<DataTableConfig>) => void
  handleResetSettings: () => void
}

type ResolvedSettings = {
  visibleColumns: string[]
  columnWidths: Record<string, number>
  columnOrder: string[]
  tableConfig: DataTableConfig
}

function areArraysEqual(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) return false
  for (const [i, element] of a.entries()) {
    if (element !== b[i]) return false
  }
  return true
}

function areRecordsEqual(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false
  for (const key of keysA) {
    if (a[key] !== b[key]) return false
  }
  return true
}

/**
 * Сравнивает два объекта настроек без JSON.stringify.
 * Выполняет shallow-сравнение каждого поля UserTableSettings.
 */
function areSettingsEqual(a?: Partial<UserTableSettings>, b?: Partial<UserTableSettings>): boolean {
  if (a === b) return true
  if (!a || !b) return false

  const aVisible = a.visibleColumns
  const bVisible = b.visibleColumns
  if (aVisible !== bVisible && (!aVisible || !bVisible || !areArraysEqual(aVisible, bVisible)))
    return false

  const aOrder = a.columnOrder
  const bOrder = b.columnOrder
  if (aOrder !== bOrder && (!aOrder || !bOrder || !areArraysEqual(aOrder, bOrder))) return false

  const aWidths = a.columnWidths
  const bWidths = b.columnWidths
  if (aWidths !== bWidths && (!aWidths || !bWidths || !areRecordsEqual(aWidths, bWidths)))
    return false

  const aConfig = a.tableConfig
  const bConfig = b.tableConfig
  if (aConfig !== bConfig && (!aConfig || !bConfig || !areRecordsEqual(aConfig, bConfig)))
    return false

  return true
}

/**
 * Преобразует сохранённые пользовательские настройки в актуальные,
 * синхронизируя с текущим набором колонок.
 *
 * - Удаляет ключи колонок, которых больше нет
 * - Добавляет новые колонки в конец порядка и в видимые
 */
function resolveSettings<T extends Record<string, unknown>>(
  saved: Partial<UserTableSettings> | undefined,
  columns: ColumnConfig<T>[],
  fallbackConfig: DataTableConfig
): ResolvedSettings {
  const allKeys = columns.map((col) => col.key)

  if (!saved) {
    return {
      visibleColumns: allKeys,
      columnWidths: {},
      columnOrder: allKeys,
      tableConfig: fallbackConfig,
    }
  }

  const currentKeys = new Set(allKeys)

  // Reconciliation новых/удалённых колонок возможен только при наличии savedOrder —
  // именно по нему определяем, какие колонки были добавлены после сохранения настроек
  const savedOrderKeys = saved.columnOrder ? new Set(saved.columnOrder) : null
  const newKeys = savedOrderKeys ? allKeys.filter((key) => !savedOrderKeys.has(key)) : []

  const columnOrder = saved.columnOrder
    ? [...saved.columnOrder.filter((key) => currentKeys.has(key)), ...newKeys]
    : allKeys

  const visibleColumns = saved.visibleColumns
    ? [...saved.visibleColumns.filter((key) => currentKeys.has(key)), ...newKeys]
    : allKeys

  return {
    visibleColumns,
    columnWidths: saved.columnWidths ?? {},
    columnOrder,
    tableConfig: saved.tableConfig ?? fallbackConfig,
  }
}

/**
 * Хук для управления пользовательскими настройками таблицы.
 * Позволяет настраивать видимость колонок, ширину колонок и конфигурацию таблицы.
 *
 * @param columns - Конфигурация колонок таблицы
 * @param config - Базовая конфигурация таблицы
 * @param enableUserSettings - Флаг включения пользовательских настроек
 * @param defaultUserSettings - Начальные пользовательские настройки
 * @param onUserSettingsChange - Callback при изменении настроек
 */
export function useTableUserSettings<T extends Record<string, unknown>>({
  columns,
  config = EMPTY_CONFIG,
  enableUserSettings,
  defaultUserSettings,
  onUserSettingsChange,
}: UseTableUserSettingsInput<T>): UseTableUserSettingsReturn {
  const [settingsOpened, { open: openSettings, close: closeSettings }] = useDisclosure(false)

  const initial = resolveSettings(defaultUserSettings, columns, config)
  const [userVisibleColumns, setUserVisibleColumns] = useState<string[]>(initial.visibleColumns)
  const [userColumnWidths, setUserColumnWidths] = useState<Record<string, number>>(
    initial.columnWidths
  )
  const [userTableConfig, setUserTableConfig] = useState<DataTableConfig>(initial.tableConfig)
  const [userColumnOrder, setUserColumnOrder] = useState<string[]>(initial.columnOrder)

  const prevDefaultSettingsRef = useRef(defaultUserSettings)
  // Refs для актуальных значений состояний, чтобы избежать stale closures в emitSettingsChange
  const userVisibleColumnsRef = useRef(userVisibleColumns)
  const userColumnWidthsRef = useRef(userColumnWidths)
  const userTableConfigRef = useRef(userTableConfig)
  const userColumnOrderRef = useRef(userColumnOrder)

  // We use refs for columns and config to avoid recreating callbacks when these props change.
  // This is intentional: handleResetSettings needs access to current columns/config values,
  // but we don't want to add them to useCallback dependencies (which would break memoization
  // and cause unnecessary re-renders in parent components).
  // DO NOT "simplify" by adding columns/config to dependencies - it will break the API.
  const columnsRef = useRef(columns)
  const configRef = useRef(config)

  // Update refs synchronously before other effects run
  useLayoutEffect(() => {
    columnsRef.current = columns
    configRef.current = config
    userVisibleColumnsRef.current = userVisibleColumns
    userColumnWidthsRef.current = userColumnWidths
    userTableConfigRef.current = userTableConfig
    userColumnOrderRef.current = userColumnOrder
  }, [columns, config, userVisibleColumns, userColumnWidths, userTableConfig, userColumnOrder])

  useEffect(() => {
    if (!enableUserSettings) return
    if (areSettingsEqual(prevDefaultSettingsRef.current, defaultUserSettings)) return
    prevDefaultSettingsRef.current = defaultUserSettings

    const resolved = resolveSettings(defaultUserSettings, columnsRef.current, configRef.current)
    setUserVisibleColumns(resolved.visibleColumns)
    setUserColumnWidths(resolved.columnWidths)
    setUserTableConfig(resolved.tableConfig)
    setUserColumnOrder(resolved.columnOrder)
  }, [enableUserSettings, defaultUserSettings])

  const finalConfig = enableUserSettings ? userTableConfig : (config ?? {})

  const emitSettingsChange = useCallback(
    (settings: UserTableSettings) => {
      if (!enableUserSettings) return
      onUserSettingsChange?.(settings)
    },
    [enableUserSettings, onUserSettingsChange]
  )

  const handleToggleColumn = useCallback(
    (key: string) => {
      setUserVisibleColumns((prev) => {
        const nextVisibleColumns = prev.includes(key)
          ? prev.filter((k) => k !== key)
          : [...prev, key]
        emitSettingsChange({
          visibleColumns: nextVisibleColumns,
          columnWidths: userColumnWidthsRef.current,
          columnOrder: userColumnOrderRef.current,
          tableConfig: userTableConfigRef.current,
        })
        return nextVisibleColumns
      })
    },
    [emitSettingsChange]
  )

  const handleChangeColumnWidth = useCallback(
    (key: string, width: number) => {
      setUserColumnWidths((prev) => {
        const nextColumnWidths = { ...prev, [key]: width }
        emitSettingsChange({
          visibleColumns: userVisibleColumnsRef.current,
          columnWidths: nextColumnWidths,
          columnOrder: userColumnOrderRef.current,
          tableConfig: userTableConfigRef.current,
        })
        return nextColumnWidths
      })
    },
    [emitSettingsChange]
  )

  const handleChangeTableConfig = useCallback(
    (newConfig: Partial<DataTableConfig>) => {
      setUserTableConfig((prev) => {
        const nextTableConfig = { ...prev, ...newConfig }
        emitSettingsChange({
          visibleColumns: userVisibleColumnsRef.current,
          columnWidths: userColumnWidthsRef.current,
          columnOrder: userColumnOrderRef.current,
          tableConfig: nextTableConfig,
        })
        return nextTableConfig
      })
    },
    [emitSettingsChange]
  )

  const handleChangeColumnOrder = useCallback(
    (order: string[]) => {
      setUserColumnOrder(order)
      emitSettingsChange({
        visibleColumns: userVisibleColumnsRef.current,
        columnWidths: userColumnWidthsRef.current,
        columnOrder: order,
        tableConfig: userTableConfigRef.current,
      })
    },
    [emitSettingsChange]
  )

  const handleResetSettings = useCallback(() => {
    const nextVisibleColumns = columnsRef.current.map((col) => col.key)
    const nextColumnWidths: Record<string, number> = {}
    const nextColumnOrder = columnsRef.current.map((col) => col.key)
    const nextTableConfig = configRef.current ?? {}

    setUserVisibleColumns(nextVisibleColumns)
    setUserColumnWidths(nextColumnWidths)
    setUserColumnOrder(nextColumnOrder)
    setUserTableConfig(nextTableConfig)

    emitSettingsChange({
      visibleColumns: nextVisibleColumns,
      columnWidths: nextColumnWidths,
      columnOrder: nextColumnOrder,
      tableConfig: nextTableConfig,
    })
  }, [emitSettingsChange])

  return {
    settingsOpened,
    openSettings,
    closeSettings,
    userVisibleColumns,
    userColumnWidths,
    userColumnOrder,
    userTableConfig,
    finalConfig,
    handleToggleColumn,
    handleChangeColumnWidth,
    handleChangeColumnOrder,
    handleChangeTableConfig,
    handleResetSettings,
  }
}
