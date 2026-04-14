'use client'

import { ActionIcon, Group, Loader, Text } from '@mantine/core'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'

export type SimplePaginationProps = {
  page: number
  totalPages: number
  total: number
  isFetching?: boolean
  onPageChange: (page: number) => void
  totalItemsFormatter: (count: number) => string
  pageOfFormatter: (page: number, total: number) => string
  previousPageLabel: string
  nextPageLabel: string
  className?: string
}

export function SimplePagination({
  page,
  totalPages,
  total,
  isFetching,
  onPageChange,
  totalItemsFormatter,
  pageOfFormatter,
  previousPageLabel,
  nextPageLabel,
  className,
}: SimplePaginationProps) {
  return (
    <Group justify="space-between" mt="sm" pt="sm" className={className}>
      <Text size="xs" c="dimmed">
        {totalItemsFormatter(total)}
        {isFetching && <Loader size={12} ml="xs" display="inline-block" />}
      </Text>
      {totalPages > 1 && (
        <Group gap="xs">
          <ActionIcon
            size="sm"
            variant="subtle"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label={previousPageLabel}
          >
            <IconChevronLeft size={14} />
          </ActionIcon>
          <Text size="xs" c="dimmed">
            {pageOfFormatter(page, totalPages)}
          </Text>
          <ActionIcon
            size="sm"
            variant="subtle"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label={nextPageLabel}
          >
            <IconChevronRight size={14} />
          </ActionIcon>
        </Group>
      )}
    </Group>
  )
}
