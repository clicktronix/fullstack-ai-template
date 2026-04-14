'use client'

import { Group, Title, ActionIcon, Text } from '@mantine/core'
import { IconSettings, IconRefresh } from '@tabler/icons-react'
import type { ReactNode } from 'react'

export type TableHeaderProps = {
  title?: ReactNode
  description?: ReactNode
  onSettingsClick?: () => void
  onRefreshClick?: () => void
  rightSection?: ReactNode
  refreshAriaLabel: string
  settingsAriaLabel: string
}

export function TableHeader({
  title,
  description,
  onSettingsClick,
  onRefreshClick,
  rightSection,
  refreshAriaLabel,
  settingsAriaLabel,
}: TableHeaderProps) {
  return (
    <Group justify="space-between" mb="md">
      <div>
        {title && (
          <Title order={3} size="h4">
            {title}
          </Title>
        )}
        {description && (
          <Text size="sm" c="dimmed" mt={4}>
            {description}
          </Text>
        )}
      </div>
      <Group gap="xs">
        {rightSection}
        {onRefreshClick && (
          <ActionIcon
            variant="light"
            size="lg"
            onClick={onRefreshClick}
            aria-label={refreshAriaLabel}
          >
            <IconRefresh size={18} aria-hidden="true" />
          </ActionIcon>
        )}
        {onSettingsClick && (
          <ActionIcon
            variant="default"
            size="lg"
            onClick={onSettingsClick}
            aria-label={settingsAriaLabel}
          >
            <IconSettings size={18} aria-hidden="true" />
          </ActionIcon>
        )}
      </Group>
    </Group>
  )
}
