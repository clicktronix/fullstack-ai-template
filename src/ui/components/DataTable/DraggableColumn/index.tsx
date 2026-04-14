'use client'

/**
 * DraggableColumn - wrapper for ResizableColumn with dnd-kit sortable functionality.
 *
 * Uses useSortable hook to enable drag-and-drop reordering of table columns.
 * Passes drag attributes and listeners to ResizableColumn for the drag handle.
 *
 * Exception: composeHooks pattern doesn't apply here because:
 * 1. useSortable returns refs (setNodeRef) and transform that must attach to the rendered DOM element
 * 2. useMemo for dragStyle depends on runtime transform values from useSortable
 * 3. useCallback handlers bind parent callbacks to this column's specific key — they are
 *    inherently coupled to the component identity, not extractable business logic
 */

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useCallback, useMemo } from 'react'
import type { ColumnApplyChanges } from '../ColumnFilterPopover/interfaces'
import { ResizableColumn } from '../ResizableColumn'
import type { ResizableColumnProps } from '../ResizableColumn'
import type { ColumnFilterConfig, ColumnFilterValue, SortDirection } from '../interfaces'

export type DraggableColumnProps = Omit<
  ResizableColumnProps,
  | 'isDraggable'
  | 'dragAttributes'
  | 'dragListeners'
  | 'setDragNodeRef'
  | 'dragStyle'
  | 'onSort'
  | 'onFilterChange'
  | 'onApplyChanges'
> & {
  /** Whether column reordering is enabled */
  enableReorder?: boolean
  /** Key of the column currently being dragged (for hiding original) */
  activeColumnKey?: string | null
  /** Filter configuration for this column */
  filterConfig?: ColumnFilterConfig
  /** Current filter value */
  filterValue?: ColumnFilterValue
  /** Sort key to use when calling onSort */
  sortKey?: string
  /** Parent-level sort callback (receives sortKey and optional direction) */
  onParentSort?: (key: string, direction?: SortDirection) => void
  /** Parent-level filter change callback (receives column key and value) */
  onParentFilterChange?: (key: string, value: ColumnFilterValue | undefined) => void
  /** Batched callback for column sort+filter changes (prevents race condition) */
  onParentApplyChanges?: (key: string, changes: ColumnApplyChanges) => void
}

export function DraggableColumn({
  columnKey,
  enableReorder = false,
  activeColumnKey = null,
  filterConfig,
  filterValue,
  sortKey,
  onParentSort,
  onParentFilterChange,
  onParentApplyChanges,
  ...restProps
}: DraggableColumnProps) {
  const { attributes, listeners, setNodeRef, transform } = useSortable({
    id: columnKey,
    disabled: !enableReorder,
  })

  // Determine if this column is the one being dragged.
  // We use activeColumnKey from parent instead of isDragging from useSortable
  // because when columns reorder, React may create new component instances
  // and useSortable's isDragging may not be set immediately.
  const isBeingDragged = activeColumnKey === columnKey

  // Inline style required for dynamic drag transform from dnd-kit.
  // Cannot use CSS Module because transform value is computed at runtime by useSortable hook.
  // Use opacity: 0 to hide the original column when dragging (DragOverlay shows the visual).
  // Note: prefers-reduced-motion is handled globally in globals.css via transition-duration override.
  const dragStyle: React.CSSProperties = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition: transform ? 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1)' : undefined,
      opacity: isBeingDragged ? 0 : 1,
    }),
    [transform, isBeingDragged]
  )

  // Create stable sort callback bound to this column's sortKey
  const handleSort = useCallback(
    (direction?: SortDirection) => {
      if (sortKey !== undefined && onParentSort) {
        onParentSort(sortKey, direction)
      }
    },
    [sortKey, onParentSort]
  )

  // Create stable filter callback bound to this column's key
  const handleFilterChange = useCallback(
    (value: ColumnFilterValue | undefined) => {
      onParentFilterChange?.(columnKey, value)
    },
    [columnKey, onParentFilterChange]
  )

  // Create stable batched callback bound to this column's key and sortKey
  const handleApplyChanges = useCallback(
    (changes: ColumnApplyChanges) => {
      onParentApplyChanges?.(columnKey, {
        ...changes,
        sortKey: sortKey === undefined ? columnKey : sortKey,
      })
    },
    [columnKey, sortKey, onParentApplyChanges]
  )

  return (
    <ResizableColumn
      columnKey={columnKey}
      {...restProps}
      isDraggable={enableReorder}
      dragAttributes={attributes}
      dragListeners={listeners}
      setDragNodeRef={setNodeRef}
      dragStyle={dragStyle}
      filterConfig={filterConfig}
      filterValue={filterValue}
      onSort={restProps.sortable && onParentSort ? handleSort : undefined}
      onFilterChange={onParentFilterChange ? handleFilterChange : undefined}
      onApplyChanges={onParentApplyChanges ? handleApplyChanges : undefined}
    />
  )
}
