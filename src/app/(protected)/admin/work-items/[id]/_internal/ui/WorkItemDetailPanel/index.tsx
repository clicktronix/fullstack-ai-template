'use client'

import { Badge, Button, Card, Group, Skeleton, Stack, Text, Title } from '@mantine/core'
import { IconArrowLeft, IconX } from '@tabler/icons-react'
import Link from 'next/link'
import { TranslationText } from '@/ui/components/TranslationText'
import { composeHooks } from '@/ui/hooks/compose-hooks'
import type { WorkItemDetailPanelProps, WorkItemDetailPanelViewProps } from './lib'
import { useWorkItemDetailPanelProps } from './lib'
import messages from './messages.json'

export function WorkItemDetailPanelView({
  variant,
  title,
  description,
  statusLabel,
  updatedAtLabel,
  isPriority,
  isLoading,
  isError,
  labelsCount,
  onClose,
}: WorkItemDetailPanelViewProps) {
  if (isLoading) {
    return (
      <Card withBorder p="lg" data-testid="work-item-detail-loading">
        <Stack gap="sm">
          <Skeleton height={28} width="70%" />
          <Skeleton height={18} width="45%" />
          <Skeleton height={80} />
        </Stack>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card withBorder p="lg" data-testid="work-item-detail-error">
        <Stack gap="md">
          <Text c="red">
            <TranslationText {...messages.error} />
          </Text>
          <Button component={Link} href="/admin/work-items" variant="default">
            <TranslationText {...messages.backToList} />
          </Button>
        </Stack>
      </Card>
    )
  }

  return (
    <Card withBorder p="lg" data-testid="work-item-detail-panel">
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Title order={variant === 'page' ? 2 : 3}>{title}</Title>
            <Text size="sm" c="dimmed">
              {updatedAtLabel}
            </Text>
          </Stack>

          {variant === 'modal' && onClose ? (
            <Button
              variant="subtle"
              size="compact-sm"
              leftSection={<IconX size={14} />}
              onClick={onClose}
              data-testid="work-item-detail-close"
            >
              <TranslationText {...messages.close} />
            </Button>
          ) : null}
        </Group>

        {description ? (
          <Text>{description}</Text>
        ) : (
          <Text c="dimmed">
            <TranslationText {...messages.emptyDescription} />
          </Text>
        )}

        <Group gap="xs">
          <Badge variant="light">{statusLabel}</Badge>
          {isPriority ? (
            <Badge color="orange">
              <TranslationText {...messages.priority} />
            </Badge>
          ) : null}
          <Badge variant="dot">
            <TranslationText {...messages.labelsCount} values={{ count: labelsCount }} />
          </Badge>
        </Group>

        {variant === 'page' ? (
          <Button
            component={Link}
            href="/admin/work-items"
            variant="default"
            leftSection={<IconArrowLeft size={16} />}
          >
            <TranslationText {...messages.backToList} />
          </Button>
        ) : null}
      </Stack>
    </Card>
  )
}

export const WorkItemDetailPanel = composeHooks<
  WorkItemDetailPanelViewProps,
  WorkItemDetailPanelProps
>(WorkItemDetailPanelView)(useWorkItemDetailPanelProps)
