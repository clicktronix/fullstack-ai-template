import type { ActionAriaLabels, ActionsConfig, CellEditingState, ColumnConfig } from '../interfaces'

/**
 * Props for the TableRow component
 * @template T - Type of the data item
 */
export type TableRowProps<T extends Record<string, unknown>> = {
  /** Data item for the current row */
  item: T
  /** Unique key for the row */
  itemKey: string | number
  /** Columns to render */
  visibleColumns: ColumnConfig<T>[]
  /** Column width configuration */
  columnWidthsMap: Record<string, { width: number; minWidth: number }>
  /** Whether the row is currently selected */
  isSelected: boolean
  /** Handler for row click */
  onRowClick?: (item: T) => void
  /** Handler for row hover (e.g. prefetch data) */
  onRowHover?: (item: T) => void
  /** Grouped inline cell editing state */
  cellEditing: CellEditingState<T>
  /** Grouped actions configuration */
  actionsConfig: ActionsConfig<T>
  /** Grouped aria labels for action buttons */
  ariaLabels: ActionAriaLabels
}
