import { useCallback, useMemo } from 'react'
import type { ColumnConfig } from '../interfaces'

type UseVisibleColumnsInput<T extends Record<string, unknown>> = {
  columns: ColumnConfig<T>[]
  enableUserSettings: boolean
  userVisibleColumns: string[]
  enableColumnReorder: boolean
  localColumnOrder: string[]
  userColumnWidths: Record<string, number>
}

type UseVisibleColumnsResult<T extends Record<string, unknown>> = {
  /** Отфильтрованные и отсортированные видимые колонки */
  visibleColumns: ColumnConfig<T>[]
  /** Предвычисленные ширины колонок */
  columnWidthsMap: Record<string, { width: number; minWidth: number }>
  /** Ключи колонок для SortableContext (только перетаскиваемые) */
  sortableColumnKeys: string[]
  /** Получить конфигурацию колонки по ключу (для DragOverlay) */
  getActiveColumn: (key: string) => ColumnConfig<T> | undefined
}

/**
 * Хук для вычисления видимых колонок, их ширин и ключей для drag-and-drop.
 * Фильтрует колонки по пользовательским настройкам видимости,
 * сортирует по пользовательскому порядку, вычисляет ширины.
 */
export function useVisibleColumns<T extends Record<string, unknown>>({
  columns,
  enableUserSettings,
  userVisibleColumns,
  enableColumnReorder,
  localColumnOrder,
  userColumnWidths,
}: UseVisibleColumnsInput<T>): UseVisibleColumnsResult<T> {
  // Set видимых колонок для O(1) проверки
  const visibleColumnsSet = useMemo(() => new Set(userVisibleColumns), [userVisibleColumns])

  // Отфильтрованные колонки (без сортировки по порядку)
  const filteredColumns = useMemo(() => {
    if (!enableUserSettings) return columns

    return columns.filter((col) => col.required || visibleColumnsSet.has(col.key))
  }, [columns, enableUserSettings, visibleColumnsSet])

  // Сортировка видимых колонок по пользовательскому порядку
  const visibleColumns = useMemo(() => {
    if (!enableColumnReorder) return filteredColumns

    const fixedColumns = filteredColumns.filter((col) => col.reorderable === false)
    const movableColumns = filteredColumns.filter((col) => col.reorderable !== false)
    const orderMap = new Map(localColumnOrder.map((key, idx) => [key, idx]))

    return [
      ...fixedColumns,
      ...movableColumns.toSorted((a, b) => {
        const aIdx = orderMap.get(a.key) ?? Infinity
        const bIdx = orderMap.get(b.key) ?? Infinity
        return aIdx - bIdx
      }),
    ]
  }, [filteredColumns, enableColumnReorder, localColumnOrder])

  // Предвычисленные ширины колонок
  const columnWidthsMap = useMemo(() => {
    const map: Record<string, { width: number; minWidth: number }> = {}
    visibleColumns.forEach((col) => {
      const baseWidth = col.width ?? 100
      const baseMinWidth = col.minWidth ?? 50
      const width = userColumnWidths[col.key] ?? baseWidth
      map[col.key] = { width, minWidth: baseMinWidth }
    })
    return map
  }, [visibleColumns, userColumnWidths])

  // Ключи колонок для SortableContext (только reorderable)
  const sortableColumnKeys = useMemo(
    () => visibleColumns.filter((col) => col.reorderable !== false).map((col) => col.key),
    [visibleColumns]
  )

  // Получить конфигурацию колонки по ключу (для DragOverlay)
  const getActiveColumn = useCallback(
    (key: string): ColumnConfig<T> | undefined => columns.find((col) => col.key === key),
    [columns]
  )

  return {
    visibleColumns,
    columnWidthsMap,
    sortableColumnKeys,
    getActiveColumn,
  }
}
