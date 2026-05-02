import { Container, Stack, Text } from '@mantine/core'
import type { Metadata } from 'next'
import { TranslationText } from '@/ui/components/TranslationText'
import { TranslationTitle } from '@/ui/components/TranslationTitle'
import messages from './messages.json'

export const metadata: Metadata = {
  title: 'Team | Fullstack AI Template',
}

export default function TeamPage() {
  return (
    <Container size="md" py="xl">
      <Stack gap="sm">
        <TranslationTitle {...messages.title} order={1} />
        <Text c="dimmed">
          <TranslationText {...messages.description} />
        </Text>
        <Text size="sm" c="dimmed">
          <TranslationText {...messages.note} />
        </Text>
      </Stack>
    </Container>
  )
}
