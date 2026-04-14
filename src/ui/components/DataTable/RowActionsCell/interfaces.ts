import type { ActionAriaLabels, ActionsConfig } from '../interfaces'

/**
 * Props for the RowActionsCell component
 * @template T - Type of the data item
 */
export type RowActionsCellProps<T> = {
  /** Data item for the current row */
  item: T
  /** Grouped actions configuration */
  actionsConfig: ActionsConfig<T>
  /** Grouped aria labels for action buttons */
  ariaLabels: ActionAriaLabels
}
