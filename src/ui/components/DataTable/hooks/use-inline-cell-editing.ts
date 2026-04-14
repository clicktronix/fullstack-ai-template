import { useCallback, useRef, useState } from 'react'
import type { EditingCell } from '../interfaces'

export type UseInlineCellEditingInput<T extends Record<string, unknown>> = {
  keyExtractor: (item: T) => string | number
  onCellSave?: (item: T, columnKey: string, value: string) => void
  onCellEditStart: () => void
  onCellEditEnd: () => void
}

export type UseInlineCellEditingReturn<T> = {
  editingCell: EditingCell
  cellEditValue: string
  handleCellDoubleClick: (item: T, columnKey: string, currentValue: string) => void
  handleCellBlur: () => void
  handleCellKeyDown: (e: React.KeyboardEvent) => void
  handleCellValueChange: (value: string) => void
  isCellEditing: (rowKey: string | number, columnKey: string) => boolean
}

export function useInlineCellEditing<T extends Record<string, unknown>>({
  keyExtractor,
  onCellSave,
  onCellEditStart,
  onCellEditEnd,
}: UseInlineCellEditingInput<T>): UseInlineCellEditingReturn<T> {
  const [editingCell, setEditingCell] = useState<EditingCell>(null)
  const [cellEditValue, setCellEditValue] = useState('')
  const cellEditValueRef = useRef('')
  const editingItemRef = useRef<T | null>(null)
  const editingCellRef = useRef<EditingCell>(null)

  const handleCellDoubleClick = useCallback(
    (item: T, columnKey: string, currentValue: string) => {
      if (!onCellSave) return
      const rowKey = keyExtractor(item)
      const newEditingCell = { rowKey, columnKey }
      setEditingCell(newEditingCell)
      editingCellRef.current = newEditingCell
      setCellEditValue(currentValue)
      cellEditValueRef.current = currentValue
      editingItemRef.current = item
      onCellEditStart()
    },
    [keyExtractor, onCellSave, onCellEditStart]
  )

  const resetEditingState = useCallback(() => {
    setEditingCell(null)
    editingCellRef.current = null
    setCellEditValue('')
    cellEditValueRef.current = ''
    editingItemRef.current = null
    onCellEditEnd()
  }, [onCellEditEnd])

  const handleCellBlur = useCallback(() => {
    if (!editingCellRef.current || !editingItemRef.current || !onCellSave) return
    onCellSave(editingItemRef.current, editingCellRef.current.columnKey, cellEditValueRef.current)
    resetEditingState()
  }, [onCellSave, resetEditingState])

  const handleCellKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleCellBlur()
      } else if (e.key === 'Escape') {
        resetEditingState()
      }
    },
    [handleCellBlur, resetEditingState]
  )

  const handleCellValueChange = useCallback((value: string) => {
    setCellEditValue(value)
    cellEditValueRef.current = value
  }, [])

  const isCellEditing = useCallback(
    (rowKey: string | number, columnKey: string) => {
      return editingCell?.rowKey === rowKey && editingCell?.columnKey === columnKey
    },
    [editingCell]
  )

  return {
    editingCell,
    cellEditValue,
    handleCellDoubleClick,
    handleCellBlur,
    handleCellKeyDown,
    handleCellValueChange,
    isCellEditing,
  }
}
