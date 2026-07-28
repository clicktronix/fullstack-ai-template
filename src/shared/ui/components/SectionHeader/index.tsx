import { Group, type GroupProps } from '@mantine/core'
import type { ReactNode } from 'react'

export type SectionHeaderProps = {
  /** Title content (use TranslationTitle for MessageDescriptors) */
  title: ReactNode
  /** Optional icon displayed before title */
  icon?: ReactNode
  /** Optional actions displayed on the right */
  actions?: ReactNode
  /** Group gap between icon and title (default: md) */
  gap?: GroupProps['gap']
  /** Vertical alignment (default: center) */
  align?: GroupProps['align']
}

/**
 * SectionHeader - Universal component for section headings with optional icon and actions
 *
 * Provides consistent styling for page/section headers across the app.
 * Handles both simple headers (icon + title) and complex headers (icon + title + actions).
 *
 * @example
 * ```tsx
 * // Simple header with icon
 * <SectionHeader
 *   title={<TranslationTitle {...messages.title} order={2} />}
 *   icon={<IconUser size={32} />}
 * />
 *
 * // Header with actions
 * <SectionHeader
 *   title={<Text size="xl" fw={700}>Portfolio</Text>}
 *   actions={<Button>Add</Button>}
 * />
 *
 * // Custom styling
 * <SectionHeader
 *   title={<TranslationTitle {...messages.title} order={1} size="3rem" fw={800} />}
 * />
 * ```
 */
export function SectionHeader({
  title,
  icon,
  actions,
  gap = 'md',
  align = 'center',
}: SectionHeaderProps) {
  const hasActions = actions !== undefined

  return (
    <Group justify={hasActions ? 'space-between' : 'flex-start'} align={align} gap={gap}>
      <Group align={align} gap={gap}>
        {icon}
        {title}
      </Group>

      {hasActions && actions}
    </Group>
  )
}
