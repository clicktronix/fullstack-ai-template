import { useForm } from '@mantine/form'
import { useActionState } from 'react'
import { useIntl } from 'react-intl'
import { LoginCredentialsSchema, type LoginCredentials } from '@/domain/auth/auth'
import { createMantineValidator } from '@/lib/create-mantine-validator'
import { initialLoginFormState, submitLoginForm } from './actions'
import messages from './messages.json'

export type LoginFormProps = {
  redirectTo?: string
}

export type LoginFormViewProps = {
  emailLabel: string
  passwordLabel: string
  submitButtonLabel: string
  form: ReturnType<typeof useForm<LoginCredentials>>
  isSubmitting: boolean
  error: string | null
  formAction: (formData: FormData) => void
  redirectTo: string
}

export function useLoginFormProps({ redirectTo = '' }: LoginFormProps): LoginFormViewProps {
  const intl = useIntl()
  const [state, formAction, isPending] = useActionState(submitLoginForm, initialLoginFormState)

  const form = useForm<LoginCredentials>({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
      password: '',
    },
    validate: createMantineValidator(LoginCredentialsSchema),
  })

  return {
    emailLabel: intl.formatMessage(messages.emailLabel),
    passwordLabel: intl.formatMessage(messages.passwordLabel),
    submitButtonLabel: intl.formatMessage(messages.submitButton),
    form,
    isSubmitting: isPending,
    error: state.error,
    formAction,
    redirectTo,
  }
}
