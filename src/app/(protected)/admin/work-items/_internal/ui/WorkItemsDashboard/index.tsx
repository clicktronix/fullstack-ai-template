'use client'

import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core'
import { IconArchive, IconEdit, IconEye, IconPlus, IconRestore } from '@tabler/icons-react'
import Link from 'next/link'
import { AssistantSuggestionsPanel } from '@/app/(protected)/admin/work-items/_internal/ui/AssistantSuggestionsPanel'
import { LabelsPanel } from '@/app/(protected)/admin/work-items/_internal/ui/LabelsPanel'
import { WorkItemFormModal } from '@/app/(protected)/admin/work-items/_internal/ui/WorkItemFormModal'
import { SectionCard } from '@/ui/components/SectionCard'
import { TranslationText } from '@/ui/components/TranslationText'
import { composeHooks } from '@/ui/hooks/compose-hooks'
import type { WorkItemsDashboardProps, WorkItemsDashboardViewProps } from './lib'
import { useWorkItemsDashboardProps } from './lib'
import messages from './messages.json'
import styles from './styles.module.css'

export function WorkItemsDashboardView({
  status,
  title,
  description,
  search,
  selectedLabelId,
  priorityOnly,
  workItemCards,
  labels,
  labelOptions,
  isLoading,
  isMutating,
  createOpened,
  editOpened,
  editingItem,
  createButtonLabel,
  searchPlaceholder,
  labelFilterPlaceholder,
  loadingLabel,
  toggleArchiveHref,
  toggleArchiveLabel,
  formatUpdatedAt,
  formatStatusLabel,
  onSearchChange,
  onLabelFilterChange,
  onPriorityToggle,
  onOpenCreate,
  onCloseCreate,
  onCloseEdit,
  onStartEdit,
  onArchive,
  onRestore,
  onCreateSubmit,
  onEditSubmit,
}: WorkItemsDashboardViewProps) {
  return (
    <>
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start">
          <Stack gap={4}>
            <Text fw={700} fz="h1">
              {title}
            </Text>
            <Text c="dimmed">{description}</Text>
          </Stack>

          <Group gap="sm">
            <Button component={Link} href={toggleArchiveHref} variant="default">
              {toggleArchiveLabel}
            </Button>
            {status === 'active' ? (
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={onOpenCreate}
                data-testid="work-items-create-btn"
              >
                {createButtonLabel}
              </Button>
            ) : null}
          </Group>
        </Group>

        <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="lg">
          <Box className={styles.primaryColumn}>
            <SectionCard title={messages.itemsSection}>
              <Stack gap="md">
                <Group align="end" grow>
                  <TextInput
                    label={<TranslationText {...messages.searchLabel} />}
                    placeholder={searchPlaceholder}
                    value={search}
                    onChange={(event) => onSearchChange(event.currentTarget.value)}
                    data-testid="work-items-search"
                  />

                  <Select
                    label={<TranslationText {...messages.labelFilter} />}
                    placeholder={labelFilterPlaceholder}
                    value={selectedLabelId}
                    onChange={onLabelFilterChange}
                    data={labelOptions}
                    clearable
                    data-testid="work-items-label-filter"
                  />
                </Group>

                <Switch
                  label={<TranslationText {...messages.priorityOnly} />}
                  checked={priorityOnly}
                  onChange={(event) => onPriorityToggle(event.currentTarget.checked)}
                  data-testid="work-items-priority-filter"
                />

                {workItemCards.length > 0 ? (
                  <Stack gap="sm">
                    {workItemCards.map(({ item, labelNames }) => (
                      <Card key={item.id} withBorder radius="md" p="lg">
                        <Stack gap="sm">
                          <Group justify="space-between" align="flex-start">
                            <Stack gap={4}>
                              <Text fw={600}>{item.title}</Text>
                              <Text size="sm" c="dimmed">
                                {formatUpdatedAt(item.updated_at)}
                              </Text>
                            </Stack>

                            <Group gap="xs">
                              <Button
                                component={Link}
                                href={`/admin/work-items/${item.id}`}
                                variant="subtle"
                                size="compact-sm"
                                leftSection={<IconEye size={14} />}
                              >
                                <TranslationText {...messages.details} />
                              </Button>
                              <Button
                                variant="subtle"
                                size="compact-sm"
                                leftSection={<IconEdit size={14} />}
                                onClick={() => onStartEdit(item)}
                              >
                                <TranslationText {...messages.edit} />
                              </Button>
                              {item.status === 'active' ? (
                                <Button
                                  variant="subtle"
                                  color="gray"
                                  size="compact-sm"
                                  leftSection={<IconArchive size={14} />}
                                  onClick={() => onArchive(item.id)}
                                >
                                  <TranslationText {...messages.archive} />
                                </Button>
                              ) : (
                                <Button
                                  variant="subtle"
                                  color="green"
                                  size="compact-sm"
                                  leftSection={<IconRestore size={14} />}
                                  onClick={() => onRestore(item.id)}
                                >
                                  <TranslationText {...messages.restore} />
                                </Button>
                              )}
                            </Group>
                          </Group>

                          {item.description ? <Text size="sm">{item.description}</Text> : null}

                          <Group gap="xs">
                            <Badge variant="light">{formatStatusLabel(item.status)}</Badge>
                            {item.is_priority ? (
                              <Badge variant="filled" color="orange">
                                <TranslationText {...messages.priorityBadge} />
                              </Badge>
                            ) : null}
                            {labelNames.map((labelName) => (
                              <Badge key={`${item.id}-${labelName}`} variant="dot">
                                {labelName}
                              </Badge>
                            ))}
                          </Group>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Text size="sm" c="dimmed">
                    <TranslationText {...messages.empty} />
                  </Text>
                )}

                {isLoading || isMutating ? (
                  <Text size="sm" c="dimmed">
                    {loadingLabel}
                  </Text>
                ) : null}
              </Stack>
            </SectionCard>
          </Box>

          <Stack gap="lg">
            <AssistantSuggestionsPanel
              status={status}
              search={search.trim() || undefined}
              labelId={selectedLabelId}
              priorityOnly={priorityOnly}
            />
            <LabelsPanel labels={labels} />
          </Stack>
        </SimpleGrid>
      </Stack>

      <WorkItemFormModal
        opened={createOpened}
        mode="create"
        labels={labels}
        isSubmitting={isMutating}
        onClose={onCloseCreate}
        onSubmitItem={onCreateSubmit}
      />

      <WorkItemFormModal
        opened={editOpened}
        mode="edit"
        workItem={editingItem}
        labels={labels}
        isSubmitting={isMutating}
        onClose={onCloseEdit}
        onSubmitItem={onEditSubmit}
      />
    </>
  )
}

export const WorkItemsDashboard = composeHooks<
  WorkItemsDashboardViewProps,
  WorkItemsDashboardProps
>(WorkItemsDashboardView)(useWorkItemsDashboardProps)
