import { useForm } from '@mantine/form'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { LoginCredentialsSchema, type LoginCredentials } from '@/domain/auth/auth'
import { getPostLoginRedirect } from '@/lib/auth-routes'
import { createMantineValidator } from '@/lib/create-mantine-validator'
import { useSignIn } from '@/ui/server-state/auth/mutations'
import messages from './messages.json'

export type LoginFormProps = Record<string, never>

export type LoginFormViewProps = {
  emailLabel: string
  passwordLabel: string
  submitButtonLabel: string
  form: ReturnType<typeof useForm<LoginCredentials>>
  isSubmitting: boolean
  error: string | null
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export function useLoginFormProps(): LoginFormViewProps {
  const intl = useIntl()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { mutate: signIn, isPending, error } = useSignIn()

  const form = useForm<LoginCredentials>({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
      password: '',
    },
    validate: createMantineValidator(LoginCredentialsSchema),
  })

  const handleSubmit = useCallback(
    (values: LoginCredentials) => {
      signIn(values, {
        onSuccess: () => {
          const redirectTo = getPostLoginRedirect(searchParams)
          router.push(redirectTo)
        },
      })
    },
    [signIn, router, searchParams]
  )

  return {
    emailLabel: intl.formatMessage(messages.emailLabel),
    passwordLabel: intl.formatMessage(messages.passwordLabel),
    submitButtonLabel: intl.formatMessage(messages.submitButton),
    form,
    isSubmitting: isPending,
    error: error?.message ?? null,
    onSubmit: form.onSubmit(handleSubmit),
  }
}
