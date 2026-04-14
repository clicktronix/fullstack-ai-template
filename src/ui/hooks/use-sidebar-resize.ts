'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { loadFromStorage, saveToStorage } from '@/lib/storage'

type ResizeDirection = 'left' | 'right'

type UseSidebarResizeOptions = {
  minWidth?: number
  maxWidth?: number
  defaultWidth?: number
  storageKey: string
  /**
   * Direction from which the panel is resized.
   * - 'left': dragging left increases width (sidebar on the right edge)
   * - 'right': dragging right increases width (panel on the left edge)
   * @default 'left'
   */
  direction?: ResizeDirection
}

/**
 * Hook for resizable sidebar functionality.
 * Persists width to localStorage.
 */
export function useSidebarResize(options: UseSidebarResizeOptions) {
  const {
    minWidth = 300,
    maxWidth = 600,
    defaultWidth = 400,
    storageKey,
    direction = 'left',
  } = options

  // Lazy state initializer reads localStorage synchronously to avoid hydration flicker
  const [width, setWidth] = useState(() =>
    loadFromStorage({
      key: storageKey,
      defaultValue: defaultWidth,
      validate: (value): value is number =>
        typeof value === 'number' && !Number.isNaN(value) && value >= minWidth && value <= maxWidth,
    })
  )

  const [isResizing, setIsResizing] = useState(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)
  const currentWidthRef = useRef(width)

  // Sync ref with state
  useEffect(() => {
    currentWidthRef.current = width
  }, [width])

  const clampWidth = useCallback(
    (w: number) => Math.min(maxWidth, Math.max(minWidth, w)),
    [minWidth, maxWidth]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      // 'left' direction: dragging left increases width (panel anchored on right)
      // 'right' direction: dragging right increases width (panel anchored on left)
      const delta =
        direction === 'left' ? startXRef.current - e.clientX : e.clientX - startXRef.current
      const newWidth = clampWidth(startWidthRef.current + delta)
      setWidth(newWidth)
      currentWidthRef.current = newWidth
    },
    [clampWidth, direction]
  )

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
    saveToStorage(storageKey, currentWidthRef.current)
  }, [storageKey])

  useEffect(() => {
    if (!isResizing) return

    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('mouseup', handleMouseUp, { passive: true })
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'ew-resize'

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

  const handleResizeKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const step = e.shiftKey ? 50 : 10
      // For 'left' direction: ArrowLeft increases, ArrowRight decreases
      // For 'right' direction: ArrowRight increases, ArrowLeft decreases
      const increaseKey = direction === 'left' ? 'ArrowLeft' : 'ArrowRight'
      const decreaseKey = direction === 'left' ? 'ArrowRight' : 'ArrowLeft'

      if (e.key === increaseKey) {
        e.preventDefault()
        const newWidth = clampWidth(currentWidthRef.current + step)
        setWidth(newWidth)
        saveToStorage(storageKey, newWidth)
      }
      if (e.key === decreaseKey) {
        e.preventDefault()
        const newWidth = clampWidth(currentWidthRef.current - step)
        setWidth(newWidth)
        saveToStorage(storageKey, newWidth)
      }
    },
    [clampWidth, storageKey, direction]
  )

  return {
    width,
    isResizing,
    handleResizeStart,
    handleResizeKeyDown,
  }
}
