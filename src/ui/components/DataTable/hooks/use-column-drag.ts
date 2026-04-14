/**
 * Hook for managing column drag-and-drop reordering.
 *
 * Uses "controlled with internal state during interaction" pattern:
 * - During drag: uses local dragOrder state for smooth reordering
 * - When not dragging: uses columnOrder from props directly (single source of truth)
 *
 * This eliminates sync issues between local state and props.
 */

import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useCallback, useRef, useState } from 'react'

export type UseColumnDragInput = {
  /** Current column order (array of column keys) */
  columnOrder: string[]
  /** Callback when order changes */
  onColumnOrderChange: (order: string[]) => void
  /** Whether drag is enabled */
  enabled: boolean
}

export type UseColumnDragReturn = {
  /** DnD sensors configuration */
  sensors: ReturnType<typeof useSensors>
  /** Key of the column currently being dragged */
  activeColumnKey: string | null
  /** Column order for rendering - uses drag state during drag, props otherwise */
  localColumnOrder: string[]
  /** Handler for drag start */
  handleDragStart: (event: DragStartEvent) => void
  /** Handler for drag over (reorders in real-time) */
  handleDragOver: (event: DragOverEvent) => void
  /** Handler for drag end (persists order) */
  handleDragEnd: (event: DragEndEvent) => void
}

/**
 * Hook for column drag-and-drop reordering.
 *
 * Pattern: "Controlled with internal state during interaction"
 * - dragOrder is null when not dragging
 * - effectiveOrder = dragOrder ?? columnOrder
 * - This ensures we always use props when not dragging, avoiding sync issues
 */
export function useColumnDrag({
  columnOrder,
  onColumnOrderChange,
  enabled,
}: UseColumnDragInput): UseColumnDragReturn {
  // Configure sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Active drag state
  const [activeColumnKey, setActiveColumnKey] = useState<string | null>(null)

  // Local drag state - ONLY used during active drag
  // When null, we use columnOrder from props directly
  const [dragOrder, setDragOrder] = useState<string[] | null>(null)

  // Computed order: during drag use local state, otherwise use props
  // This is the key to avoiding sync issues!
  const effectiveOrder = dragOrder ?? columnOrder

  // Store original order at drag start for cancel detection
  const originalOrderRef = useRef<string[]>([])

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      if (!enabled) return

      const { active } = event
      setActiveColumnKey(active.id as string)

      // Capture current order from props (single source of truth)
      originalOrderRef.current = columnOrder
      // Initialize local drag state with current order
      setDragOrder([...columnOrder])
    },
    [enabled, columnOrder]
  )

  // Real-time reordering during drag
  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      if (!enabled) return

      const { active, over } = event
      if (!over) return

      const activeId = active.id as string
      const overId = over.id as string

      if (activeId === overId) return

      setDragOrder((prev) => {
        // Safety check: should always have dragOrder during drag
        if (!prev) return prev

        const activeIndex = prev.indexOf(activeId)
        const overIndex = prev.indexOf(overId)

        if (activeIndex === -1 || overIndex === -1) return prev
        if (activeIndex === overIndex) return prev

        return arrayMove(prev, activeIndex, overIndex)
      })
    },
    [enabled]
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (!enabled) return

      const { over } = event

      // Capture final order BEFORE clearing state
      const finalOrder = dragOrder

      // Reset UI state - this clears dragOrder so effectiveOrder will use props
      setActiveColumnKey(null)
      setDragOrder(null)

      if (!over || !finalOrder) {
        // Cancelled or invalid - no callback needed
        // effectiveOrder will automatically use columnOrder from props
        return
      }

      // Check if order actually changed (compare arrays by value)
      const orderChanged =
        finalOrder.length !== originalOrderRef.current.length ||
        finalOrder.some((key, idx) => originalOrderRef.current[idx] !== key)

      if (orderChanged) {
        // Persist the new order to parent
        // Parent will update columnOrder prop, which effectiveOrder will use
        onColumnOrderChange(finalOrder)
      }
    },
    [enabled, dragOrder, onColumnOrderChange]
  )

  return {
    sensors,
    activeColumnKey,
    localColumnOrder: effectiveOrder,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  }
}
