'use client'

import { useCallback, useState } from 'react'
import { useIntl } from 'react-intl'
import type {
  AssistantSuggestion,
  AssistantSuggestionPriority,
} from '@/domain/assistant-suggestion/assistant-suggestion'
import type { WorkItemStatus } from '@/domain/work-item/work-item'
import { useGenerateAssistantSuggestions } from '@/ui/server-state/assistant-suggestions/mutations'
import messages from './messages.json'

export type AssistantSuggestionsPanelProps = {
  status: WorkItemStatus
  search?: string
  labelId?: string | null
  priorityOnly?: boolean
}

export type AssistantSuggestionsPanelViewProps = {
  context: string
  suggestions: AssistantSuggestion[]
  isSubmitting: boolean
  description: string
  contextLabel: string
  contextPlaceholder: string
  generateLabel: string
  emptyLabel: string
  priorityLabelByValue: Record<AssistantSuggestionPriority, string>
  onContextChange: (value: string) => void
  onGenerate: () => void
}

export function useAssistantSuggestionsPanelProps({
  status,
  search,
  labelId,
  priorityOnly,
}: AssistantSuggestionsPanelProps): AssistantSuggestionsPanelViewProps {
  const intl = useIntl()
  const [context, setContext] = useState('')
  const mutation = useGenerateAssistantSuggestions()

  const onGenerate = useCallback(() => {
    mutation.mutate({
      status,
      search,
      labelId: labelId ?? undefined,
      priorityOnly,
      additionalContext: context.trim() || null,
    })
  }, [context, labelId, mutation, priorityOnly, search, status])

  return {
    context,
    suggestions: mutation.data?.suggestions ?? [],
    isSubmitting: mutation.isPending,
    description: intl.formatMessage(messages.description),
    contextLabel: intl.formatMessage(messages.contextLabel),
    contextPlaceholder: intl.formatMessage(messages.contextPlaceholder),
    generateLabel: intl.formatMessage(mutation.isPending ? messages.generating : messages.generate),
    emptyLabel: intl.formatMessage(messages.empty),
    priorityLabelByValue: {
      high: intl.formatMessage(messages.highPriority),
      medium: intl.formatMessage(messages.mediumPriority),
      low: intl.formatMessage(messages.lowPriority),
    },
    onContextChange: setContext,
    onGenerate,
  }
}
