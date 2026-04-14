/**
 * Hook for ActionPopover component.
 *
 * Resolves aria labels using intl, falling back to localized defaults.
 */

import { useIntl } from 'react-intl'
import messages from './messages.json'

type ActionPopoverProps = {
  cancelAriaLabel?: string
  confirmAriaLabel?: string
}

type ActionPopoverHookResult = {
  resolvedCancelAriaLabel: string
  resolvedConfirmAriaLabel: string
}

export function useActionPopoverProps({
  cancelAriaLabel,
  confirmAriaLabel,
}: ActionPopoverProps): ActionPopoverHookResult {
  const intl = useIntl()

  const resolvedCancelAriaLabel = cancelAriaLabel ?? intl.formatMessage(messages.cancelAriaLabel)
  const resolvedConfirmAriaLabel = confirmAriaLabel ?? intl.formatMessage(messages.confirmAriaLabel)

  return {
    resolvedCancelAriaLabel,
    resolvedConfirmAriaLabel,
  }
}
