'use client'

import { useForm } from '@mantine/form'
import { useEffect, useMemo } from 'react'
import { useIntl } from 'react-intl'
import { array, boolean, minLength, nullable, object, optional, pipe, string, trim } from 'valibot'
import type { Label } from '@/domain/label/label'
import type { CreateWorkItem, UpdateWorkItem, WorkItem } from '@/domain/work-item/work-item'
import { createMantineValidator } from '@/lib/create-mantine-validator'
import messages from './messages.json'

export type WorkItemFormValues = {
  title: string
  description: string
  label_ids: string[]
  is_priority: boolean
}

export type WorkItemFormModalProps = {
  opened: boolean
  mode: 'create' | 'edit'
  workItem?: WorkItem | null
  labels: Label[]
  isSubmitting: boolean
  onClose: () => void
  onSubmitItem: (values: CreateWorkItem | UpdateWorkItem) => Promise<void> | void
}

export type WorkItemFormModalViewProps = Omit<WorkItemFormModalProps, 'onSubmitItem'> & {
  title: string
  submitLabel: string
  cancelLabel: string
  titlePlaceholder: string
  descriptionPlaceholder: string
  labelsPlaceholder: string
  form: ReturnType<typeof useForm<WorkItemFormValues>>
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  labelOptions: Array<{ value: string; label: string }>
}

function createWorkItemFormSchema(titleRequiredMessage: string) {
  return object({
    title: pipe(string(), trim(), minLength(1, titleRequiredMessage)),
    description: optional(nullable(string())),
    label_ids: optional(array(string())),
    is_priority: optional(boolean()),
  })
}

function getInitialValues(workItem?: WorkItem | null): WorkItemFormValues {
  return {
    title: workItem?.title ?? '',
    description: workItem?.description ?? '',
    label_ids: workItem?.label_ids ?? [],
    is_priority: workItem?.is_priority ?? false,
  }
}

export function useWorkItemFormModalProps({
  mode,
  workItem,
  labels,
  onSubmitItem,
  ...rest
}: WorkItemFormModalProps): WorkItemFormModalViewProps {
  const intl = useIntl()
  const schema = useMemo(
    () => createWorkItemFormSchema(intl.formatMessage(messages.validationTitleRequired)),
    [intl]
  )

  const form = useForm<WorkItemFormValues>({
    initialValues: getInitialValues(workItem),
    validate: createMantineValidator(schema),
  })

  useEffect(() => {
    form.setValues(getInitialValues(workItem))
    form.resetDirty()
  }, [form, workItem])

  const labelOptions = useMemo(
    () => labels.map((label) => ({ value: label.id, label: label.name })),
    [labels]
  )

  return {
    ...rest,
    mode,
    workItem,
    labels,
    form,
    labelOptions,
    title:
      mode === 'create'
        ? intl.formatMessage(messages.createTitle)
        : intl.formatMessage(messages.editTitle),
    submitLabel:
      mode === 'create' ? intl.formatMessage(messages.create) : intl.formatMessage(messages.save),
    cancelLabel: intl.formatMessage(messages.cancel),
    titlePlaceholder: intl.formatMessage(messages.titlePlaceholder),
    descriptionPlaceholder: intl.formatMessage(messages.descriptionPlaceholder),
    labelsPlaceholder: intl.formatMessage(messages.labelsPlaceholder),
    onSubmit: form.onSubmit(async (values) => {
      await onSubmitItem({
        title: values.title,
        description: values.description.length > 0 ? values.description : null,
        label_ids: values.label_ids,
        is_priority: values.is_priority,
      })
      form.reset()
    }),
  }
}
