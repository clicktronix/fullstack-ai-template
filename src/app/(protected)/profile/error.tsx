'use client'

import { Button, Container, Group, Stack } from '@mantine/core'
import Link from 'next/link'
import { TranslationText } from '@/ui/components/TranslationText'
import { TranslationTitle } from '@/ui/components/TranslationTitle'
import errorMessages from '../../messages.json'
import messages from './messages.json'

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Error boundary for the profile page.
 *
 * Renders inside the (protected) layout, preserving AppShell and navigation.
 * Provides buttons to return to the profile page and retry.
 */
export default function ProfileErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="md">
        <TranslationTitle {...errorMessages.errorTitle} order={1} />
        <TranslationText {...errorMessages.errorDescription} c="dimmed" ta="center" />
        <Group>
          <Button component={Link} href="/profile" variant="outline">
            <TranslationText {...messages.backToHome} />
          </Button>
          <Button onClick={reset} variant="light">
            <TranslationText {...errorMessages.tryAgain} />
          </Button>
        </Group>
        {error.digest ? (
          <TranslationText
            {...errorMessages.errorId}
            values={{ id: error.digest }}
            size="xs"
            c="dimmed"
          />
        ) : null}
      </Stack>
    </Container>
  )
}
