'use client'

import { Button, Center, MantineProvider, Stack, Text, Title } from '@mantine/core'
import '@mantine/core/styles.css'

type GlobalErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Global error boundary for errors in root layout.
 * Must include its own html/body tags and MantineProvider since root layout may have failed.
 *
 * NOTE: Hardcoded strings intentionally - IntlProvider is not available at this level
 * since it's wrapped in ClientProviders which may have failed.
 */
export default function GlobalErrorPage({ reset }: GlobalErrorPageProps) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#1a1b1e" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
      </head>
      <body>
        <MantineProvider defaultColorScheme="dark">
          <Center h="100dvh">
            <Stack align="center" gap="md">
              <Title order={1}>Что-то пошло не так</Title>
              <Text c="dimmed">Произошла критическая ошибка</Text>
              <Button onClick={reset} variant="outline">
                Попробовать снова
              </Button>
            </Stack>
          </Center>
        </MantineProvider>
      </body>
    </html>
  )
}
