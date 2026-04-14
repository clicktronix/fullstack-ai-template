'use client'

import { ActionIcon, Badge, Button, Group, Stack, Text, TextInput } from '@mantine/core'
import { IconEdit } from '@tabler/icons-react'
import { SectionCard } from '@/ui/components/SectionCard'
import { TranslationText } from '@/ui/components/TranslationText'
import { composeHooks } from '@/ui/hooks/compose-hooks'
import type { LabelsPanelProps, LabelsPanelViewProps } from './lib'
import { useLabelsPanelProps } from './lib'
import messages from './messages.json'

export function LabelsPanelView({
  labels,
  form,
  editingLabelId,
  isSubmitting,
  namePlaceholder,
  colorPlaceholder,
  createLabelText,
  saveLabelText,
  cancelEditText,
  onSubmit,
  onEdit,
  onCancelEdit,
  formatEditAriaLabel,
}: LabelsPanelViewProps) {
  return (
    <SectionCard title={messages.title}>
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          <TranslationText {...messages.description} />
        </Text>

        <form onSubmit={onSubmit}>
          <Stack gap="sm">
            <TextInput
              label={<TranslationText {...messages.nameLabel} />}
              placeholder={namePlaceholder}
              data-testid="labels-panel-name"
              {...form.getInputProps('name')}
            />
            <TextInput
              label={<TranslationText {...messages.colorLabel} />}
              placeholder={colorPlaceholder}
              data-testid="labels-panel-color"
              {...form.getInputProps('color')}
            />

            <Group justify="space-between" align="center">
              <Button type="submit" loading={isSubmitting} data-testid="labels-panel-submit">
                {editingLabelId ? saveLabelText : createLabelText}
              </Button>
              {editingLabelId ? (
                <Button variant="subtle" onClick={onCancelEdit} disabled={isSubmitting}>
                  {cancelEditText}
                </Button>
              ) : null}
            </Group>
          </Stack>
        </form>

        {labels.length > 0 ? (
          <Stack gap="xs">
            {labels.map((label) => (
              <Group key={label.id} justify="space-between" align="center">
                <Badge color={label.color ?? undefined} variant="light">
                  {label.name}
                </Badge>
                <ActionIcon
                  variant="subtle"
                  onClick={() => onEdit(label)}
                  aria-label={formatEditAriaLabel(label.name)}
                >
                  <IconEdit size={16} />
                </ActionIcon>
              </Group>
            ))}
          </Stack>
        ) : (
          <Text size="sm" c="dimmed">
            <TranslationText {...messages.empty} />
          </Text>
        )}
      </Stack>
    </SectionCard>
  )
}

export const LabelsPanel = composeHooks<LabelsPanelViewProps, LabelsPanelProps>(LabelsPanelView)(
  useLabelsPanelProps
)
