import { useIntl } from 'react-intl'
import type { MessageDescriptor } from 'react-intl'

type ActionIconButtonHookProps = {
  tooltip: string | MessageDescriptor
}

function isMessageDescriptor(value: string | MessageDescriptor): value is MessageDescriptor {
  return typeof value === 'object' && 'id' in value
}

export function useActionIconButtonProps({ tooltip }: ActionIconButtonHookProps) {
  const intl = useIntl()
  const tooltipText = isMessageDescriptor(tooltip) ? intl.formatMessage(tooltip) : tooltip

  return { tooltipText }
}
