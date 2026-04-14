'use client'

import { Box, LoadingOverlay, Stack } from '@mantine/core'
import type { UseFormReturnType } from '@mantine/form'
import type { User } from '@/domain/user/user'
import { FloatingTextInput } from '@/ui/components/FloatingInput/FloatingTextInput'
import { FormActions } from '@/ui/components/FormActions'
import { TranslationText } from '@/ui/components/TranslationText'
import { composeHooks } from '@/ui/hooks/compose-hooks'
import { useUserEditFormProps } from './lib'
import messages from './messages.json'

type UserUpdateInput = {
  full_name: string
}

export type UserEditFormViewProps = {
  user: User
  onSuccess?: () => void
  onCancel?: () => void
  form: UseFormReturnType<UserUpdateInput>
  onSubmit: (e: React.FormEvent) => void
  isSubmitting: boolean
  error: Error | null
}

export function UserEditFormView({
  form,
  onSubmit,
  onCancel,
  isSubmitting,
}: UserEditFormViewProps) {
  return (
    <form onSubmit={onSubmit}>
      <Box pos="relative">
        <LoadingOverlay visible={isSubmitting} overlayProps={{ blur: 2 }} />
        <Stack gap="lg">
          <TranslationText {...messages.title} fw={600} size="lg" />

          <FloatingTextInput
            label={<TranslationText {...messages.fullName} />}
            name="full_name"
            autoComplete="name"
            {...form.getInputProps('full_name')}
            required
            disabled={isSubmitting}
          />

          <FormActions
            submitType="submit"
            onCancel={onCancel}
            submitLabel={<TranslationText {...messages.saveButton} />}
            cancelLabel={<TranslationText {...messages.cancelButton} />}
            isSubmitting={isSubmitting}
          />
        </Stack>
      </Box>
    </form>
  )
}

export const UserEditForm = composeHooks(UserEditFormView)(useUserEditFormProps)
