import { useCallback } from 'react'
import type { RowActionsCellProps } from './interfaces'

export type RowActionsCellViewProps<T> = {
  handleMenuTargetClick: (e: React.MouseEvent) => void
  handleEditClick: ((e: React.MouseEvent) => void) | undefined
  handleDeleteClick: ((e: React.MouseEvent) => void) | undefined
  createActionClickHandler: (action: {
    onClick: (item: T) => void
  }) => (e: React.MouseEvent) => void
}

export function useRowActionsCellProps<T>({
  item,
  actionsConfig,
}: RowActionsCellProps<T>): RowActionsCellViewProps<T> {
  const { onEdit, onDelete } = actionsConfig

  const handleMenuTargetClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  const handleEditClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onEdit?.(item)
    },
    [item, onEdit]
  )

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onDelete?.(item)
    },
    [item, onDelete]
  )

  const createActionClickHandler = useCallback(
    (action: { onClick: (item: T) => void }) => (e: React.MouseEvent) => {
      e.stopPropagation()
      action.onClick(item)
    },
    [item]
  )

  return {
    handleMenuTargetClick,
    handleEditClick: onEdit ? handleEditClick : undefined,
    handleDeleteClick: onDelete ? handleDeleteClick : undefined,
    createActionClickHandler,
  }
}
