import type { ReactNode } from 'react'

export type PlatformToggleItem = {
  value: string
  label: ReactNode
}

export type PlatformToggleGroupProps = {
  items: PlatformToggleItem[]
  selectedValues: string[]
  onToggle: (value: string) => void
}
