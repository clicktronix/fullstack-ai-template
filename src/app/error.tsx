'use client'

import { Button, Center, Stack } from '@mantine/core'
import { TranslationText } from '@/ui/components/TranslationText'
import { TranslationTitle } from '@/ui/components/TranslationTitle'
import messages from './messages.json'

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <Center h="100dvh">
      <Stack align="center" gap="md">
        <TranslationTitle {...messages.errorTitle} order={1} />
        <TranslationText {...messages.errorDescription} c="dimmed" />
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
    </Center>
  )
}
