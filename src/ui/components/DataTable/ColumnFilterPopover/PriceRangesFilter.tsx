'use client'

import { NumberInput, Select, Stack, Text } from '@mantine/core'
import { composeHooks } from '@/ui/hooks/compose-hooks'
import type { PriceRangesFilterProps } from './interfaces'
import styles from './styles.module.css'
import type { PriceRangesFilterViewProps } from './usePriceRangesFilterProps'
import { usePriceRangesFilterProps } from './usePriceRangesFilterProps'

export function PriceRangesFilterView({
  selectedPlatform,
  filteredPriceTypes,
  rangeValue,
  platformOptions,
  filterInputTestId,
  selectPlatformPlaceholder,
  selectPlatformAriaLabel,
  minPlaceholder,
  maxPlaceholder,
  minPriceAriaLabel,
  maxPriceAriaLabel,
  onPlatformChange,
  onRangeChange,
  onDropdownOpen,
  onDropdownClose,
}: PriceRangesFilterViewProps) {
  return (
    <Stack gap="xs">
      <Select
        data-testid={filterInputTestId}
        size="xs"
        placeholder={selectPlatformPlaceholder}
        aria-label={selectPlatformAriaLabel}
        data={platformOptions}
        value={selectedPlatform}
        onChange={onPlatformChange}
        comboboxProps={{ withinPortal: true }}
        onDropdownOpen={onDropdownOpen}
        onDropdownClose={onDropdownClose}
      />

      {filteredPriceTypes.map((pt) => (
        <Stack key={pt.id} gap={4}>
          <Text size="xs" c="dimmed">
            {pt.name}
          </Text>
          <div className={styles.numberRangeGroup}>
            <NumberInput
              data-testid={`${filterInputTestId}-${pt.id}-min`}
              size="xs"
              placeholder={minPlaceholder}
              aria-label={minPriceAriaLabel}
              value={rangeValue[pt.id]?.min ?? ''}
              onChange={(val) => onRangeChange(pt.id, 'min', val)}
              min={0}
              className={styles.numberInput}
              hideControls
            />
            <NumberInput
              data-testid={`${filterInputTestId}-${pt.id}-max`}
              size="xs"
              placeholder={maxPlaceholder}
              aria-label={maxPriceAriaLabel}
              value={rangeValue[pt.id]?.max ?? ''}
              onChange={(val) => onRangeChange(pt.id, 'max', val)}
              min={0}
              className={styles.numberInput}
              hideControls
            />
          </div>
        </Stack>
      ))}
    </Stack>
  )
}

export const PriceRangesFilter = composeHooks<PriceRangesFilterViewProps, PriceRangesFilterProps>(
  PriceRangesFilterView
)(usePriceRangesFilterProps)
