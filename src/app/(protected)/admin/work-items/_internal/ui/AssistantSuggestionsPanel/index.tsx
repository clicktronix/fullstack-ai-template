'use client'

import { Badge, Button, Card, Stack, Text, Textarea } from '@mantine/core'
import { IconSparkles } from '@tabler/icons-react'
import { SectionCard } from '@/ui/components/SectionCard'
import { composeHooks } from '@/ui/hooks/compose-hooks'
import type { AssistantSuggestionsPanelProps, AssistantSuggestionsPanelViewProps } from './lib'
import { useAssistantSuggestionsPanelProps } from './lib'
import messages from './messages.json'

function getPriorityColor(priority: 'high' | 'medium' | 'low') {
  if (priority === 'high') return 'red'
  if (priority === 'medium') return 'yellow'
  return 'gray'
}

export function AssistantSuggestionsPanelView({
  context,
  suggestions,
  isSubmitting,
  description,
  contextLabel,
  contextPlaceholder,
  generateLabel,
  emptyLabel,
  priorityLabelByValue,
  onContextChange,
  onGenerate,
}: AssistantSuggestionsPanelViewProps) {
  return (
    <SectionCard title={messages.title}>
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {description}
        </Text>

        <Textarea
          label={contextLabel}
          placeholder={contextPlaceholder}
          value={context}
          onChange={(event) => onContextChange(event.currentTarget.value)}
          minRows={3}
          data-testid="assistant-suggestions-context"
        />

        <Button
          leftSection={<IconSparkles size={16} />}
          onClick={onGenerate}
          loading={isSubmitting}
          data-testid="assistant-suggestions-generate"
        >
          {generateLabel}
        </Button>

        {suggestions.length > 0 ? (
          <Stack gap="sm">
            {suggestions.map((suggestion) => (
              <Card key={suggestion.id} withBorder radius="md" p="md">
                <Stack gap="xs">
                  <Badge
                    variant="light"
                    color={getPriorityColor(suggestion.priority)}
                    w="fit-content"
                  >
                    {priorityLabelByValue[suggestion.priority]}
                  </Badge>
                  <Text fw={600}>{suggestion.title}</Text>
                  {suggestion.summary ? (
                    <Text size="sm" c="dimmed">
                      {suggestion.summary}
                    </Text>
                  ) : null}
                </Stack>
              </Card>
            ))}
          </Stack>
        ) : (
          <Text size="sm" c="dimmed">
            {emptyLabel}
          </Text>
        )}
      </Stack>
    </SectionCard>
  )
}

export const AssistantSuggestionsPanel = composeHooks<
  AssistantSuggestionsPanelViewProps,
  AssistantSuggestionsPanelProps
>(AssistantSuggestionsPanelView)(useAssistantSuggestionsPanelProps)
