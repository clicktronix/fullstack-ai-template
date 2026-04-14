'use client'

import { Group, Pagination, Text } from '@mantine/core'
import styles from '../styles.module.css'

export type TablePaginationProps = {
  pageInfoText: string
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
  ariaLabel: string
}

/**
 * Компонент пагинации для DataTable.
 * Отображает информацию о текущей странице и элементы навигации.
 */
export function TablePagination({
  pageInfoText,
  totalPages,
  currentPage,
  onPageChange,
  ariaLabel,
}: TablePaginationProps) {
  return (
    <nav data-testid="table-pagination" aria-label={ariaLabel} className={styles.paginationBar}>
      <Group justify="space-between" align="center">
        <Text size="sm" c="dimmed">
          {pageInfoText}
        </Text>
        <Pagination total={totalPages} value={currentPage} onChange={onPageChange} size="sm" />
      </Group>
    </nav>
  )
}
