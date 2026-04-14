import { useCallback } from 'react'
import { useIntl } from 'react-intl'
import type { ColumnFilterValue, GenderRangeValue } from '../interfaces'
import type { FilterInputProps, NumberRangeValue, SelectPairFilterValue } from './interfaces'
import messages from './messages.json'

export type FilterInputViewProps = FilterInputProps & {
  minPlaceholder: string
  maxPlaceholder: string
  minValueAriaLabel: string
  maxValueAriaLabel: string
  searchFilterAriaLabel: string
  onSelectChange: (val: string | null) => void
  onMultiSelectChange: (val: string[]) => void
  onNumberRangeChange: (
    field: 'min' | 'max',
    rangeValue: NumberRangeValue
  ) => (val: string | number) => void
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPriceRangesChange: (val: ColumnFilterValue | undefined) => void
  onSelectPairChange: (field: 'first' | 'second') => (val: string | null) => void
  onGenderSelectChange: (val: string | null) => void
  onGenderMinChange: (val: string | number) => void
  onGenderMaxChange: (val: string | number) => void
}

export function useFilterInputProps(props: FilterInputProps): FilterInputViewProps {
  const { formatMessage } = useIntl()
  const { onChange, value } = props

  const onSelectChange = useCallback((val: string | null) => onChange(val ?? undefined), [onChange])

  const onMultiSelectChange = useCallback(
    (val: string[]) => onChange(val.length > 0 ? val : undefined),
    [onChange]
  )

  const onNumberRangeChange = useCallback(
    (field: 'min' | 'max', rangeValue: NumberRangeValue) => (val: string | number) => {
      const numericVal = typeof val === 'number' ? val : undefined
      const newValue: NumberRangeValue = { ...rangeValue, [field]: numericVal }
      const isEmpty = newValue.min === undefined && newValue.max === undefined
      onChange(isEmpty ? undefined : newValue)
    },
    [onChange]
  )

  const onSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.currentTarget.value || undefined),
    [onChange]
  )

  const onPriceRangesChange = useCallback(
    (val: ColumnFilterValue | undefined) => onChange(val),
    [onChange]
  )

  const onSelectPairChange = useCallback(
    (field: 'first' | 'second') => (val: string | null) => {
      const pairValue: SelectPairFilterValue = (value as SelectPairFilterValue | undefined) ?? {}
      const nextValue: SelectPairFilterValue = {
        ...pairValue,
        [field]: val || undefined,
      }

      if (!nextValue.first && !nextValue.second) {
        onChange()
        return
      }

      onChange(nextValue)
    },
    [onChange, value]
  )

  const onGenderSelectChange = useCallback(
    (val: string | null) => {
      if (!val) {
        onChange(undefined) // eslint-disable-line unicorn/no-useless-undefined
        return
      }
      const gv = (value as GenderRangeValue | undefined) ?? ({} as Partial<GenderRangeValue>)
      onChange({ gender: val, min: gv.min, max: gv.max })
    },
    [onChange, value]
  )

  const onGenderMinChange = useCallback(
    (val: string | number) => {
      const gv = (value as GenderRangeValue | undefined) ?? ({} as Partial<GenderRangeValue>)
      const newValue: GenderRangeValue = {
        gender: gv.gender!,
        min: typeof val === 'number' ? val : undefined,
        max: gv.max,
      }
      onChange(newValue)
    },
    [onChange, value]
  )

  const onGenderMaxChange = useCallback(
    (val: string | number) => {
      const gv = (value as GenderRangeValue | undefined) ?? ({} as Partial<GenderRangeValue>)
      const newValue: GenderRangeValue = {
        gender: gv.gender!,
        min: gv.min,
        max: typeof val === 'number' ? val : undefined,
      }
      onChange(newValue)
    },
    [onChange, value]
  )

  return {
    ...props,
    minPlaceholder: formatMessage(messages.minPlaceholder),
    maxPlaceholder: formatMessage(messages.maxPlaceholder),
    minValueAriaLabel: formatMessage(messages.minValueLabel),
    maxValueAriaLabel: formatMessage(messages.maxValueLabel),
    searchFilterAriaLabel: formatMessage(messages.searchFilterLabel),
    onSelectChange,
    onMultiSelectChange,
    onNumberRangeChange,
    onSearchChange,
    onPriceRangesChange,
    onSelectPairChange,
    onGenderSelectChange,
    onGenderMinChange,
    onGenderMaxChange,
  }
}
