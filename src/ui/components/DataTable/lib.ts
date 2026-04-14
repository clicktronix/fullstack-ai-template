import { useCallback, useId, useMemo } from 'react'
import { useCellEditingTracker } from './hooks/use-cell-editing-tracker'
import { useColumnDrag } from './hooks/use-column-drag'
import { useInlineCellEditing } from './hooks/use-inline-cell-editing'
import { usePaginationInfo } from './hooks/use-pagination-info'
import { useTableAriaLabels } from './hooks/use-table-aria-labels'
import { useTableUserSettings } from './hooks/use-table-user-settings'
import { useVisibleColumns } from './hooks/use-visible-columns'
import type {
  ActionsConfig,
  CellEditingState,
  ColumnFilterValue,
  DataTableConfig,
  DataTableProps,
  EditingCell,
  PaginationConfig,
  SortConfig,
  SortDirection,
  UserTableSettings,
} from './interfaces'

const EMPTY_CONFIG: DataTableConfig = {}

export type UseDataTablePropsInput<T extends Record<string, unknown>> = {
  data: T[]
  columns: DataTableProps<T>['columns']
  config?: DataTableProps<T>['config']
  keyExtractor: (item: T) => string | number
  emptyMessage?: DataTableProps<T>['emptyMessage']
  isPending?: boolean
  /** Whether data is being refetched in background (shows overlay instead of skeleton) */
  isFetching?: boolean
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onRefresh?: () => void
  actionsLabel?: DataTableProps<T>['actionsLabel']
  title?: DataTableProps<T>['title']
  description?: DataTableProps<T>['description']
  headerRightSection?: DataTableProps<T>['headerRightSection']
  enableUserSettings?: boolean
  defaultUserSettings?: Partial<UserTableSettings>
  onUserSettingsChange?: (settings: UserTableSettings) => void
  // Sorting
  sortConfig?: SortConfig<T>
  onSort?: (key: keyof T, direction?: SortDirection) => void
  onSortClear?: () => void
  // Pagination
  pagination?: PaginationConfig
  onPageChange?: (page: number) => void
  // Row selection
  selectedKey?: string | number | null
  onRowClick?: (item: T) => void
  // Row hover (e.g. prefetch)
  onRowHover?: (item: T) => void
  // Loading skeleton
  skeletonRows?: number
  // Hide header but keep settings functionality
  hideHeader?: boolean
  // External control for settings modal
  externalSettingsOpened?: boolean
  onExternalSettingsClose?: () => void
  // Row actions menu
  rowActions?: DataTableProps<T>['rowActions']
  // Inline cell editing
  onCellSave?: DataTableProps<T>['onCellSave']
  /** Inline cell currently being saved (mutation in-flight) */
  savingCell?: EditingCell
  // Column reorder
  enableColumnReorder?: boolean
  // Column filters
  columnFilters?: Record<string, ColumnFilterValue>
  onColumnFilterChange?: (key: string, value: ColumnFilterValue | undefined) => void
  // Batched sort+filter changes
  onColumnApplyChanges?: DataTableProps<T>['onColumnApplyChanges']
  // Separate filter config map (decoupled from columns)
  filterConfigMap?: DataTableProps<T>['filterConfigMap']
}

/**
 * Main hook for DataTable - координатор, композирующий все sub-hooks.
 *
 * Ответственности делегированы:
 * - useVisibleColumns: фильтрация, сортировка колонок, ширины, sortable keys
 * - usePaginationInfo: вычисление страниц, текстов пагинации
 * - useTableAriaLabels: все локализованные строки и aria-labels
 * - useTableUserSettings: пользовательские настройки (видимость, ширины, порядок)
 * - useColumnDrag: drag-and-drop колонок
 * - useInlineCellEditing: inline редактирование ячеек
 * - useCellEditingTracker: трекинг состояния редактирования
 */
