'use client'

import { Anchor, Container, Group, Paper, Stack } from '@mantine/core'
import Link from 'next/link'
import { TranslationText } from '@/ui/components/TranslationText'
import { TranslationTitle } from '@/ui/components/TranslationTitle'
import { SignupForm } from '../SignupForm'
import messages from './messages.json'

export type SignupViewProps = {
  redirectTo?: string
}

/**
 * SignupView - main registration page component.
 *
 * Renders the signup form with full name, email, password fields.
 */
export function SignupView({ redirectTo }: SignupViewProps) {
  return (
    <Container size="xs" py="xl">
      <Paper p="xl" radius="md" withBorder>
        <Stack gap="md">
          <TranslationTitle {...messages.title} order={2} ta="center" />
          <TranslationText {...messages.description} c="dimmed" ta="center" />
          <SignupForm redirectTo={redirectTo} />
          <Group justify="center" gap="xs">
            <TranslationText {...messages.hasAccount} size="sm" c="dimmed" />
            <Anchor component={Link} href="/login" size="sm">
              <TranslationText {...messages.loginLink} />
            </Anchor>
          </Group>
        </Stack>
      </Paper>
    </Container>
  )
}
