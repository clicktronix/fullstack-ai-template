'use client'

import { Button, Stack } from '@mantine/core'
import { FloatingPasswordInput } from '@/ui/components/FloatingInput/FloatingPasswordInput'
import { FloatingTextInput } from '@/ui/components/FloatingInput/FloatingTextInput'
import { FormErrorAlert } from '@/ui/components/FormErrorAlert'
import { composeHooks } from '@/ui/hooks/compose-hooks'
import { useLoginFormProps, type LoginFormProps, type LoginFormViewProps } from './lib'

export function LoginFormView({
  emailLabel,
  passwordLabel,
  submitButtonLabel,
  form,
  isSubmitting,
  error,
  formAction,
  redirectTo,
}: LoginFormViewProps) {
  return (
    <form action={formAction}>
      <Stack gap="lg">
        <FormErrorAlert error={error} />

        <input type="hidden" name="redirect" value={redirectTo} />

        <FloatingTextInput
          label={emailLabel}
          type="email"
          autoComplete="email"
          spellCheck={false}
          data-testid="login-email"
          key={form.key('email')}
          {...form.getInputProps('email')}
          name="email"
        />

        <FloatingPasswordInput
          label={passwordLabel}
          autoComplete="current-password"
          data-testid="login-password"
          key={form.key('password')}
          {...form.getInputProps('password')}
          name="password"
        />

        <Button type="submit" loading={isSubmitting} fullWidth mt="sm" data-testid="login-submit">
          {submitButtonLabel}
        </Button>
      </Stack>
    </form>
  )
}

export const LoginForm = composeHooks<LoginFormViewProps, LoginFormProps>(LoginFormView)(
  useLoginFormProps
)
