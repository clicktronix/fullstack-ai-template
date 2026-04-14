import { useCallback, useEffect, useRef } from 'react'

// Задержка после закрытия редактора — блокирует row click чтобы blur не вызвал навигацию
const EDIT_END_DELAY_MS = 200

/**
 * Unified tracker for cell editing state (both inline and popover).
 * Uses a ref so the value is always current when checked synchronously
 * from click handlers that race with blur events.
 */
export function useCellEditingTracker() {
  const editActiveRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const onCellEditStart = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    editActiveRef.current = true
  }, [])

  const onCellEditEnd = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    timerRef.current = setTimeout(() => {
      editActiveRef.current = false
      timerRef.current = null
    }, EDIT_END_DELAY_MS)
  }, [])

  const shouldBlockRowClick = useCallback(() => {
    return editActiveRef.current
  }, [])

  return { onCellEditStart, onCellEditEnd, shouldBlockRowClick }
}
