import type { ReactNode } from 'react'
import type { ColumnApplyChanges } from './ColumnFilterPopover/interfaces'

export type SortDirection = 'asc' | 'desc'

// Simple option format
type SimpleOption = { value: string; label: string }

// Grouped option format (Mantine ComboboxData)
type GroupedOption = { group: string; items: SimpleOption[] }

// Combined options type supporting both formats
export type FilterOptions = SimpleOption[] | GroupedOption[]

export type SelectPairValue = {
  first?: string
  second?: string
}

// Discriminated union — каждый тип фильтра содержит только свои поля
export type ColumnFilterConfig =
  | { type: 'select'; options: FilterOptions; placeholder?: string }
  | { type: 'multi-select'; options: FilterOptions; placeholder?: string }
  | {
      type: 'select-pair'
      firstOptions: FilterOptions
      firstPlaceholder?: string
      firstLabel?: string
      secondOptions: FilterOptions
      secondPlaceholder?: string
      secondLabel?: string
    }
  | { type: 'number-range'; min?: number; max?: number; step?: number; allowDecimal?: boolean }
  | { type: 'search'; placeholder?: string }

export type ColumnFilterValue = string | string[] | SelectPairValue | { min?: number; max?: number }

export type ColumnConfig<T> = {
  key: string
  label: ReactNode
  /** Optional display label used in settings UI when header label is hidden or icon-only */
  settingsLabel?: ReactNode
  /** Test ID for e2e tests (rendered as data-testid on column header) */
  testId?: string
  /** Column width in pixels */
  width?: number
  /** Minimum column width in pixels */
  minWidth?: number
  /** Interaction kind for cell editing. 'inline' for text input, 'popover' for custom popover UI */
  interactionKind?: 'inline' | 'popover'
  /**
   * Controls whether this column is editable for a given row.
   * When false, inline editing and popover editing are disabled for this cell.
   */
  isEditable?: boolean | ((item: T) => boolean)
  /** Enable sorting for this column */
  sortable?: boolean
  /** Column filter configuration */
  filterConfig?: ColumnFilterConfig
  /** Key to use for sorting (defaults to column key) */
  sortKey?: keyof T
  /** Whether this column is required and cannot be hidden */
  required?: boolean
  /** Whether this column can be reordered with drag-and-drop */
  reorderable?: boolean
  /** Whether header action icons should remain visible when column has active sort/filter */
  persistHeaderActions?: boolean
  render: (item: T) => ReactNode
}

/** Mantine Table API pass-through — each prop maps directly to a Mantine <Table> prop */
export type DataTableConfig = {
  striped?: boolean
  highlightOnHover?: boolean
  withColumnBorders?: boolean
  horizontalSpacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  verticalSpacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export type UserTableSettings = {
  visibleColumns: string[]
  columnWidths: Record<string, number>
  tableConfig: DataTableConfig
  /** Order of columns (array of column keys) */
  columnOrder: string[]
}

export type SortConfig<T> = {
  key: keyof T | null
  direction: SortDirection
}

export type PaginationConfig = {
  page: number
  pageSize: number
  totalItems: number
}

export type RowAction<T> = {
  key: string
  label: ReactNode
  icon?: ReactNode
  color?: string
  onClick: (item: T) => void
  /** Hide this action for specific items */
  hidden?: (item: T) => boolean
  /** Disable this action for specific items */
  disabled?: (item: T) => boolean
}

/** Cell being edited */
export type EditingCell = {
  rowKey: string | number
  columnKey: string
} | null

/**
 * DataTable boolean props rationale:
 * - `isPending` / `isFetching`: TanStack Query loading states (independent, not mutually exclusive)
 * - `enableUserSettings`: Feature flag — independently toggleable
 * - `enableColumnReorder`: Feature flag — independently toggleable
 * - Config booleans (striped, highlightOnHover, withColumnBorders) are in DataTableConfig above
 */
export type DataTableProps<T> = {
  data: T[]
  columns: ColumnConfig<T>[]
  config?: DataTableConfig
  keyExtractor: (item: T) => string | number
  emptyMessage?: ReactNode
  isPending?: boolean
  /** Whether data is being refetched in background (shows overlay instead of skeleton) */
  isFetching?: boolean
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onRefresh?: () => void
  actionsLabel?: ReactNode
  title?: ReactNode
  description?: ReactNode
  headerRightSection?: ReactNode
  enableUserSettings?: boolean
  defaultUserSettings?: Partial<UserTableSettings>
  onUserSettingsChange?: (settings: UserTableSettings) => void
  /** Sorting configuration */
  sortConfig?: SortConfig<T>
  onSort?: (key: keyof T, direction?: SortDirection) => void
  /** Clear current sort (reset to unsorted state) */
  onSortClear?: () => void
  /** Pagination configuration */
  pagination?: PaginationConfig
  onPageChange?: (page: number) => void
  /** Row selection */
  selectedKey?: string | number | null
  onRowClick?: (item: T) => void
  /** Handler for row hover (e.g. prefetch data) */
  onRowHover?: (item: T) => void
  /** Loading skeleton rows count */
  skeletonRows?: number
  /** Row actions menu (replaces default edit/delete buttons) */
  rowActions?: RowAction<T>[]
  /** Inline cell editing: save single cell value on blur */
  onCellSave?: (item: T, columnKey: string, value: string) => void
  /** Enable drag-and-drop column reordering */
  enableColumnReorder?: boolean
  /** Column filters state */
  columnFilters?: Record<string, ColumnFilterValue>
  /** Callback when column filter changes */
  onColumnFilterChange?: (key: string, value: ColumnFilterValue | undefined) => void
  /** Batched callback for column sort+filter changes (prevents race condition) */
  onColumnApplyChanges?: (key: string, changes: ColumnApplyChanges) => void
  /** Separate filter config map (column key -> ColumnFilterConfig), decoupled from columns */
  filterConfigMap?: Record<string, ColumnFilterConfig>
}

// --- Grouped prop types to reduce prop drilling ---

/** Grouped inline cell editing state (from useInlineCellEditing + cellEditingTracker) */
export type CellEditingState<T> = {
  cellEditValue: string
  isCellEditing: (rowKey: string | number, columnKey: string) => boolean
  handleCellDoubleClick: (item: T, columnKey: string, currentValue: string) => void
  handleCellBlur: () => void
  handleCellKeyDown: (e: React.KeyboardEvent) => void
  handleCellValueChange: (value: string) => void
  onCellSave?: (item: T, columnKey: string, value: string) => void
  shouldBlockRowClick: () => boolean
  /** Ячейка, которая сейчас сохраняется (мутация in-flight) */
  savingCell: EditingCell
}

/** Grouped actions configuration for DataTable rows */
export type ActionsConfig<T> = {
  hasActions: boolean
  actionsWidth: number
  rowActions?: RowAction<T>[]
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
}

/** Grouped aria labels for DataTable action buttons */
export type ActionAriaLabels = {
  edit: string
  delete: string
  rowActions: string
}
