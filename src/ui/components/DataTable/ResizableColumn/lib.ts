import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import type { SortDirection } from '../interfaces'
import messages from '../messages.json'
import type {
  ResizableColumnExternalProps,
  ResizableColumnHookReturn,
  ResizableColumnViewProps,
} from './interfaces'

export function useResizableColumnProps({
  columnKey,
  width,
  minWidth = 50,
  maxWidth = 500,
  sortable = false,
  isSorted = false,
  sortDirection = 'asc',
  onSort,
  onSortClear,
  onResizeEnd,
  isDraggable = false,
  dragStyle,
}: ResizableColumnViewProps & ResizableColumnExternalProps): ResizableColumnHookReturn {
  const intl = useIntl()
  const [currentWidth, setCurrentWidth] = useState(width)
  const [isResizing, setIsResizing] = useState(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)
  const currentWidthRef = useRef(width)
  // Track the last width we sent to parent to detect external changes
  const lastReportedWidthRef = useRef(width)

  // Sync with external width changes (e.g., reset settings).
  // Only sync if width changed externally, not as a result of our own resize.
  // useEffect is required here because the component is semi-controlled: it manages
  // local state during drag but accepts external width updates (e.g., settings reset).
  useEffect(() => {
    // If width changed and it's not the value we last reported, it's an external change
    if (width !== lastReportedWidthRef.current) {
      setCurrentWidth(width)
      currentWidthRef.current = width
      lastReportedWidthRef.current = width
    }
  }, [width])

  const clampWidth = useCallback(
    (w: number) => Math.min(maxWidth, Math.max(minWidth, w)),
    [minWidth, maxWidth]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const delta = e.clientX - startXRef.current
      const newWidth = clampWidth(startWidthRef.current + delta)
      setCurrentWidth(newWidth)
      currentWidthRef.current = newWidth
    },
    [clampWidth]
  )

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
    const finalWidth = currentWidthRef.current
    lastReportedWidthRef.current = finalWidth
    onResizeEnd(columnKey, finalWidth)
  }, [columnKey, onResizeEnd])

  useEffect(() => {
    if (!isResizing) return

    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseup', handleMouseUp, { passive: true })
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    startXRef.current = e.clientX
    startWidthRef.current = currentWidthRef.current
    setIsResizing(true)
  }, [])

  // Шаг изменения ширины при нажатии стрелок (px)
  const RESIZE_STEP = 10

  const handleResizeKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        e.stopPropagation()
        const delta = e.key === 'ArrowRight' ? RESIZE_STEP : -RESIZE_STEP
        const newWidth = clampWidth(currentWidthRef.current + delta)
        setCurrentWidth(newWidth)
        currentWidthRef.current = newWidth
        lastReportedWidthRef.current = newWidth
        onResizeEnd(columnKey, newWidth)
      }
    },
    [clampWidth, columnKey, onResizeEnd]
  )

  // Handle sort change from ColumnFilterPopover
  const handleSortChange = useCallback(
    (direction: SortDirection | undefined) => {
      if (direction === undefined) {
        onSortClear?.()
        return
      }
      onSort?.(direction)
    },
    [onSort, onSortClear]
  )

  // Inline style required for dynamic resizable column width.
  // Width is controlled by user drag-resize interaction and stored in currentWidth state.
  const widthStyle: React.CSSProperties = useMemo(
    () => ({
      width: currentWidth,
      minWidth: minWidth,
      ...dragStyle,
    }),
    [currentWidth, minWidth, dragStyle]
  )

  const dragTooltip = intl.formatMessage(messages.dragColumnLabel)
  const resizeHandleAriaLabel = intl.formatMessage(messages.resizeColumnLabel)
  const filterTriggerTestId = `column-filter-${columnKey}`
  const filterInputTestId = `column-filter-input-${columnKey}`

  const ariaSort: React.AriaAttributes['aria-sort'] = sortable
    ? isSorted
      ? sortDirection === 'desc'
        ? 'descending'
        : 'ascending'
      : 'none'
    : undefined

  return {
    filterTriggerTestId,
    filterInputTestId,
    isResizing,
    isDraggable,
    sortable,
    isSorted,
    sortDirection,
    widthStyle,
    dragTooltip,
    ariaSort,
    handleResizeStart,
    handleResizeKeyDown,
    resizeHandleAriaLabel,
    handleSortChange,
  }
}
