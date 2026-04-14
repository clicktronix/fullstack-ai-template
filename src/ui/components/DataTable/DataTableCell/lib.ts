import { type MouseEvent, useCallback, useEffect, useRef } from 'react'
import type {
  DataTableCellExternalProps,
  DataTableCellHookReturn,
  DataTableCellViewProps,
} from './interfaces'

// Задержка перед row click — даёт время отменить при double-click для inline edit
const DOUBLE_CLICK_DELAY_MS = 300

export function useDataTableCellProps({
  isEditable,
  interactionKind,
  onRowClick,
  shouldBlockRowClick,
  onInlineEditStart,
}: DataTableCellViewProps & DataTableCellExternalProps): DataTableCellHookReturn {
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current)
        clickTimerRef.current = null
      }
    }
  }, [])

  const clearClickTimer = useCallback(() => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current)
      clickTimerRef.current = null
    }
  }, [])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!onRowClick) return
      if (shouldBlockRowClick()) return

      // If this cell has a double-click edit action, delay row click so we can cancel on dblclick.
      if (isEditable) {
        // Do not schedule on the second click of a double click.
        if (e.detail !== 1) return

        clearClickTimer()
        clickTimerRef.current = setTimeout(() => {
          clickTimerRef.current = null
          if (shouldBlockRowClick()) return
          onRowClick()
        }, DOUBLE_CLICK_DELAY_MS)
        return
      }

      onRowClick()
    },
    [onRowClick, shouldBlockRowClick, isEditable, clearClickTimer]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Предотвращаем выделение текста при double-click на редактируемых ячейках
      if (isEditable && e.detail === 2) {
        e.preventDefault()
      }
    },
    [isEditable]
  )

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isEditable) return

      // Always cancel pending row click when user double-clicks.
      clearClickTimer()

      if (interactionKind === 'inline-edit') {
        // For inline editing we must prevent row selection from bubbling.
        e.stopPropagation()
        onInlineEditStart?.()
      }
      // For popover cells, we intentionally do NOT stop propagation here.
      // The popover component can listen to onDoubleClick itself (EditPopover trigger),
      // while we only take care of cancelling the pending row click.
    },
    [clearClickTimer, interactionKind, isEditable, onInlineEditStart]
  )

  const handleDoubleClickCapture = useCallback((e: MouseEvent) => {
    e.stopPropagation()
  }, [])

  return {
    handleClick,
    handleMouseDown,
    handleDoubleClick,
    handleDoubleClickCapture,
  }
}
