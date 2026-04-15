import type React from 'react'
import type {
  ColumnFilterConfig,
  ColumnFilterValue,
  SelectPairValue,
  SortDirection,
} from '../interfaces'

export type ColumnApplyChanges = {
  sort?: SortDirection
  filter?: ColumnFilterValue
  clearSort?: boolean
  clearFilter?: boolean
  /** Sort key override (when sortKey differs from column key) */
  sortKey?: string
}

export type ColumnFilterPopoverProps = {
  sortable?: boolean
  sortDirection?: SortDirection
  onSortChange?: (direction?: SortDirection) => void
  filterConfig?: ColumnFilterConfig
  filterValue?: ColumnFilterValue
  triggerTestId?: string
  filterInputTestId?: string
  onFilterChange?: (value?: ColumnFilterValue) => void
  /** Batched callback: applies both sort and filter changes in one URL update */
  onApplyChanges?: (changes: ColumnApplyChanges) => void
}

export type ColumnFilterPopoverViewProps = {
  opened: boolean
  isActive: boolean
  isDropdownOpen: boolean
  localSortDirection: SortSegmentValue
  localFilterValue: ColumnFilterValue | undefined
  sortable?: boolean
  filterConfig?: ColumnFilterConfig
  filterAriaLabel: string
  triggerTestId?: string
  filterInputTestId?: string
  onLocalSortChange: (value: SortSegmentValue) => void
  onLocalFilterChange: (value: ColumnFilterValue | undefined) => void
  onDropdownOpen: () => void
  onDropdownClose: () => void
  onOpen: () => void
  onClose: () => void
  onPopoverChange: (isOpen: boolean) => void
  onToggle: (e: React.MouseEvent) => void
  onReset: () => void
  onApply: () => void
}

export type FilterInputProps = {
  filterConfig: NonNullable<ColumnFilterPopoverProps['filterConfig']>
  value: ColumnFilterValue | undefined
  filterInputTestId?: string
  onChange: (value?: ColumnFilterValue) => void
  onDropdownOpen: () => void
  onDropdownClose: () => void
}

export type NumberRangeValue = {
  min?: number
  max?: number
}

export type SelectPairFilterValue = SelectPairValue

export type SortSegmentValue = 'asc' | 'desc' | 'none'
