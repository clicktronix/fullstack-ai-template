import { useCallback, useMemo } from 'react'
import styles from '../styles.module.css'
import type { TableRowProps } from './interfaces'

export type TableRowViewProps<T extends Record<string, unknown>> = {
  rowClassName: string | undefined
  handleKeyDown: ((e: React.KeyboardEvent) => void) | undefined
  tabIndex: number | undefined
}

export function useTableRowProps<T extends Record<string, unknown>>({
  item,
  isSelected,
  onRowClick,
}: Pick<TableRowProps<T>, 'item' | 'isSelected' | 'onRowClick'>): TableRowViewProps<T> {
  const rowClassName = useMemo(() => {
    const parts = [onRowClick && styles.clickableRow, isSelected && styles.selectedRow].filter(
      Boolean
    )
    return parts.length > 0 ? parts.join(' ') : undefined
  }, [onRowClick, isSelected])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && onRowClick) {
        e.preventDefault()
        onRowClick(item)
      }
    },
    [item, onRowClick]
  )

  return {
    rowClassName,
    handleKeyDown: onRowClick ? handleKeyDown : undefined,
    tabIndex: onRowClick ? 0 : undefined,
  }
}
