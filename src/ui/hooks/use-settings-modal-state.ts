import { useCallback, useState } from 'react'

/**
 * Return type for useSettingsModalState hook.
 */
export type SettingsModalState<T> = {
  /** Currently selected item for editing (null when creating new) */
  selectedItem: T | null
  /** Whether the modal is open */
  isOpen: boolean
  /** Open modal in create mode (selectedItem = null) */
  onAdd: () => void
  /** Open modal in edit mode with the given item */
  onEdit: (item: T) => void
  /** Close modal and reset selection */
  onClose: () => void
}

/**
 * Hook for managing modal state in settings tabs.
 *
 * Encapsulates the common pattern of:
 * - Tracking selected item (null for create, item for edit)
 * - Managing modal open/close state
 * - Providing handlers for add, edit, and close actions
 *
 * @returns Object with modal state and handlers
 *
 * @example
 * ```tsx
 * const { selectedItem, isOpen, onAdd, onEdit, onClose } = useSettingsModalState<Tag>()
 *
 * // For creating new item
 * onAdd() // Opens modal with selectedItem = null
 *
 * // For editing existing item
 * onEdit(tag) // Opens modal with selectedItem = tag
 *
 * // For closing modal
 * onClose() // Closes modal and resets selectedItem to null
 * ```
 */
export function useSettingsModalState<T>(): SettingsModalState<T> {
  const [selectedItem, setSelectedItem] = useState<T | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const onAdd = useCallback(() => {
    setSelectedItem(null)
    setIsOpen(true)
  }, [])

  const onEdit = useCallback((item: T) => {
    setSelectedItem(item)
    setIsOpen(true)
  }, [])

  const onClose = useCallback(() => {
    setIsOpen(false)
    setSelectedItem(null)
  }, [])

  return {
    selectedItem,
    isOpen,
    onAdd,
    onEdit,
    onClose,
  }
}
