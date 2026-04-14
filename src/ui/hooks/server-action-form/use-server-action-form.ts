'use client'

import { useForm, type UseFormInput } from '@mantine/form'
import { useCallback, useEffect, useLayoutEffect, useRef, useTransition } from 'react'
import { useIntl } from 'react-intl'
import { presentError } from '@/lib/errors/presentation'
import { notifications } from '@/lib/mantine-notifications'
import messages from './messages.json'

export type ServerActionResult<T = unknown> =
  | { success: true; data?: T }
  | { success: false; error: string }

export type UseServerActionFormOptions<
  TValues extends Record<string, unknown>,
  TResult = unknown,
> = {
  /** Mantine form configuration (initialValues, validate, etc.) */
  form: UseFormInput<TValues>
  /** Server action to call on submit */
  action: (values: TValues) => Promise<ServerActionResult<TResult>>
  /** Success notification message (or function to generate it) */
  successMessage?: string | ((result: TResult | undefined) => string)
  /** Error notification title (default: 'Error') */
  errorTitle?: string
  /** Success notification title (default: 'Success') */
  successTitle?: string
  /** Callback on successful submit */
  onSuccess?: (result: TResult | undefined) => void
  /** Callback on error */
  onError?: (error: string) => void
  /** Show notifications (default: true) */
  showNotifications?: boolean
}

export type UseServerActionFormReturn<TValues extends Record<string, unknown>> = {
  /** Mantine form instance */
  form: ReturnType<typeof useForm<TValues>>
  /** Form submit handler (pass to <form onSubmit={onSubmit}>) */
  onSubmit: (e?: React.FormEvent<HTMLFormElement>) => void
  /** Whether form is submitting */
  isSubmitting: boolean
  /** Reset form to initial values */
  reset: () => void
}

/**
 * Hook for forms that submit via server actions with automatic
 * transition handling and notifications.
 *
 * @example
 * function UserEditForm({ user, onSuccess }) {
 *   const { form, onSubmit, isSubmitting } = useServerActionForm({
 *     form: {
 *       initialValues: { name: user.name, email: user.email },
 *       validate: createMantineValidator(UserSchema),
 *     },
 *     action: (values) => updateUserAction(user.id, values),
 *     successMessage: 'Profile updated',
 *     onSuccess,
 *   })
 *
 *   return (
 *     <form onSubmit={onSubmit}>
 *       <TextInput {...form.getInputProps('name')} />
 *       <TextInput {...form.getInputProps('email')} />
 *       <Button type="submit" loading={isSubmitting}>Save</Button>
 *     </form>
 *   )
 * }
 */
export function useServerActionForm<TValues extends Record<string, unknown>, TResult = unknown>({
  form: formConfig,
  action,
  successMessage,
  errorTitle,
  successTitle,
  onSuccess,
  onError,
  showNotifications = true,
}: UseServerActionFormOptions<TValues, TResult>): UseServerActionFormReturn<TValues> {
  const intl = useIntl()
  const [isPending, startTransition] = useTransition()
  const form = useForm<TValues>(formConfig)
  const formMethodsRef = useRef({ reset: form.reset, setErrors: form.setErrors })

  useLayoutEffect(() => {
    formMethodsRef.current = { reset: form.reset, setErrors: form.setErrors }
  }, [form.reset, form.setErrors])

  // Use translated defaults if not provided
  const resolvedSuccessMessage = successMessage ?? intl.formatMessage(messages.savedSuccessfully)
  const resolvedErrorTitle = errorTitle ?? intl.formatMessage(messages.error)
  const resolvedSuccessTitle = successTitle ?? intl.formatMessage(messages.success)

  // Stabilize callback dependencies via ref to prevent handleSubmit re-creation
  const callbacksRef = useRef({
    action,
    onSuccess,
    onError,
    resolvedSuccessMessage,
    resolvedErrorTitle,
    resolvedSuccessTitle,
    showNotifications,
    intl,
  })

  useEffect(() => {
    callbacksRef.current = {
      action,
      onSuccess,
      onError,
      resolvedSuccessMessage,
      resolvedErrorTitle,
      resolvedSuccessTitle,
      showNotifications,
      intl,
    }
  }, [
    action,
    onSuccess,
    onError,
    resolvedSuccessMessage,
    resolvedErrorTitle,
    resolvedSuccessTitle,
    showNotifications,
    intl,
  ])

  const handleSubmit = useCallback(async (values: TValues) => {
    startTransition(async () => {
      const {
        action: currentAction,
        onSuccess: currentOnSuccess,
        onError: currentOnError,
        resolvedSuccessMessage: currentSuccessMessage,
        resolvedErrorTitle: currentErrorTitle,
        resolvedSuccessTitle: currentSuccessTitle,
        showNotifications: currentShowNotifications,
        intl: currentIntl,
      } = callbacksRef.current

      try {
        const result = await currentAction(values)

        if (result.success) {
          if (currentShowNotifications) {
            const message =
              typeof currentSuccessMessage === 'function'
                ? currentSuccessMessage(result.data)
                : currentSuccessMessage

            notifications.show({
              title: currentSuccessTitle,
              message,
              color: 'green',
            })
          }
          currentOnSuccess?.(result.data)
        } else {
          if (currentShowNotifications) {
            notifications.show({
              title: currentErrorTitle,
              message: result.error,
              color: 'red',
            })
          }
          currentOnError?.(result.error)
        }
      } catch (error) {
        // Handle unexpected exceptions from Server Action
        const presentation = presentError(error)
        const title = currentIntl.formatMessage(presentation.titleDescriptor)
        const message = currentIntl.formatMessage(
          presentation.messageDescriptor,
          presentation.messageValues
        )

        if (currentShowNotifications) {
          notifications.show({
            title,
            message,
            color: 'red',
          })
        }
        formMethodsRef.current.setErrors({
          submit: message || currentIntl.formatMessage(messages.unknownError),
        })
      }
    })
  }, [])

  const reset = useCallback(() => {
    formMethodsRef.current.reset()
  }, [])

  const onSubmit = useCallback(
    (e?: React.FormEvent<HTMLFormElement>) => {
      form.onSubmit(handleSubmit)(e)
    },
    [form, handleSubmit]
  )

  return {
    form,
    onSubmit,
    isSubmitting: isPending,
    reset,
  }
}
