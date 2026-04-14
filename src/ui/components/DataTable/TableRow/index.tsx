'use client'

import { Loader, Table } from '@mantine/core'
import { memo } from 'react'
import { DataTableCell } from '../DataTableCell'
import { InlineEditInput } from '../InlineEditInput'
import { RowActionsCell } from '../RowActionsCell'
import styles from '../styles.module.css'
import type { TableRowProps } from './interfaces'
import type { TableRowViewProps } from './lib'
import { useTableRowProps } from './lib'

type TableDataCellProps<T extends Record<string, unknown>> = Pick<
  TableRowProps<T>,
  'cellEditing' | 'columnWidthsMap' | 'item' | 'itemKey' | 'onRowClick'
> & {
  col: TableRowProps<T>['visibleColumns'][number]
}

function joinCellClassName(classNameParts: Array<string | null>): string | undefined {
  const classNames = classNameParts.filter(Boolean) as string[]
  return classNames.length > 0 ? classNames.join(' ') : undefined
}

function getIsColumnEditable<T extends Record<string, unknown>>(
  col: TableRowProps<T>['visibleColumns'][number],
  item: T
): boolean {
  return typeof col.isEditable === 'function' ? col.isEditable(item) : (col.isEditable ?? true)
}

function getCellInteractionKind(canInlineEdit: boolean, canPopoverEdit: boolean) {
  if (canInlineEdit) return 'inline-edit'
  if (canPopoverEdit) return 'popover'
  return 'none'
}

function TableDataCell<T extends Record<string, unknown>>({
  cellEditing,
  col,
  columnWidthsMap,
  item,
  itemKey,
  onRowClick,
}: TableDataCellProps<T>) {
  const isEditableByConfig = getIsColumnEditable(col, item)
  const { width, minWidth: colMinWidth } = columnWidthsMap[col.key]
  const cellValue = String(item[col.key as keyof T] ?? '')
  const isInlineEditing = cellEditing.isCellEditing(itemKey, col.key)
  const canInlineEdit = !!(
    isEditableByConfig &&
    col.interactionKind === 'inline' &&
    cellEditing.onCellSave
  )
  const hasPopoverUi = col.interactionKind === 'popover'
  const canPopoverEdit = !!(isEditableByConfig && hasPopoverUi)
  const isEditable = canInlineEdit || canPopoverEdit
  const interactionKind = getCellInteractionKind(canInlineEdit, canPopoverEdit)

  const isSaving =
    cellEditing.savingCell?.rowKey === itemKey && cellEditing.savingCell?.columnKey === col.key

  const cellClassName = joinCellClassName([
    isEditable ? styles.interactiveCell : null,
    hasPopoverUi ? styles.popoverCell : null,
    isInlineEditing ? styles.editingCell : null,
    isSaving ? styles.savingCell : null,
  ])

  return (
    <DataTableCell
      key={col.key}
      width={width}
      minWidth={colMinWidth}
      className={cellClassName}
      data-testid={`cell-${col.key}`}
      isEditable={isEditable}
      interactionKind={interactionKind}
      blockDoubleClickPropagation={hasPopoverUi && !canPopoverEdit}
      onRowClick={onRowClick ? () => onRowClick(item) : undefined}
      shouldBlockRowClick={cellEditing.shouldBlockRowClick}
      onInlineEditStart={
        canInlineEdit
          ? () => cellEditing.handleCellDoubleClick(item, col.key, cellValue)
          : undefined
      }
    >
      {isInlineEditing ? (
        <InlineEditInput
          value={cellEditing.cellEditValue}
          onChange={cellEditing.handleCellValueChange}
          onBlur={cellEditing.handleCellBlur}
          onKeyDown={cellEditing.handleCellKeyDown}
        />
      ) : (
        col.render(item)
      )}
      {isSaving && <Loader size="xs" className={styles.savingCellLoader} />}
    </DataTableCell>
  )
}

/**
 * Pure View component for TableRow — no hooks.
 */
function TableRowView<T extends Record<string, unknown>>({
  item,
  itemKey,
  visibleColumns,
  columnWidthsMap,
  isSelected,
  onRowClick,
  onRowHover,
  cellEditing,
  actionsConfig,
  ariaLabels,
  rowClassName,
  handleKeyDown,
  tabIndex,
}: TableRowProps<T> & TableRowViewProps<T>) {
  return (
    <Table.Tr
      data-testid="table-row"
      data-row-key={String(itemKey)}
      className={rowClassName}
      tabIndex={tabIndex}
      onKeyDown={handleKeyDown}
      onMouseEnter={onRowHover ? () => onRowHover(item) : undefined}
      aria-selected={isSelected}
    >
      {/* Data cells */}
      {visibleColumns.map((col) => (
        <TableDataCell
          key={col.key}
          cellEditing={cellEditing}
          col={col}
          columnWidthsMap={columnWidthsMap}
          item={item}
          itemKey={itemKey}
          onRowClick={onRowClick}
        />
      ))}
      {/* Spacer cell */}
      <DataTableCell
        className={styles.spacerColumn}
        isEditable={false}
        interactionKind="none"
        onRowClick={onRowClick ? () => onRowClick(item) : undefined}
        shouldBlockRowClick={cellEditing.shouldBlockRowClick}
      >
        {null}
      </DataTableCell>
      {/* Actions cell */}
      {actionsConfig.hasActions && (
        <RowActionsCell item={item} actionsConfig={actionsConfig} ariaLabels={ariaLabels} />
      )}
    </Table.Tr>
  )
}

/**
 * Smart wrapper — вызывает хук и передаёт результаты в View.
 * Does not use composeHooks: generic <T> cannot be preserved through composeHooks.
 */
function TableRowInner<T extends Record<string, unknown>>(props: TableRowProps<T>) {
  const viewProps = useTableRowProps({
    item: props.item,
    isSelected: props.isSelected,
    onRowClick: props.onRowClick,
  })

  return <TableRowView {...props} {...viewProps} />
}

export const TableRow = memo(TableRowInner) as typeof TableRowInner
