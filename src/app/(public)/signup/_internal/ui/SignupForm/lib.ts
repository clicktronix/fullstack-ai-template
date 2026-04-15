import { useForm } from '@mantine/form'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { type IntlShape, useIntl } from 'react-intl'
import { email, minLength, object, pipe, string } from 'valibot'
import { getPostLoginRedirect } from '@/lib/auth-routes'
import { createMantineValidator } from '@/lib/create-mantine-validator'
import { useSignUp } from '@/ui/server-state/auth/mutations'
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

export type SignupFormProps = Record<string, never>

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
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export function useSignupFormProps(): SignupFormViewProps {
  const intl = useIntl()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { mutate: signUp, isPending, error } = useSignUp()
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null)

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

  const handleSubmit = useCallback(
    (values: SignupFormValues) => {
      setConfirmationEmail(null)
      signUp(
        {
          email: values.email,
          password: values.password,
          fullName: values.fullName,
        },
        {
          onSuccess: (session) => {
            if (session) {
              const redirectTo = getPostLoginRedirect(searchParams)
              router.push(redirectTo)
              return
            }

            form.reset()
            setConfirmationEmail(values.email)
          },
        }
      )
    },
    [signUp, router, searchParams, form]
  )

  return {
    fullNameLabel: intl.formatMessage(messages.fullNameLabel),
    emailLabel: intl.formatMessage(messages.emailLabel),
    passwordLabel: intl.formatMessage(messages.passwordLabel),
    confirmPasswordLabel: intl.formatMessage(messages.confirmPasswordLabel),
    submitButtonLabel: intl.formatMessage(messages.submitButton),
    confirmationTitle: intl.formatMessage(messages.confirmationTitle),
    confirmationDescription: intl.formatMessage(messages.confirmationDescription, {
      email: confirmationEmail ?? '',
    }),
    loginLinkLabel: intl.formatMessage(messages.loginLinkLabel),
    form,
    isSubmitting: isPending,
    error: error?.message ?? null,
    confirmationEmail,
    onSubmit: form.onSubmit(handleSubmit),
  }
}
