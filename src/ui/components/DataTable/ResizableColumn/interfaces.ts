import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import type { ReactNode } from 'react'
import type { ColumnApplyChanges } from '../ColumnFilterPopover/interfaces'
import type { ColumnFilterConfig, ColumnFilterValue, SortDirection } from '../interfaces'

/** Props the View component accepts (P) */
export type ResizableColumnViewProps = {
  testId?: string
  filterTriggerTestId?: string
  filterInputTestId?: string
  label: ReactNode
  /** Whether the column is currently being resized */
  isResizing: boolean
  /** Whether column reordering is enabled */
  isDraggable: boolean
  /** Whether column is sortable */
  sortable: boolean
  /** Whether this column is currently sorted */
  isSorted: boolean
  /** Whether header action icons should remain visible when active */
  persistHeaderActions?: boolean
  /** Sort direction */
  sortDirection: SortDirection
  /** Combined width style for the column header */
  widthStyle: React.CSSProperties
  /** Drag tooltip text */
  dragTooltip: string
  /** Aria-sort attribute value */
  ariaSort: React.AriaAttributes['aria-sort']
  /** Callback for starting resize */
  handleResizeStart: (e: React.MouseEvent) => void
  /** Keyboard handler for resize handle (arrow keys) */
  handleResizeKeyDown: (e: React.KeyboardEvent) => void
  /** Aria label for resize handle */
  resizeHandleAriaLabel: string
  /** Callback for sort change from ColumnFilterPopover */
  handleSortChange: (direction: SortDirection | undefined) => void
  /** dnd-kit sortable attributes */
  dragAttributes?: DraggableAttributes
  /** dnd-kit sortable listeners */
  dragListeners?: SyntheticListenerMap
  /** Ref setter for the draggable node */
  setDragNodeRef?: (node: HTMLElement | null) => void
  /** Filter configuration for this column */
  filterConfig?: ColumnFilterConfig
  /** Current filter value */
  filterValue?: ColumnFilterValue
  /** Callback when filter changes */
  onFilterChange?: (value: ColumnFilterValue | undefined) => void
  /** Batched callback: applies both sort and filter changes in one URL update */
  onApplyChanges?: (changes: ColumnApplyChanges) => void
}

/** Extra props consumed by the hook but not passed to the View (E) */
export type ResizableColumnExternalProps = {
  /** Column key for identification */
  columnKey: string
  /** Current width in pixels */
  width: number
  /** Minimum width */
  minWidth?: number
  /** Maximum width */
  maxWidth?: number
  /** Callback when sort is requested */
  onSort?: (direction?: SortDirection) => void
  /** Callback to clear sort (reset to unsorted state) */
  onSortClear?: () => void
  /** Callback when resize ends */
  onResizeEnd: (columnKey: string, width: number) => void
  /** Additional styles (transform, opacity for drag) */
  dragStyle?: React.CSSProperties
}

/** Hook return type (H1) - computed subset of ViewProps */
export type ResizableColumnHookReturn = {
  filterTriggerTestId: string
  filterInputTestId: string
  isResizing: boolean
  isDraggable: boolean
  sortable: boolean
  isSorted: boolean
  sortDirection: SortDirection
  widthStyle: React.CSSProperties
  dragTooltip: string
  ariaSort: React.AriaAttributes['aria-sort']
  handleResizeStart: (e: React.MouseEvent) => void
  handleResizeKeyDown: (e: React.KeyboardEvent) => void
  resizeHandleAriaLabel: string
  handleSortChange: (direction: SortDirection | undefined) => void
}

/** Full external API = ResizableColumnProps (for DraggableColumn usage) */
export type ResizableColumnProps = Omit<ResizableColumnViewProps, keyof ResizableColumnHookReturn> &
  Omit<Partial<ResizableColumnHookReturn>, keyof ResizableColumnExternalProps> &
  ResizableColumnExternalProps
