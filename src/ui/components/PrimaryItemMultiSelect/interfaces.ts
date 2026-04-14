import type { MultiSelectProps } from '@mantine/core'

/**
 * Base item type for PrimaryItemMultiSelect
 */
export type PrimarySelectItem = {
  id: string
  name: string
  color?: string | null
}

/**
 * Select option for MultiSelect data prop
 */
export type PrimarySelectOption = {
  value: string
  label: string
}

/**
 * Selected item with primary status flag
 */
export type SelectedItemWithPrimary = PrimarySelectItem & {
  isPrimary: boolean
}

/**
 * External props (passed by consumer)
 */
export type PrimaryItemMultiSelectProps = {
  items: PrimarySelectItem[]
  selectedIds: string[]
  primaryId: string | null
  onSelectionChange: (ids: string[]) => void
  onPrimaryChange: (id: string | null) => void
  label?: MultiSelectProps['label']
  placeholder?: string
  disabled?: boolean
  searchable?: boolean
  clearable?: boolean
}

/**
 * View props (what the pure View component receives)
 */
export type PrimaryItemMultiSelectViewProps = {
  options: PrimarySelectOption[]
  selectedIds: string[]
  selectedItems: SelectedItemWithPrimary[]
  label?: MultiSelectProps['label']
  placeholder?: string
  disabled: boolean
  searchable: boolean
  clearable: boolean
  setPrimaryTooltip: string
  togglePrimaryAriaLabel: string
  onSelectionChange: (ids: string[]) => void
  createPrimaryToggleHandler: (id: string) => () => void
}
