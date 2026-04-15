'use client'

import { MultiSelect, NumberInput, Select, Stack, TextInput } from '@mantine/core'
import type { FilterInputProps, NumberRangeValue, SelectPairFilterValue } from './interfaces'
import styles from './styles.module.css'
import type { FilterInputViewProps } from './useFilterInputProps'
import { useFilterInputProps } from './useFilterInputProps'

const FILTER_DROPDOWN_MAX_HEIGHT = 280
const FILTER_COMBOBOX_PROPS = { withinPortal: true }

function FilterInputView({
  filterConfig,
  value,
  filterInputTestId,
  onDropdownOpen,
  onDropdownClose,
  minPlaceholder,
  maxPlaceholder,
  minValueAriaLabel,
  maxValueAriaLabel,
  searchFilterAriaLabel,
  onSelectChange,
  onMultiSelectChange,
  onNumberRangeChange,
  onSearchChange,
  onSelectPairChange,
}: FilterInputViewProps) {
  switch (filterConfig.type) {
    case 'select': {
      return (
        <Select
          data-testid={filterInputTestId}
          size="xs"
          placeholder={filterConfig.placeholder}
          data={filterConfig.options}
          searchable
          withScrollArea
          maxDropdownHeight={FILTER_DROPDOWN_MAX_HEIGHT}
          value={typeof value === 'string' ? value : null}
          onChange={onSelectChange}
          clearable
          comboboxProps={FILTER_COMBOBOX_PROPS}
          onDropdownOpen={onDropdownOpen}
          onDropdownClose={onDropdownClose}
        />
      )
    }

    case 'multi-select': {
      return (
        <MultiSelect
          data-testid={filterInputTestId}
          size="xs"
          placeholder={filterConfig.placeholder}
          data={filterConfig.options}
          searchable
          withScrollArea
          maxDropdownHeight={FILTER_DROPDOWN_MAX_HEIGHT}
          value={Array.isArray(value) ? value : []}
          onChange={onMultiSelectChange}
          clearable
          comboboxProps={FILTER_COMBOBOX_PROPS}
          onDropdownOpen={onDropdownOpen}
          onDropdownClose={onDropdownClose}
        />
      )
    }

    case 'select-pair': {
      const pairValue: SelectPairFilterValue = (value as SelectPairFilterValue | undefined) ?? {}

      return (
        <Stack gap="xs">
          <Select
            data-testid={`${filterInputTestId}-first`}
            size="xs"
            label={filterConfig.firstLabel}
            placeholder={filterConfig.firstPlaceholder}
            data={filterConfig.firstOptions}
            searchable
            withScrollArea
            maxDropdownHeight={FILTER_DROPDOWN_MAX_HEIGHT}
            value={pairValue.first ?? null}
            onChange={onSelectPairChange('first')}
            clearable
            comboboxProps={FILTER_COMBOBOX_PROPS}
            onDropdownOpen={onDropdownOpen}
            onDropdownClose={onDropdownClose}
          />
          <Select
            data-testid={`${filterInputTestId}-second`}
            size="xs"
            label={filterConfig.secondLabel}
            placeholder={filterConfig.secondPlaceholder}
            data={filterConfig.secondOptions}
            searchable
            withScrollArea
            maxDropdownHeight={FILTER_DROPDOWN_MAX_HEIGHT}
            value={pairValue.second ?? null}
            onChange={onSelectPairChange('second')}
            clearable
            comboboxProps={FILTER_COMBOBOX_PROPS}
            onDropdownOpen={onDropdownOpen}
            onDropdownClose={onDropdownClose}
          />
        </Stack>
      )
    }

    case 'number-range': {
      // Safe: filterConfig.type === 'number-range' guarantees NumberRangeValue shape
      const rangeValue = (value as NumberRangeValue) ?? {}
      return (
        <div className={styles.numberRangeGroup}>
          <NumberInput
            data-testid={`${filterInputTestId}-min`}
            size="xs"
            placeholder={minPlaceholder}
            aria-label={minValueAriaLabel}
            value={rangeValue.min ?? ''}
            onChange={onNumberRangeChange('min', rangeValue)}
            min={filterConfig.min}
            max={filterConfig.max}
            step={filterConfig.step}
            allowDecimal={filterConfig.allowDecimal ?? false}
            className={styles.numberInput}
          />
          <NumberInput
            data-testid={`${filterInputTestId}-max`}
            size="xs"
            placeholder={maxPlaceholder}
            aria-label={maxValueAriaLabel}
            value={rangeValue.max ?? ''}
            onChange={onNumberRangeChange('max', rangeValue)}
            min={filterConfig.min}
            max={filterConfig.max}
            step={filterConfig.step}
            allowDecimal={filterConfig.allowDecimal ?? false}
            className={styles.numberInput}
          />
        </div>
      )
    }

    case 'search': {
      return (
        <TextInput
          data-testid={filterInputTestId}
          size="xs"
          placeholder={filterConfig.placeholder}
          aria-label={searchFilterAriaLabel}
          value={typeof value === 'string' ? value : ''}
          onChange={onSearchChange}
        />
      )
    }

    default: {
      return null
    }
  }
}

// Does not use composeHooks: internal DataTable subcomponent with simple hook delegation.
export function FilterInput(props: FilterInputProps) {
  const viewProps = useFilterInputProps(props)
  return <FilterInputView {...viewProps} />
}
