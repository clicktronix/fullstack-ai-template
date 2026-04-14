import type { MantineColor, MantineSize } from '@mantine/core'
import type { ReactNode } from 'react'
import { useCallback, useState } from 'react'
import { useIntl } from 'react-intl'
import messages from './messages.json'

type BadgeGroupItem = {
  id: string
  name: string
  color?: string | null
  isPrimary?: boolean
}

export type BadgeGroupProps = {
  items: BadgeGroupItem[]
  maxVisible?: number
  emptyPlaceholder?: ReactNode
  size?: MantineSize
  primaryVariant?: 'filled' | 'light'
  defaultVariant?: 'light' | 'outline'
  defaultColor?: MantineColor
  primaryIndicator?: 'none' | 'star'
  noWrap?: boolean
}

export type BadgeGroupViewProps = BadgeGroupProps & {
  expanded: boolean
  onToggle: (e: React.MouseEvent) => void
  moreItemsAriaLabel: string
}

export function useBadgeGroupProps(props: BadgeGroupViewProps): {
  expanded: boolean
  onToggle: (e: React.MouseEvent) => void
  moreItemsAriaLabel: string
} {
  const intl = useIntl()
  const [expanded, setExpanded] = useState(false)

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setExpanded((prev) => !prev)
  }, [])

  const remaining = props.items.length - (props.maxVisible ?? 2)
  const moreItemsAriaLabel =
    remaining > 0 ? intl.formatMessage(messages.moreItems, { count: remaining }) : ''

  return {
    expanded,
    onToggle: handleToggle,
    moreItemsAriaLabel,
  }
}
