'use client'

import { Container, Stack, Alert } from '@mantine/core'
import { IconUser } from '@tabler/icons-react'
import type { User } from '@/domain/user/user'
import { ApiErrorBoundary } from '@/ui/components/ApiErrorBoundary'
import { PageSuspense } from '@/ui/components/PageSuspense'
import { SectionHeader } from '@/ui/components/SectionHeader'
import { TranslationText } from '@/ui/components/TranslationText'
import { TranslationTitle } from '@/ui/components/TranslationTitle'
import { composeHooks } from '@/ui/hooks/compose-hooks'
import { UserInfoCard } from '../UserInfoCard'
import { useProfileViewProps } from './lib'
import messages from './messages.json'

export type ProfileViewProps = {
  user: User | null
  error: string | null
}

export function ProfileViewComponent({ user, error }: ProfileViewProps) {
  return (
    <ApiErrorBoundary>
      <Container size="md" py="xl">
        <Stack gap="lg">
          <SectionHeader
            title={<TranslationTitle {...messages.title} order={2} />}
            icon={<IconUser size={32} aria-hidden="true" />}
          />

          {error && (
            <Alert color="red" title={<TranslationText {...messages.error} />}>
              {error}
            </Alert>
          )}

          <PageSuspense fullHeight={false}>
            <Stack gap="lg">
              <UserInfoCard user={user} />
              <TranslationText {...messages.version} size="sm" c="dimmed" ta="center" />
            </Stack>
          </PageSuspense>
        </Stack>
      </Container>
    </ApiErrorBoundary>
  )
}

export const ProfileView = composeHooks(ProfileViewComponent)(useProfileViewProps)
