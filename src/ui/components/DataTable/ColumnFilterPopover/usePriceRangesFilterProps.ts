import { useCallback, useMemo } from 'react'
import { useIntl } from 'react-intl'
import type { PriceTypeOption } from '../interfaces'
import type { PriceRangesFilterProps } from './interfaces'
import messages from './messages.json'

const EMPTY_RANGES: Record<string, { min?: number; max?: number }> = {}

export type PriceRangesFilterViewProps = {
  selectedPlatform: string | null
  filteredPriceTypes: PriceTypeOption[]
  rangeValue: Record<string, { min?: number; max?: number }>
  platformOptions: Array<{ value: string; label: string }>
  filterInputTestId?: string
  selectPlatformPlaceholder: string
  selectPlatformAriaLabel: string
  minPlaceholder: string
  maxPlaceholder: string
  minPriceAriaLabel: string
  maxPriceAriaLabel: string
  onPlatformChange: (platform: string | null) => void
  onRangeChange: (priceTypeId: string, field: 'min' | 'max', val: number | string) => void
  onDropdownOpen: () => void
  onDropdownClose: () => void
}

export function usePriceRangesFilterProps(
  props: PriceRangesFilterProps
): PriceRangesFilterViewProps {
  const { priceTypeOptions, platformOptions, value, onChange, onDropdownOpen, onDropdownClose } =
    props
  const { formatMessage } = useIntl()

  const selectedPlatform = value?.platform ?? null

  const filteredPriceTypes = useMemo(() => {
    if (!selectedPlatform) return []
    return priceTypeOptions.filter(
      (pt) => pt.platforms === null || pt.platforms.includes(selectedPlatform)
    )
  }, [priceTypeOptions, selectedPlatform])

  const rangeValue = useMemo(() => value?.ranges ?? EMPTY_RANGES, [value?.ranges])

  const onPlatformChange = useCallback(
    (platform: string | null) => {
      onChange(platform ? { platform, ranges: {} } : undefined)
    },
    [onChange]
  )

  const onRangeChange = useCallback(
    (priceTypeId: string, field: 'min' | 'max', val: number | string) => {
      const numVal = typeof val === 'number' ? val : undefined
      const currentRange = rangeValue[priceTypeId] ?? {}
      const newRange = { ...currentRange, [field]: numVal }

      const isEmpty = newRange.min === undefined && newRange.max === undefined
      if (!selectedPlatform) return

      const newRanges = { ...rangeValue }
      if (isEmpty) {
        delete newRanges[priceTypeId]
      } else {
        newRanges[priceTypeId] = newRange
      }
      onChange({ platform: selectedPlatform, ranges: newRanges })
    },
    [rangeValue, selectedPlatform, onChange]
  )

  return {
    selectedPlatform,
    filteredPriceTypes,
    rangeValue,
    platformOptions,
    filterInputTestId: props.filterInputTestId,
    selectPlatformPlaceholder: formatMessage(messages.selectPlatform),
    selectPlatformAriaLabel: formatMessage(messages.selectPlatform),
    minPlaceholder: formatMessage(messages.minPlaceholder),
    maxPlaceholder: formatMessage(messages.maxPlaceholder),
    minPriceAriaLabel: formatMessage(messages.minPriceLabel),
    maxPriceAriaLabel: formatMessage(messages.maxPriceLabel),
    onPlatformChange,
    onRangeChange,
    onDropdownOpen,
    onDropdownClose,
  }
}
