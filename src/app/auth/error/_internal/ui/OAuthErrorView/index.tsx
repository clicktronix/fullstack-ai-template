'use client'

import { Container, Alert, Stack, Button } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import Link from 'next/link'
import { TranslationText } from '@/ui/components/TranslationText'
import messages from './messages.json'

export type OAuthErrorViewProps = {
  error: string
  description?: string
}

type ErrorType = 'access_denied' | 'session_establishment_failed' | 'invalid_state' | 'server_error'

const ERROR_TYPES = new Set<ErrorType>([
  'access_denied',
  'session_establishment_failed',
  'invalid_state',
  'server_error',
])

export function OAuthErrorView({ error, description }: OAuthErrorViewProps) {
  const errorType: ErrorType | 'other' = ERROR_TYPES.has(error as ErrorType)
    ? (error as ErrorType)
    : 'other'

  return (
    <Container size="xs" my="xl">
      <Alert
        icon={<IconAlertCircle size={16} aria-hidden="true" />}
        color="red"
        title={<TranslationText {...messages.errorTitle} values={{ errorType }} />}
      >
        <Stack gap="md">
          <TranslationText {...messages.errorDescription} size="sm" values={{ errorType }} />
          {description && errorType !== 'other' && (
            <TranslationText
              {...messages.detailsLabel}
              size="xs"
              c="dimmed"
              values={{ description }}
            />
          )}
          <Button component={Link} href="/login" variant="light" fullWidth>
            <TranslationText {...messages.returnToLoginButton} />
          </Button>
        </Stack>
      </Alert>
    </Container>
  )
}
