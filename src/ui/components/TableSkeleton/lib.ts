import { useIntl } from 'react-intl'
import messages from './messages.json'
import type { TableSkeletonProps, TableSkeletonViewProps } from './index'

export function useTableSkeletonProps({
  rowCount = 5,
  rowHeight = 40,
}: TableSkeletonProps): TableSkeletonViewProps {
  const intl = useIntl()

  return {
    rowCount,
    rowHeight,
    ariaLabel: intl.formatMessage(messages.loading),
  }
}
