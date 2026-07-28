'use client'

import { Alert, Anchor, Button, Stack, Text } from '@mantine/core'
import Link from 'next/link'
import { FloatingPasswordInput } from '@/shared/ui/components/FloatingInput/FloatingPasswordInput'
import { FloatingTextInput } from '@/shared/ui/components/FloatingInput/FloatingTextInput'
import { FormErrorAlert } from '@/shared/ui/components/FormErrorAlert'
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
  formAction,
  redirectTo,
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
    <form action={formAction}>
      <Stack gap="lg">
        <FormErrorAlert error={error} />

        <input type="hidden" name="redirect" value={redirectTo} />

        <FloatingTextInput
          label={fullNameLabel}
          autoComplete="name"
          key={form.key('fullName')}
          {...form.getInputProps('fullName')}
          name="fullName"
        />

        <FloatingTextInput
          label={emailLabel}
          type="email"
          autoComplete="email"
          spellCheck={false}
          key={form.key('email')}
          {...form.getInputProps('email')}
          name="email"
        />

        <FloatingPasswordInput
          label={passwordLabel}
          autoComplete="new-password"
          key={form.key('password')}
          {...form.getInputProps('password')}
          name="password"
        />

        <FloatingPasswordInput
          label={confirmPasswordLabel}
          autoComplete="new-password"
          key={form.key('confirmPassword')}
          {...form.getInputProps('confirmPassword')}
          name="confirmPassword"
        />

        <Button type="submit" loading={isSubmitting} fullWidth mt="sm">
          {submitButtonLabel}
        </Button>
      </Stack>
    </form>
  )
}

export function SignupForm(props: SignupFormProps) {
  return <SignupFormView {...useSignupFormProps(props)} />
}
