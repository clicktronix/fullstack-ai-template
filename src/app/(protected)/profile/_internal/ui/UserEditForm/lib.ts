import type { IntlShape } from 'react-intl'
import { useIntl } from 'react-intl'
import { maxLength, minLength, object, pipe, string } from 'valibot'
import type { User } from '@/domain/user/user'
import { createMantineValidator } from '@/lib/create-mantine-validator'
import { useServerActionForm } from '@/ui/hooks/server-action-form/use-server-action-form'
import { updateCurrentUserProfile } from './actions'
import messages from './messages.json'

function createUserEditSchema(intl: IntlShape) {
  return object({
    full_name: pipe(
      string(),
      minLength(1, intl.formatMessage(messages.validationNameRequired)),
      maxLength(100, intl.formatMessage(messages.validationNameMaxLength))
    ),
  })
}

export type UseUserEditFormPropsInput = {
  user: User
  onSuccess?: () => void
  onCancel?: () => void
}

export function useUserEditFormProps({ user, onSuccess, onCancel }: UseUserEditFormPropsInput) {
  const intl = useIntl()
  const UserEditSchema = createUserEditSchema(intl)

  const { form, onSubmit, isSubmitting } = useServerActionForm({
    form: {
      initialValues: {
        full_name: user.full_name ?? '',
      },
      validate: createMantineValidator(UserEditSchema),
    },
    action: (values) => updateCurrentUserProfile(user.id, values),
    successMessage: intl.formatMessage(messages.successMessage),
    onSuccess,
  })

  return {
    form,
    onSubmit,
    onCancel,
    isSubmitting,
    error: null,
    fullNamePlaceholder: intl.formatMessage(messages.fullNamePlaceholder),
  }
}
