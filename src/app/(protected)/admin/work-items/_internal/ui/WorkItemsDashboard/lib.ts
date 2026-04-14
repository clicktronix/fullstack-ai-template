'use client'

import { useDisclosure } from '@mantine/hooks'
import { useCallback, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import type { Label } from '@/domain/label/label'
import type {
  CreateWorkItem,
  UpdateWorkItem,
  WorkItem,
  WorkItemStatus,
} from '@/domain/work-item/work-item'
import { notifications } from '@/lib/mantine-notifications'
import { useLabels } from '@/ui/server-state/labels/queries'
import {
  useArchiveWorkItem,
  useCreateWorkItem,
  useRestoreWorkItem,
  useUpdateWorkItem,
} from '@/ui/server-state/work-items/mutations'
import { useWorkItems } from '@/ui/server-state/work-items/queries'
import messages from './messages.json'

export type WorkItemsDashboardProps = {
  status: WorkItemStatus
}

type WorkItemCardViewModel = {
  item: WorkItem
  labelNames: string[]
}

export type WorkItemsDashboardViewProps = {
  status: WorkItemStatus
  title: string
  description: string
  search: string
  selectedLabelId: string | null
  priorityOnly: boolean
  workItemCards: WorkItemCardViewModel[]
  labels: Label[]
  labelOptions: Array<{ value: string; label: string }>
  isLoading: boolean
  isMutating: boolean
  createOpened: boolean
  editOpened: boolean
  editingItem: WorkItem | null
  createButtonLabel: string
  searchPlaceholder: string
  labelFilterPlaceholder: string
  loadingLabel: string
  toggleArchiveHref: string
  toggleArchiveLabel: string
  formatUpdatedAt: (value: string) => string
  formatStatusLabel: (status: WorkItemStatus) => string
  onSearchChange: (value: string) => void
  onLabelFilterChange: (value: string | null) => void
  onPriorityToggle: (value: boolean) => void
  onOpenCreate: () => void
  onCloseCreate: () => void
  onCloseEdit: () => void
  onStartEdit: (item: WorkItem) => void
  onArchive: (id: string) => void
  onRestore: (id: string) => void
  onCreateSubmit: (values: CreateWorkItem | UpdateWorkItem) => Promise<void>
  onEditSubmit: (values: CreateWorkItem | UpdateWorkItem) => Promise<void>
}

export function useWorkItemsDashboardProps({
  status,
}: WorkItemsDashboardProps): WorkItemsDashboardViewProps {
  const intl = useIntl()
  const [search, setSearch] = useState('')
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null)
  const [priorityOnly, setPriorityOnly] = useState(false)
  const [editingItem, setEditingItem] = useState<WorkItem | null>(null)
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false)
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false)

  const { data: labels = [] } = useLabels()
  const createMutation = useCreateWorkItem()
  const updateMutation = useUpdateWorkItem()
  const archiveMutation = useArchiveWorkItem()
  const restoreMutation = useRestoreWorkItem()

  const { data, isPending } = useWorkItems({
    status,
    search: search.trim() || undefined,
    labelId: selectedLabelId ?? undefined,
    priorityOnly: priorityOnly || undefined,
    page: 1,
    pageSize: 20,
  })

  const labelMap = useMemo(
    () => new Map(labels.map((label) => [label.id, label.name] as const)),
    [labels]
  )

  const workItemCards = useMemo(
    () =>
      (data?.items ?? []).map((item) => ({
        item,
        labelNames: item.label_ids
          .map((labelId) => labelMap.get(labelId))
          .filter(Boolean) as string[],
      })),
    [data?.items, labelMap]
  )

  const labelOptions = useMemo(
    () => labels.map((label) => ({ value: label.id, label: label.name })),
    [labels]
  )

  const showSuccess = useCallback(
    (message: string) => {
      notifications.show({
        color: 'green',
        title: intl.formatMessage(messages.title),
        message,
      })
    },
    [intl]
  )

  const onStartEdit = useCallback(
    (item: WorkItem) => {
      setEditingItem(item)
      openEdit()
    },
    [openEdit]
  )

  const onCreateSubmit = useCallback(
    async (values: CreateWorkItem | UpdateWorkItem) => {
      await createMutation.mutateAsync(values as CreateWorkItem)
      showSuccess(intl.formatMessage(messages.create))
      closeCreate()
    },
    [closeCreate, createMutation, intl, showSuccess]
  )

  const onEditSubmit = useCallback(
    async (values: CreateWorkItem | UpdateWorkItem) => {
      if (!editingItem) return
      await updateMutation.mutateAsync({ id: editingItem.id, input: values })
      showSuccess(intl.formatMessage(messages.edit))
      closeEdit()
      setEditingItem(null)
    },
    [closeEdit, editingItem, intl, showSuccess, updateMutation]
  )

  const onArchive = useCallback(
    (id: string) => {
      archiveMutation.mutate(id)
    },
    [archiveMutation]
  )

  const onRestore = useCallback(
    (id: string) => {
      restoreMutation.mutate(id)
    },
    [restoreMutation]
  )

  const formatUpdatedAt = useCallback(
    (value: string) =>
      intl.formatMessage(messages.updatedAt, { value: new Date(value).toLocaleString() }),
    [intl]
  )

  return {
    status,
    title: intl.formatMessage(messages.title),
    description:
      status === 'active'
        ? intl.formatMessage(messages.description)
        : intl.formatMessage(messages.archivedDescription),
    search,
    selectedLabelId,
    priorityOnly,
    workItemCards,
    labels,
    labelOptions,
    isLoading: isPending,
    isMutating:
      createMutation.isPending ||
      updateMutation.isPending ||
      archiveMutation.isPending ||
      restoreMutation.isPending,
    createOpened,
    editOpened,
    editingItem,
    createButtonLabel: intl.formatMessage(messages.create),
    searchPlaceholder: intl.formatMessage(messages.searchPlaceholder),
    labelFilterPlaceholder: intl.formatMessage(messages.labelFilterPlaceholder),
    loadingLabel: intl.formatMessage(messages.loading),
    toggleArchiveHref: status === 'active' ? '/admin/work-items/archived' : '/admin/work-items',
    toggleArchiveLabel:
      status === 'active'
        ? intl.formatMessage(messages.showArchived)
        : intl.formatMessage(messages.showActive),
    formatUpdatedAt,
    formatStatusLabel: (value) =>
      value === 'active'
        ? intl.formatMessage(messages.statusActive)
        : intl.formatMessage(messages.statusArchived),
    onSearchChange: setSearch,
    onLabelFilterChange: setSelectedLabelId,
    onPriorityToggle: setPriorityOnly,
    onOpenCreate: openCreate,
    onCloseCreate: closeCreate,
    onCloseEdit: () => {
      closeEdit()
      setEditingItem(null)
    },
    onStartEdit,
    onArchive,
    onRestore,
    onCreateSubmit,
    onEditSubmit,
  }
}
