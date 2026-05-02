import { useForm } from '@mantine/form'
import { useActionState, useMemo } from 'react'
import { type IntlShape, useIntl } from 'react-intl'
import { email, minLength, object, pipe, string } from 'valibot'
import { createMantineValidator } from '@/lib/create-mantine-validator'
import { initialSignupFormState, submitSignupForm } from './actions'
import messages from './messages.json'

/**
 * Creates localized signup validation schema.
 */
function createSignupSchema(intl: IntlShape) {
  return object({
    fullName: pipe(
      string(),
      minLength(2, intl.formatMessage(messages.validationFullNameMinLength))
    ),
    email: pipe(string(), email(intl.formatMessage(messages.validationEmailInvalid))),
    password: pipe(
      string(),
      minLength(8, intl.formatMessage(messages.validationPasswordMinLength))
    ),
    confirmPassword: string(),
  })
}

type SignupFormValues = {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

export type SignupFormProps = {
  redirectTo?: string
}

export type SignupFormViewProps = {
  fullNameLabel: string
  emailLabel: string
  passwordLabel: string
  confirmPasswordLabel: string
  submitButtonLabel: string
  confirmationTitle: string
  confirmationDescription: string
  loginLinkLabel: string
  form: ReturnType<typeof useForm<SignupFormValues>>
  isSubmitting: boolean
  error: string | null
  confirmationEmail: string | null
  formAction: (formData: FormData) => void
  redirectTo: string
}

export function useSignupFormProps({ redirectTo = '' }: SignupFormProps): SignupFormViewProps {
  const intl = useIntl()
  const [state, formAction, isPending] = useActionState(submitSignupForm, initialSignupFormState)

  // Create localized schema once per locale change (intl object is unstable)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const signupSchema = useMemo(() => createSignupSchema(intl), [intl.locale])

  const form = useForm<SignupFormValues>({
    mode: 'uncontrolled',
    initialValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      ...createMantineValidator(signupSchema),
      confirmPassword: (value, values) =>
        value === values.password
          ? null
          : intl.formatMessage(messages.validationPasswordsDoNotMatch),
    },
  })

  const localizedError =
    state.errorKey === 'PASSWORDS_DO_NOT_MATCH'
      ? intl.formatMessage(messages.validationPasswordsDoNotMatch)
      : state.error

  return {
    fullNameLabel: intl.formatMessage(messages.fullNameLabel),
    emailLabel: intl.formatMessage(messages.emailLabel),
    passwordLabel: intl.formatMessage(messages.passwordLabel),
    confirmPasswordLabel: intl.formatMessage(messages.confirmPasswordLabel),
    submitButtonLabel: intl.formatMessage(messages.submitButton),
    confirmationTitle: intl.formatMessage(messages.confirmationTitle),
    confirmationDescription: intl.formatMessage(messages.confirmationDescription, {
      email: state.confirmationEmail ?? '',
    }),
    loginLinkLabel: intl.formatMessage(messages.loginLinkLabel),
    form,
    isSubmitting: isPending,
    error: localizedError,
    confirmationEmail: state.confirmationEmail,
    formAction,
    redirectTo,
  }
}
