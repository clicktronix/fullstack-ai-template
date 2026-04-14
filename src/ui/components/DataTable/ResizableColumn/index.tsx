'use client'

import { ActionIcon, Table, Group, Tooltip, Text } from '@mantine/core'
import { IconGripVertical } from '@tabler/icons-react'
import { composeHooks } from '@/ui/hooks/compose-hooks'
import { ColumnFilterPopover } from '../ColumnFilterPopover'
import styles from '../styles.module.css'
import type { ResizableColumnExternalProps, ResizableColumnViewProps } from './interfaces'
import { useResizableColumnProps } from './lib'

function ResizableColumnView({
  testId,
  filterTriggerTestId,
  filterInputTestId,
  label,
  sortable,
  isSorted,
  sortDirection,
  isDraggable,
  isResizing,
  widthStyle,
  dragTooltip,
  ariaSort,
  setDragNodeRef,
  dragAttributes,
  dragListeners,
  filterConfig,
  filterValue,
  onFilterChange,
  onApplyChanges,
  handleResizeStart,
  handleResizeKeyDown,
  resizeHandleAriaLabel,
  handleSortChange,
}: ResizableColumnViewProps) {
  const hasActiveHeaderState = isSorted || filterValue !== undefined

  return (
    <Table.Th
      scope="col"
      ref={setDragNodeRef}
      className={styles.resizableHeader}
      style={widthStyle}
      aria-sort={ariaSort}
      data-testid={testId}
    >
      <Group gap={4} wrap="nowrap" justify="space-between" className={styles.headerContent}>
        {/* Left: Label */}
        <Text component="span" size="sm" fw={500} className={styles.headerLabel}>
          {label}
        </Text>

        {/* Right: Actions */}
        <Group
          gap={2}
          wrap="nowrap"
          className={`${styles.headerActions} ${hasActiveHeaderState ? styles.headerActionsActive : ''}`}
        >
          {/* Filter/Sort button */}
          {(sortable || filterConfig) && (
            <ColumnFilterPopover
              sortable={sortable}
              sortDirection={isSorted ? sortDirection : undefined}
              onSortChange={handleSortChange}
              filterConfig={filterConfig}
              filterValue={filterValue}
              triggerTestId={filterTriggerTestId}
              filterInputTestId={filterInputTestId}
              onFilterChange={onFilterChange}
              onApplyChanges={onApplyChanges}
            />
          )}

          {/* Drag handle */}
          {isDraggable && (
            <Tooltip label={dragTooltip} position="top" withArrow openDelay={250}>
              <ActionIcon
                variant="subtle"
                size="sm"
                className={styles.dragHandle}
                {...dragAttributes}
                {...dragListeners}
                aria-label={dragTooltip}
              >
                <IconGripVertical size={16} aria-hidden="true" />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Group>

      {/* Resize handle */}
      <div
        className={`${styles.columnResizeHandle} ${isResizing ? styles.resizing : ''}`}
        onMouseDown={handleResizeStart}
        onKeyDown={handleResizeKeyDown}
        role="separator"
        tabIndex={0}
        aria-orientation="vertical"
        aria-label={resizeHandleAriaLabel}
      />
    </Table.Th>
  )
}

export type { ResizableColumnProps } from './interfaces'
export const ResizableColumn = composeHooks<ResizableColumnViewProps, ResizableColumnExternalProps>(
  ResizableColumnView
)(useResizableColumnProps)
