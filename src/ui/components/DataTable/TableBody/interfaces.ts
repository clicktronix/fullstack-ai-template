import type { ReactNode } from 'react'
import type { ActionAriaLabels, ActionsConfig, CellEditingState, ColumnConfig } from '../interfaces'

/**
 * Props for the TableBody component
 * @template T - Type of the data items
 */
export type TableBodyProps<T extends Record<string, unknown>> = {
  /** Data items to render */
  data: T[]
  /** Function to extract unique key from item */
  keyExtractor: (item: T) => string | number
  /** Columns to render */
  visibleColumns: ColumnConfig<T>[]
  /** Column width configuration */
  columnWidthsMap: Record<string, { width: number; minWidth: number }>
  /** Total number of columns including actions and spacer */
  totalColumns: number
  /** Message to display when data is empty */
  emptyMessage: ReactNode
  /** Whether data is being loaded */
  isPending: boolean
  /** Number of skeleton rows to display during loading */
  skeletonRows: number
  /** Currently selected row key */
  selectedKey?: string | number | null
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
