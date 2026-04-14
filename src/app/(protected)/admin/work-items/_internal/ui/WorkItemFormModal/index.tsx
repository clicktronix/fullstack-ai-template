'use client'

import { MultiSelect, Stack, Switch, Textarea, TextInput } from '@mantine/core'
import { FormModalShell } from '@/ui/components/FormModalShell'
import { TranslationText } from '@/ui/components/TranslationText'
import { composeHooks } from '@/ui/hooks/compose-hooks'
import type { WorkItemFormModalProps, WorkItemFormModalViewProps } from './lib'
import { useWorkItemFormModalProps } from './lib'
import messages from './messages.json'

export function WorkItemFormModalView({
  opened,
  onClose,
  form,
  onSubmit,
  isSubmitting,
  title,
  submitLabel,
  cancelLabel,
  titlePlaceholder,
  descriptionPlaceholder,
  labelsPlaceholder,
  labelOptions,
}: WorkItemFormModalViewProps) {
  return (
    <FormModalShell
      opened={opened}
      onClose={onClose}
      onSubmit={onSubmit}
      title={title}
      submitLabel={submitLabel}
      cancelLabel={cancelLabel}
      isSubmitting={isSubmitting}
    >
      <Stack gap="md">
        <TextInput
          label={<TranslationText {...messages.titleLabel} />}
          placeholder={titlePlaceholder}
          data-testid="work-item-form-title"
          {...form.getInputProps('title')}
          required
        />

        <Textarea
          label={<TranslationText {...messages.descriptionLabel} />}
          placeholder={descriptionPlaceholder}
          data-testid="work-item-form-description"
          minRows={4}
          {...form.getInputProps('description')}
        />

        <MultiSelect
          label={<TranslationText {...messages.labelsLabel} />}
          placeholder={labelsPlaceholder}
          data-testid="work-item-form-labels"
          data={labelOptions}
          searchable
          clearable
          {...form.getInputProps('label_ids')}
        />

        <Switch
          label={<TranslationText {...messages.priorityLabel} />}
          data-testid="work-item-form-priority"
          checked={form.values.is_priority}
          {...form.getInputProps('is_priority', { type: 'checkbox' })}
        />
      </Stack>
    </FormModalShell>
  )
}

export const WorkItemFormModal = composeHooks<WorkItemFormModalViewProps, WorkItemFormModalProps>(
  WorkItemFormModalView
)(useWorkItemFormModalProps)
