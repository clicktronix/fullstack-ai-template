import { Skeleton, Stack } from '@mantine/core'
import { composeHooks } from '@/ui/hooks/compose-hooks'
import { useTableSkeletonProps } from './lib'

export type TableSkeletonProps = {
  /** Количество строк скелетона (default: 5) */
  rowCount?: number
  /** Высота каждой строки в пикселях (default: 40) */
  rowHeight?: number
}

export type TableSkeletonViewProps = {
  /** Количество строк скелетона */
  rowCount: number
  /** Высота каждой строки в пикселях */
  rowHeight: number
  /** Aria-label для индикации загрузки */
  ariaLabel: string
}

/**
 * TableSkeletonView - Компонент загрузки для таблиц.
 *
 * Отображает несколько строк Skeleton для индикации загрузки данных таблицы.
 */
export function TableSkeletonView({ rowCount, rowHeight, ariaLabel }: TableSkeletonViewProps) {
  return (
    <Stack gap="sm" role="status" aria-busy="true" aria-label={ariaLabel}>
      {Array.from({ length: rowCount }).map((_, index) => (
        <Skeleton key={index} height={rowHeight} />
      ))}
    </Stack>
  )
}

export const TableSkeleton = composeHooks<TableSkeletonViewProps, TableSkeletonProps>(
  TableSkeletonView
)(useTableSkeletonProps)
