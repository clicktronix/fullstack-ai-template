import { useForm } from '@mantine/form'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { Label } from '@/domain/label/label'
import { WorkItemFormModalView } from './index'

const sampleLabels: Label[] = [
  {
    id: 'label-1',
    name: 'Product',
    color: 'blue',
    created_at: '2026-04-14T10:00:00.000Z',
  },
  {
    id: 'label-2',
    name: 'Ops',
    color: 'grape',
    created_at: '2026-04-14T10:00:00.000Z',
  },
]

function WorkItemFormStory({ mode }: { mode: 'create' | 'edit' }) {
  const form = useForm({
    initialValues: {
      title: mode === 'create' ? '' : 'Ship onboarding checklist',
      description:
        mode === 'create'
          ? ''
          : 'Use this modal as the baseline example for forms, validation, and label selection.',
      label_ids: mode === 'create' ? [] : ['label-1'],
      is_priority: mode === 'edit',
    },
  })

  return (
    <WorkItemFormModalView
      opened
      mode={mode}
      workItem={null}
      labels={sampleLabels}
      isSubmitting={false}
      onClose={() => {}}
      title={mode === 'create' ? 'Create work item' : 'Edit work item'}
      submitLabel={mode === 'create' ? 'Create' : 'Save'}
      cancelLabel="Cancel"
      titlePlaceholder="For example, prepare onboarding flow"
      descriptionPlaceholder="Describe the expected outcome briefly"
      labelsPlaceholder="Select labels"
      form={form}
      onSubmit={(event) => event.preventDefault()}
      labelOptions={sampleLabels.map((label) => ({ value: label.id, label: label.name }))}
    />
  )
}

const meta = {
  title: 'Work Items/WorkItemFormModal',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Create: Story = {
  args: {},
  render: () => <WorkItemFormStory mode="create" />,
}

export const Edit: Story = {
  args: {},
  render: () => <WorkItemFormStory mode="edit" />,
}
