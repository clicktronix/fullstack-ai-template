import { useMemo } from 'react'
import { useIntl } from 'react-intl'
import type { PaginationConfig } from '../interfaces'
import messages from '../messages.json'

type UsePaginationInfoInput = {
  pagination?: PaginationConfig
}

type UsePaginationInfoResult = {
  totalPages: number
  showPagination: boolean
  pageInfoText: string
  paginationAriaLabel: string
}

/**
 * Хук для вычисления пагинационных метаданных:
 * общее количество страниц, текст текущей страницы, aria-label.
 */
export function usePaginationInfo({ pagination }: UsePaginationInfoInput): UsePaginationInfoResult {
  const intl = useIntl()

  return useMemo(() => {
    const totalPages = pagination
      ? Math.max(1, Math.ceil(pagination.totalItems / pagination.pageSize))
      : 1
    const showPagination = !!pagination && totalPages > 1

    const pageInfoText = pagination
      ? intl.formatMessage(messages.pageInfo, { current: pagination.page, total: totalPages })
      : ''

    const paginationAriaLabel = intl.formatMessage(messages.paginationLabel)

    return { totalPages, showPagination, pageInfoText, paginationAriaLabel }
  }, [pagination, intl])
}
