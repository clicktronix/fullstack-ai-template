'use client'

import { Button, Center, Stack } from '@mantine/core'
import Link from 'next/link'
import { TranslationText } from '@/ui/components/TranslationText'
import { TranslationTitle } from '@/ui/components/TranslationTitle'
import messages from './messages.json'

export default function NotFoundPage() {
  return (
    <Center h="100dvh">
      <Stack align="center" gap="md">
        <TranslationTitle {...messages.notFoundTitle} order={1} />
        <TranslationText {...messages.notFoundDescription} c="dimmed" />
        <Button component={Link} href="/" variant="outline">
          <TranslationText {...messages.goHome} />
        </Button>
      </Stack>
    </Center>
  )
}
