import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { AssistantSuggestionsPanelView } from './index'

const meta = {
  title: 'Work Items/AssistantSuggestionsPanel',
  component: AssistantSuggestionsPanelView,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof AssistantSuggestionsPanelView>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    context: '',
    suggestions: [],
    isSubmitting: false,
    description: 'Small AI-flavored flow with a deterministic local fallback.',
    contextLabel: 'Additional context',
    contextPlaceholder: 'For example, we need to ship onboarding this week',
    generateLabel: 'Generate suggestions',
    emptyLabel: 'Run the assistant to get a few concrete next-step recommendations.',
    priorityLabelByValue: {
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    },
    onContextChange: () => {},
    onGenerate: () => {},
  },
}

export const WithSuggestions: Story = {
  args: {
    ...Default.args,
    context: 'Need to stabilize onboarding before Friday.',
    suggestions: [
      {
        id: 'suggestion-1',
        title: 'Prioritize onboarding stabilization',
        summary:
          'Move the onboarding item into the priority lane and keep the Product label attached.',
        priority: 'high',
      },
      {
        id: 'suggestion-2',
        title: 'Add labels before archiving',
        summary:
          'Make sure unlabeled work is classified before archiving so future teams can filter it.',
        priority: 'medium',
      },
    ],
  },
}
