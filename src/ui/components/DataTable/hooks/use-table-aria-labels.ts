import { useMemo } from 'react'
import { useIntl } from 'react-intl'
import type { ActionAriaLabels } from '../interfaces'
import messages from '../messages.json'

type UseTableAriaLabelsResult = {
  /** Локализованное сообщение для пустой таблицы */
  defaultEmptyMessage: string
  /** Локализованный label для колонки действий */
  defaultActionsLabel: string
  /** Сгруппированные aria-labels для action кнопок */
  ariaLabels: ActionAriaLabels
  /** Aria-label для кнопки обновления */
  refreshAriaLabel: string
  /** Aria-label для кнопки настроек */
  settingsAriaLabel: string
}

/**
 * Хук для вычисления всех локализованных строк и aria-labels таблицы.
 * Централизует вызовы intl.formatMessage для уменьшения дублирования.
 */
export function useTableAriaLabels(): UseTableAriaLabelsResult {
  const intl = useIntl()

  return useMemo(() => {
    const defaultEmptyMessage = intl.formatMessage(messages.emptyMessage)
    const defaultActionsLabel = intl.formatMessage(messages.actionsLabel)

    const ariaLabels: ActionAriaLabels = {
      edit: intl.formatMessage(messages.editLabel),
      delete: intl.formatMessage(messages.deleteLabel),
      rowActions: intl.formatMessage(messages.rowActionsLabel),
    }

    const refreshAriaLabel = intl.formatMessage(messages.refreshLabel)
    const settingsAriaLabel = intl.formatMessage(messages.settingsLabel)

    return {
      defaultEmptyMessage,
      defaultActionsLabel,
      ariaLabels,
      refreshAriaLabel,
      settingsAriaLabel,
    }
  }, [intl])
}
