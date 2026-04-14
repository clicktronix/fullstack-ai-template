'use client'

import { Table } from '@mantine/core'
import { memo } from 'react'
import { composeHooks } from '@/ui/hooks/compose-hooks'
import type { DataTableCellExternalProps, DataTableCellViewProps } from './interfaces'
import { useDataTableCellProps } from './lib'

function DataTableCellView({
  width,
  minWidth,
  className,
  'data-testid': dataTestId,
  children,
  blockDoubleClickPropagation = false,
  handleClick,
  handleMouseDown,
  handleDoubleClick,
  handleDoubleClickCapture,
}: DataTableCellViewProps) {
  return (
    <Table.Td
      w={width}
      miw={minWidth}
      className={className}
      data-testid={dataTestId}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onDoubleClickCapture={blockDoubleClickPropagation ? handleDoubleClickCapture : undefined}
      onDoubleClick={handleDoubleClick}
    >
      {children}
    </Table.Td>
  )
}

export type { DataTableCellProps } from './interfaces'
export const DataTableCell = memo(
  composeHooks<DataTableCellViewProps, DataTableCellExternalProps>(DataTableCellView)(
    useDataTableCellProps
  )
)
