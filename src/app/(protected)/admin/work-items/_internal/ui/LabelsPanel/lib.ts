'use client'

import { useForm } from '@mantine/form'
import { useCallback, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { minLength, object, optional, pipe, string, trim, nullable } from 'valibot'
import type { Label } from '@/domain/label/label'
import { createMantineValidator } from '@/lib/create-mantine-validator'
import { notifications } from '@/lib/mantine-notifications'
import { useCreateLabel, useUpdateLabel } from '@/ui/server-state/labels/mutations'
import messages from './messages.json'

type LabelFormValues = {
  name: string
  color: string
}

export type LabelsPanelProps = {
  labels: Label[]
}

export type LabelsPanelViewProps = {
  labels: Label[]
  form: ReturnType<typeof useForm<LabelFormValues>>
  editingLabelId: string | null
  isSubmitting: boolean
  namePlaceholder: string
  colorPlaceholder: string
  createLabelText: string
  saveLabelText: string
  cancelEditText: string
  onSubmit: (event?: React.FormEvent<HTMLFormElement>) => void
  onEdit: (label: Label) => void
  onCancelEdit: () => void
  formatEditAriaLabel: (name: string) => string
}

function createLabelFormSchema(nameRequiredMessage: string) {
  return object({
    name: pipe(string(), trim(), minLength(1, nameRequiredMessage)),
    color: optional(nullable(string())),
  })
}

export function useLabelsPanelProps({ labels }: LabelsPanelProps): LabelsPanelViewProps {
  const intl = useIntl()
  const createLabelMutation = useCreateLabel()
  const updateLabelMutation = useUpdateLabel()
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null)

  const schema = useMemo(
    () => createLabelFormSchema(intl.formatMessage(messages.validationNameRequired)),
    [intl]
  )

  const form = useForm<LabelFormValues>({
    initialValues: {
      name: '',
      color: '',
    },
    validate: createMantineValidator(schema),
  })

  const resetEditing = useCallback(() => {
    setEditingLabelId(null)
    form.reset()
  }, [form])

  const onSubmit = form.onSubmit(async (values) => {
    const payload = {
      name: values.name,
      color: values.color.length > 0 ? values.color : null,
    }

    if (editingLabelId) {
      await updateLabelMutation.mutateAsync({
        id: editingLabelId,
        input: payload,
      })
      notifications.show({
        color: 'green',
        title: intl.formatMessage(messages.title),
        message: intl.formatMessage(messages.save),
      })
      resetEditing()
      return
    }

    await createLabelMutation.mutateAsync(payload)
    notifications.show({
      color: 'green',
      title: intl.formatMessage(messages.title),
      message: intl.formatMessage(messages.create),
    })
    form.reset()
  })

  const onEdit = useCallback(
    (label: Label) => {
      setEditingLabelId(label.id)
      form.setValues({
        name: label.name,
        color: label.color ?? '',
      })
    },
    [form]
  )

  return {
    labels,
    form,
    editingLabelId,
    isSubmitting: createLabelMutation.isPending || updateLabelMutation.isPending,
    namePlaceholder: intl.formatMessage(messages.namePlaceholder),
    colorPlaceholder: intl.formatMessage(messages.colorPlaceholder),
    createLabelText: intl.formatMessage(messages.create),
    saveLabelText: intl.formatMessage(messages.save),
    cancelEditText: intl.formatMessage(messages.cancelEdit),
    onSubmit,
    onEdit,
    onCancelEdit: resetEditing,
    formatEditAriaLabel: (name) => `${intl.formatMessage(messages.editLabel)}: ${name}`,
  }
}
