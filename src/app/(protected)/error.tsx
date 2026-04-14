'use client'

import { Button, Container, Stack } from '@mantine/core'
import { TranslationText } from '@/ui/components/TranslationText'
import { TranslationTitle } from '@/ui/components/TranslationTitle'
import messages from '../messages.json'

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Error boundary for protected routes.
 *
 * Renders INSIDE the (protected) layout, preserving:
 * - AppShell (navigation, header, sidebar)
 * - All providers (Intl, Query, Auth, Modals)
 *
 * This ensures users can still navigate away from the error
 * without losing the entire app shell.
 */
export default function ProtectedErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="md">
        <TranslationTitle {...messages.errorTitle} order={1} />
        <TranslationText {...messages.errorDescription} c="dimmed" ta="center" />
        <Button onClick={reset} variant="outline">
          <TranslationText {...messages.tryAgain} />
        </Button>
        {error.digest ? (
          <TranslationText
            {...messages.errorId}
            values={{ id: error.digest }}
            size="xs"
            c="dimmed"
          />
        ) : null}
      </Stack>
    </Container>
  )
}
