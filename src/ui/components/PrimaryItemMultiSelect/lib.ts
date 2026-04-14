import { useCallback, useMemo } from 'react'
import { useIntl } from 'react-intl'
import type {
  PrimaryItemMultiSelectProps,
  PrimaryItemMultiSelectViewProps,
  PrimarySelectOption,
  SelectedItemWithPrimary,
} from './interfaces'
import messages from './messages.json'

export function usePrimaryItemMultiSelectProps({
  items,
  selectedIds,
  primaryId,
  onSelectionChange,
  onPrimaryChange,
  label,
  placeholder,
  disabled = false,
  searchable = true,
  clearable = true,
}: PrimaryItemMultiSelectProps): PrimaryItemMultiSelectViewProps {
  const intl = useIntl()

  const options: PrimarySelectOption[] = useMemo(
    () => items.map((item) => ({ value: item.id, label: item.name })),
    [items]
  )

  const handleSelectionChange = useCallback(
    (newIds: string[]) => {
      onSelectionChange(newIds)
      // If primary was removed from selection, reset it
      if (primaryId && !newIds.includes(primaryId)) {
        onPrimaryChange(newIds[0] ?? null)
      }
    },
    [onSelectionChange, onPrimaryChange, primaryId]
  )

  const handlePrimaryToggle = useCallback(
    (id: string) => {
      onPrimaryChange(primaryId === id ? null : id)
    },
    [onPrimaryChange, primaryId]
  )

  const createPrimaryToggleHandler = useCallback(
    (id: string) => () => handlePrimaryToggle(id),
    [handlePrimaryToggle]
  )

  const selectedItems: SelectedItemWithPrimary[] = useMemo(() => {
    const selectedIdSet = new Set(selectedIds)
    return items
      .filter((item) => selectedIdSet.has(item.id))
      .map((item) => ({
        ...item,
        isPrimary: primaryId === item.id,
      }))
  }, [items, selectedIds, primaryId])

  const setPrimaryTooltip = intl.formatMessage(messages.setPrimary)
  const togglePrimaryAriaLabel = intl.formatMessage(messages.togglePrimaryAriaLabel)

  return {
    options,
    selectedIds,
    selectedItems,
    label,
    placeholder,
    disabled,
    searchable,
    clearable,
    setPrimaryTooltip,
    togglePrimaryAriaLabel,
    onSelectionChange: handleSelectionChange,
    createPrimaryToggleHandler,
  }
}
