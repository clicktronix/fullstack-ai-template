'use client'

import { Anchor, Container, Group, Paper, Stack } from '@mantine/core'
import Link from 'next/link'
import { TranslationText } from '@/ui/components/TranslationText'
import { TranslationTitle } from '@/ui/components/TranslationTitle'
import { LoginForm } from '../LoginForm'
import messages from './messages.json'

export type LoginViewProps = Record<string, never>

/**
 * LoginView - main login page component.
 *
 * Simple view that renders the login form with email/password.
 * No OAuth providers - only email/password authentication.
 */
export function LoginView() {
  return (
    <Container size="xs" py="xl">
      <Paper p="xl" radius="md" withBorder>
        <Stack gap="md">
          <TranslationTitle {...messages.title} order={2} ta="center" />
          <TranslationText {...messages.description} c="dimmed" ta="center" />
          <LoginForm />
          <Group justify="center" gap="xs">
            <TranslationText {...messages.noAccount} size="sm" c="dimmed" />
            <Anchor component={Link} href="/signup" size="sm">
              <TranslationText {...messages.signupLink} />
            </Anchor>
          </Group>
        </Stack>
      </Paper>
    </Container>
  )
}
