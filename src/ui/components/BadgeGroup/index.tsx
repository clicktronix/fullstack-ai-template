import { Badge, Group, Text, UnstyledButton } from '@mantine/core'
import type { MantineColor } from '@mantine/core'
import { IconStarFilled } from '@tabler/icons-react'
import { composeHooks } from '@/ui/hooks/compose-hooks'
import type { BadgeGroupProps, BadgeGroupViewProps } from './lib'
import { useBadgeGroupProps } from './lib'
import styles from './styles.module.css'

const ALLOWED_BADGE_COLORS = new Set<MantineColor>([
  'gray',
  'dark',
  'red',
  'pink',
  'grape',
  'violet',
  'indigo',
  'blue',
  'sky',
  'cyan',
  'teal',
  'green',
  'lime',
  'yellow',
  'orange',
  'rose',
  'amber',
])

function resolveBadgeColor(
  color: string | null | undefined,
  defaultColor: MantineColor,
  isPrimary: boolean | undefined
): MantineColor {
  if (color && ALLOWED_BADGE_COLORS.has(color as MantineColor)) {
    return color as MantineColor
  }

  return isPrimary ? 'rose' : defaultColor
}

function BadgeGroupView({
  items,
  maxVisible = 2,
  emptyPlaceholder = '—',
  size = 'sm',
  primaryVariant = 'filled',
  defaultVariant = 'light',
  defaultColor = 'gray',
  primaryIndicator = 'none',
  noWrap = true,
  expanded,
  onToggle,
  moreItemsAriaLabel,
}: BadgeGroupViewProps) {
  if (items.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        {emptyPlaceholder}
      </Text>
    )
  }

  const displayItems = expanded ? items : items.slice(0, maxVisible)
  const remaining = items.length - maxVisible

  return (
    <Group gap={4} wrap={expanded ? 'wrap' : noWrap ? 'nowrap' : 'wrap'} className={styles.group}>
      {displayItems.map((item) => (
        <Badge
          key={item.id}
          size={size}
          variant={item.isPrimary && primaryIndicator === 'none' ? primaryVariant : defaultVariant}
          color={resolveBadgeColor(
            item.color,
            defaultColor,
            item.isPrimary && primaryIndicator === 'none'
          )}
          className={styles.badge}
          leftSection={
            item.isPrimary && primaryIndicator === 'star' ? (
              <IconStarFilled size={10} aria-hidden="true" className={styles.primaryIndicator} />
            ) : null
          }
        >
          {item.name}
        </Badge>
      ))}
      {remaining > 0 && (
        <UnstyledButton
          onClick={onToggle}
          aria-label={moreItemsAriaLabel}
          className={styles.counterButton}
        >
          <Badge
            size={size}
            variant={defaultVariant}
            color={defaultColor}
            className={styles.counterBadge}
            component="span"
          >
            {expanded ? '↩' : `+${remaining}`}
          </Badge>
        </UnstyledButton>
      )}
    </Group>
  )
}

export const BadgeGroup = composeHooks<BadgeGroupViewProps, BadgeGroupProps>(BadgeGroupView)(
  useBadgeGroupProps
)

export { type BadgeGroupProps } from './lib'
