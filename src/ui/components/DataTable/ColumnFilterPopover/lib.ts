import { useDisclosure } from '@mantine/hooks'
import type React from 'react'
import { useCallback, useState } from 'react'
import { useIntl } from 'react-intl'
import type { ColumnFilterValue } from '../interfaces'
import type {
  ColumnFilterPopoverProps,
  ColumnFilterPopoverViewProps,
  SortSegmentValue,
} from './interfaces'
import messages from './messages.json'

export function useColumnFilterPopoverProps({
  sortable,
  sortDirection,
  onSortChange,
  filterConfig,
  filterValue,
  triggerTestId,
  filterInputTestId,
  onFilterChange,
  onApplyChanges,
}: ColumnFilterPopoverProps): ColumnFilterPopoverViewProps {
  const { formatMessage } = useIntl()
  const [opened, { open, close }] = useDisclosure(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const [localSortDirection, setLocalSortDirection] = useState<SortSegmentValue>(
    sortDirection ?? 'none'
  )
  const [localFilterValue, setLocalFilterValue] = useState<ColumnFilterValue | undefined>(
    filterValue
  )

  const handleOpen = useCallback(() => {
    setLocalSortDirection(sortDirection ?? 'none')
    setLocalFilterValue(filterValue)
    open()
  }, [sortDirection, filterValue, open])

  const handleReset = useCallback(() => {
    if (onApplyChanges) {
      onApplyChanges({ clearSort: true, clearFilter: true })
    } else {
      onSortChange?.()
      onFilterChange?.()
    }
    setLocalSortDirection('none')
    setLocalFilterValue(undefined)
    close()
  }, [onApplyChanges, onSortChange, onFilterChange, close])

  const handleApply = useCallback(() => {
    const newDirection = localSortDirection === 'none' ? undefined : localSortDirection

    if (onApplyChanges) {
      onApplyChanges({
        sort: newDirection,
        filter: localFilterValue,
        clearSort: newDirection === undefined,
        clearFilter: localFilterValue === undefined,
      })
    } else {
      if (onSortChange) onSortChange(newDirection)
      if (onFilterChange) onFilterChange(localFilterValue)
    }
    close()
  }, [localSortDirection, localFilterValue, onApplyChanges, onSortChange, onFilterChange, close])

  const isActive = sortDirection !== undefined || filterValue !== undefined

  const handleDropdownOpen = useCallback(() => setIsDropdownOpen(true), [])
  const handleDropdownClose = useCallback(() => setIsDropdownOpen(false), [])

  const filterAriaLabel = formatMessage(messages.filter)

  const handlePopoverChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen) {
        handleOpen()
      } else {
        close()
      }
    },
    [handleOpen, close]
  )

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (opened) {
        close()
      } else {
        handleOpen()
      }
    },
    [opened, close, handleOpen]
  )

  return {
    opened,
    isActive,
    isDropdownOpen,
    localSortDirection,
    localFilterValue,
    sortable,
    filterConfig,
    filterAriaLabel,
    triggerTestId,
    filterInputTestId,
    onLocalSortChange: setLocalSortDirection,
    onLocalFilterChange: setLocalFilterValue,
    onDropdownOpen: handleDropdownOpen,
    onDropdownClose: handleDropdownClose,
    onOpen: handleOpen,
    onClose: close,
    onPopoverChange: handlePopoverChange,
    onToggle: handleToggle,
    onReset: handleReset,
    onApply: handleApply,
  }
}
