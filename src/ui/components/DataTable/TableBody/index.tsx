'use client'

import { Table } from '@mantine/core'
import { memo } from 'react'
import { LoadingSkeleton } from '../LoadingSkeleton'
import { TableRow } from '../TableRow'
import styles from '../styles.module.css'
import type { TableBodyProps } from './interfaces'

/**
 * TableBody component for DataTable.
 * Handles three states: loading, empty, and data rendering.
 *
 * @template T - Type of the data items
 */
function TableBodyInner<T extends Record<string, unknown>>({
  data,
  keyExtractor,
  visibleColumns,
  columnWidthsMap,
  totalColumns,
  emptyMessage,
  isPending,
  skeletonRows,
  selectedKey,
  onRowClick,
  onRowHover,
  cellEditing,
  actionsConfig,
  ariaLabels,
}: TableBodyProps<T>) {
  // Loading state
  if (isPending) {
    return (
      <Table.Tbody role="status" aria-live="polite">
        <LoadingSkeleton rows={skeletonRows} columns={totalColumns} />
      </Table.Tbody>
    )
  }

  // Empty state
  if (data.length === 0) {
    return (
      <Table.Tbody>
        <Table.Tr>
          <Table.Td colSpan={totalColumns} className={styles.center}>
            {emptyMessage}
          </Table.Td>
        </Table.Tr>
      </Table.Tbody>
    )
  }

  // Data rows
  return (
    <Table.Tbody>
      {data.map((item) => {
        const itemKey = keyExtractor(item)
        const isSelected = selectedKey === itemKey

        return (
          <TableRow
            key={itemKey}
            item={item}
            itemKey={itemKey}
            visibleColumns={visibleColumns}
            columnWidthsMap={columnWidthsMap}
            isSelected={isSelected}
            onRowClick={onRowClick}
            onRowHover={onRowHover}
            cellEditing={cellEditing}
            actionsConfig={actionsConfig}
            ariaLabels={ariaLabels}
          />
        )
      })}
    </Table.Tbody>
  )
}

export const TableBody = memo(TableBodyInner) as typeof TableBodyInner
