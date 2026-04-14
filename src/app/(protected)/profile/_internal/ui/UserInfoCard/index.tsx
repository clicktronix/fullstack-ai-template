'use client'

import { Card, Text, Group, Stack, Button, Alert, Skeleton } from '@mantine/core'
import { IconEdit, IconAlertCircle } from '@tabler/icons-react'
import React from 'react'
import type { User } from '@/domain/user/user'
import { Avatar } from '@/ui/components/Avatar'
import { TranslationText } from '@/ui/components/TranslationText'
import { composeHooks } from '@/ui/hooks/compose-hooks'
import { UserEditForm } from '../UserEditForm'
import { useUserInfoCardProps } from './lib'
import messages from './messages.json'
import styles from './styles.module.css'

export type UserInfoCardViewProps = {
  user: User | null
  isLoading: boolean
  error: Error | null
  displayName: string
  fullName: string
  initials: string
  email: string | null
  isEditing: boolean
  onEditClick: () => void
  onCancelEdit: () => void
  onEditSuccess: () => void
}

// Component has 4 render modes: loading, error, editing, display.
// Follow-up: extract into variant pattern with separate sub-components
// (e.g., UserInfoCardSkeleton, UserInfoCardError) if complexity grows.
export function UserInfoCardView({
  user,
  isLoading,
  error,
  fullName,
  initials,
  email,
  isEditing,
  onEditClick,
  onCancelEdit,
  onEditSuccess,
}: UserInfoCardViewProps) {
  if (isLoading) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <TranslationText {...messages.title} fw={600} size="lg" />
          </Group>
          <Group>
            <Skeleton height={60} circle />
            <Stack gap="xs" className={styles.flexOne}>
              <Skeleton height={20} width="40%" />
              <Skeleton height={16} width="30%" />
            </Stack>
          </Group>
        </Stack>
      </Card>
    )
  }

  if (error) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Alert
          icon={<IconAlertCircle size={16} aria-hidden="true" />}
          title={<TranslationText {...messages.errorTitle} />}
          color="red"
        >
          <TranslationText {...messages.error} />
        </Alert>
      </Card>
    )
  }

  if (isEditing && user) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <UserEditForm user={user} onSuccess={onEditSuccess} onCancel={onCancelEdit} />
      </Card>
    )
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <TranslationText {...messages.title} fw={600} size="lg" />
          <Button
            variant="light"
            leftSection={<IconEdit size={16} aria-hidden="true" />}
            onClick={onEditClick}
            size="sm"
          >
            <TranslationText {...messages.editButton} />
          </Button>
        </Group>

        <Group>
          <Avatar alt={fullName} size={60} radius="xl">
            {initials}
          </Avatar>

          <Stack gap={4}>
            <Text size="lg" fw={600}>
              {fullName}
            </Text>
            {email && (
              <Text size="sm" c="dimmed">
                {email}
              </Text>
            )}
          </Stack>
        </Group>
      </Stack>
    </Card>
  )
}

export const UserInfoCard = composeHooks(UserInfoCardView)(useUserInfoCardProps) as React.FC<{
  user: User | null
}>
