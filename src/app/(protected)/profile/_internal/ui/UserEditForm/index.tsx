'use client'

import { Box, LoadingOverlay, Stack } from '@mantine/core'
import type { UseFormReturnType } from '@mantine/form'
import { FloatingTextInput } from '@/shared/ui/components/FloatingInput/FloatingTextInput'
import { FormActions } from '@/shared/ui/components/FormActions'
import { TranslationText } from '@/shared/ui/components/TranslationText'
import { useUserEditFormProps, type UseUserEditFormPropsInput } from './lib'
import messages from './messages.json'

type UserUpdateInput = {
  full_name: string
}

export type UserEditFormViewProps = {
  onCancel?: () => void
  form: UseFormReturnType<UserUpdateInput>
  onSubmit: (event?: React.FormEvent<HTMLFormElement>) => void
  isSubmitting: boolean
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

export function UserEditForm(props: UseUserEditFormPropsInput) {
  return <UserEditFormView {...useUserEditFormProps(props)} />
}