export function useDataTableProps<T extends Record<string, unknown>>({
  data,
  columns,
  config = EMPTY_CONFIG,
  keyExtractor,
  emptyMessage,
  isPending = false,
  isFetching = false,
  onEdit,
  onDelete,
  onRefresh,
  actionsLabel,
  title,
  description,
  headerRightSection,
  enableUserSettings = false,
  defaultUserSettings,
  onUserSettingsChange,
  sortConfig,
  onSort,
  onSortClear,
  pagination,
  onPageChange,
  selectedKey,
  onRowClick,
  onRowHover,
  skeletonRows = 5,
  hideHeader = false,
  externalSettingsOpened,
  onExternalSettingsClose,
  rowActions,
  onCellSave,
  savingCell,
  enableColumnReorder = false,
  columnFilters,
  onColumnFilterChange,
  onColumnApplyChanges,
  filterConfigMap,
}: UseDataTablePropsInput<T>) {
  // Stable ID for DndContext to prevent hydration mismatch
  const dndContextId = useId()

  // --- Sub-hooks ---

  const {
    defaultEmptyMessage,
    defaultActionsLabel,
    ariaLabels,
    refreshAriaLabel,
    settingsAriaLabel,
  } = useTableAriaLabels()

  const finalEmptyMessage = emptyMessage ?? defaultEmptyMessage
  const finalActionsLabel = actionsLabel ?? defaultActionsLabel

  const cellEditingTracker = useCellEditingTracker()

  const inlineCellEditing = useInlineCellEditing({
    keyExtractor,
    onCellSave,
    onCellEditStart: cellEditingTracker.onCellEditStart,
    onCellEditEnd: cellEditingTracker.onCellEditEnd,
  })

  const userSettings = useTableUserSettings({
    columns,
    config,
    enableUserSettings,
    defaultUserSettings,
    onUserSettingsChange,
  })

  const columnDrag = useColumnDrag({
    columnOrder: userSettings.userColumnOrder,
    onColumnOrderChange: userSettings.handleChangeColumnOrder,
    enabled: enableColumnReorder,
  })

  const { visibleColumns, columnWidthsMap, sortableColumnKeys, getActiveColumn } =
    useVisibleColumns({
      columns,
      enableUserSettings,
      userVisibleColumns: userSettings.userVisibleColumns,
      enableColumnReorder,
      localColumnOrder: columnDrag.localColumnOrder,
      userColumnWidths: userSettings.userColumnWidths,
    })

  const { totalPages, showPagination, pageInfoText, paginationAriaLabel } = usePaginationInfo({
    pagination,
  })

  // --- Derived layout values ---

  const {
    striped = false,
    highlightOnHover = true,
    withColumnBorders = false,
    horizontalSpacing = 'md',
    verticalSpacing = 'sm',
  } = userSettings.finalConfig

  const minWidth = 800
  const hasActions = !!(onEdit || onDelete || (rowActions && rowActions.length > 0))
  const actionsWidth = 120
  const totalColumns = visibleColumns.length + 1 + (hasActions ? 1 : 0)
  const showHeader =
    !hideHeader && !!(title || description || onRefresh || enableUserSettings || headerRightSection)

  // Settings modal (может управляться извне)
  const effectiveSettingsOpened = externalSettingsOpened ?? userSettings.settingsOpened
  const handleSettingsClose = useCallback(() => {
    if (onExternalSettingsClose) {
      onExternalSettingsClose()
    } else {
      userSettings.closeSettings()
    }
  }, [userSettings, onExternalSettingsClose])

  // --- Grouped state (reduces prop drilling) ---

  const cellEditing = useMemo<CellEditingState<T>>(
    () => ({
      cellEditValue: inlineCellEditing.cellEditValue,
      isCellEditing: inlineCellEditing.isCellEditing,
      handleCellDoubleClick: inlineCellEditing.handleCellDoubleClick,
      handleCellBlur: inlineCellEditing.handleCellBlur,
      handleCellKeyDown: inlineCellEditing.handleCellKeyDown,
      handleCellValueChange: inlineCellEditing.handleCellValueChange,
      onCellSave,
      shouldBlockRowClick: cellEditingTracker.shouldBlockRowClick,
      savingCell: savingCell ?? null,
    }),
    [inlineCellEditing, onCellSave, cellEditingTracker.shouldBlockRowClick, savingCell]
  )

  const actionsConfig = useMemo<ActionsConfig<T>>(
    () => ({
      hasActions,
      actionsWidth,
      rowActions,
      onEdit,
      onDelete,
    }),
    [hasActions, actionsWidth, rowActions, onEdit, onDelete]
  )

  const cellEditingContextValue = useMemo(
    () => ({
      onCellEditStart: cellEditingTracker.onCellEditStart,
      onCellEditEnd: cellEditingTracker.onCellEditEnd,
    }),
    [cellEditingTracker.onCellEditStart, cellEditingTracker.onCellEditEnd]
  )

  return {
    // Data
    data,
    visibleColumns,
    columnWidthsMap,
    keyExtractor,
    emptyMessage: finalEmptyMessage,
    isPending,
    isFetching,

    // Grouped state
    cellEditing,
    actionsConfig,
    ariaLabels,

    // Layout
    totalColumns,
    minWidth,
    striped,
    highlightOnHover,
    withColumnBorders,
    horizontalSpacing,
    verticalSpacing,
    actionsLabel: finalActionsLabel,

    // Header
    showHeader,
    title,
    description,
    headerRightSection,
    onRefresh,

    // Settings (from useTableUserSettings)
    enableUserSettings,
    columns,
    ...userSettings,
    // Override with external control if provided
    settingsOpened: effectiveSettingsOpened,
    handleSettingsClose,

    // Sorting
    sortConfig,
    onSort,
    onSortClear,

    // Pagination
    pagination,
    onPageChange,
    totalPages,
    showPagination,
    pageInfoText,
    paginationAriaLabel,

    // Row selection
    selectedKey,
    onRowClick,
    onRowHover,

    // Skeleton
    skeletonRows,

    // Translated header aria-labels
    refreshAriaLabel,
    settingsAriaLabel,

    // Cell editing context (pre-memoized for CellEditingContext.Provider)
    cellEditingContextValue,

    // DndContext stable ID (prevents hydration mismatch)
    dndContextId,

    // Column reorder
    enableColumnReorder,
    columnDragSensors: columnDrag.sensors,
    activeColumnKey: columnDrag.activeColumnKey,
    sortableColumnKeys,
    onColumnDragStart: columnDrag.handleDragStart,
    onColumnDragOver: columnDrag.handleDragOver,
    onColumnDragEnd: columnDrag.handleDragEnd,
    getActiveColumn,

    // Column filters
    columnFilters,
    onColumnFilterChange,

    // Batched sort+filter changes
    onColumnApplyChanges,

    // Separate filter config map (decoupled from columns)
    filterConfigMap,
  }
}
