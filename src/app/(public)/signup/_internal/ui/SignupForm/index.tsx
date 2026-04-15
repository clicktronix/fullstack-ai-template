'use client'

import { Alert, Anchor, Button, Stack, Text } from '@mantine/core'
import Link from 'next/link'
import { FloatingPasswordInput } from '@/ui/components/FloatingInput/FloatingPasswordInput'
import { FloatingTextInput } from '@/ui/components/FloatingInput/FloatingTextInput'
import { FormErrorAlert } from '@/ui/components/FormErrorAlert'
import { composeHooks } from '@/ui/hooks/compose-hooks'
import { useSignupFormProps, type SignupFormProps, type SignupFormViewProps } from './lib'

export function SignupFormView({
  fullNameLabel,
  emailLabel,
  passwordLabel,
  confirmPasswordLabel,
  submitButtonLabel,
  confirmationTitle,
  confirmationDescription,
  loginLinkLabel,
  form,
  isSubmitting,
  error,
  confirmationEmail,
  onSubmit,
}: SignupFormViewProps) {
  if (confirmationEmail) {
    return (
      <Stack gap="lg">
        <Alert color="teal" title={confirmationTitle} variant="light">
          <Text size="sm">{confirmationDescription}</Text>
        </Alert>

        <Anchor component={Link} href="/login" size="sm">
          {loginLinkLabel}
        </Anchor>
      </Stack>
    )
  }

  return (
    <form onSubmit={onSubmit}>
      <Stack gap="lg">
        <FormErrorAlert error={error} />

        <FloatingTextInput
          label={fullNameLabel}
          name="name"
          autoComplete="name"
          key={form.key('fullName')}
          {...form.getInputProps('fullName')}
        />

        <FloatingTextInput
          label={emailLabel}
          name="email"
          type="email"
          autoComplete="email"
          spellCheck={false}
          key={form.key('email')}
          {...form.getInputProps('email')}
        />

        <FloatingPasswordInput
          label={passwordLabel}
          name="new-password"
          autoComplete="new-password"
          key={form.key('password')}
          {...form.getInputProps('password')}
        />

        <FloatingPasswordInput
          label={confirmPasswordLabel}
          name="confirm-password"
          autoComplete="new-password"
          key={form.key('confirmPassword')}
          {...form.getInputProps('confirmPassword')}
        />

        <Button type="submit" loading={isSubmitting} fullWidth mt="sm">
          {submitButtonLabel}
        </Button>
      </Stack>
    </form>
  )
}

export const SignupForm = composeHooks<SignupFormViewProps, SignupFormProps>(SignupFormView)(
  useSignupFormProps
)
