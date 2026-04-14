import { useMemo } from 'react'

type SelectOption = {
  value: string
  label: string
}

export function useSelectOptions<T extends { id: string; name: string }>(
  items: T[]
): SelectOption[] {
  return useMemo(() => items.map((item) => ({ value: item.id, label: item.name })), [items])
}
