import { useForm } from '@mantine/form'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { Label } from '@/domain/label/label'
import { LabelsPanelView } from './index'

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

function LabelsPanelStory({ editingLabelId }: { editingLabelId: string | null }) {
  const form = useForm({
    initialValues: {
      name: editingLabelId ? 'Product' : '',
      color: editingLabelId ? 'blue' : '',
    },
  })

  return (
    <LabelsPanelView
      labels={sampleLabels}
      form={form}
      editingLabelId={editingLabelId}
      isSubmitting={false}
      namePlaceholder="For example, Product"
      colorPlaceholder="For example, blue"
      createLabelText="Add label"
      saveLabelText="Save label"
      cancelEditText="Cancel"
      onSubmit={(event) => event?.preventDefault()}
      onEdit={() => {}}
      onCancelEdit={() => {}}
      formatEditAriaLabel={(name) => `Edit label: ${name}`}
    />
  )
}

const meta = {
  title: 'Work Items/LabelsPanel',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
  render: () => <LabelsPanelStory editingLabelId={null} />,
}

export const Editing: Story = {
  args: {},
  render: () => <LabelsPanelStory editingLabelId="label-1" />,
}
