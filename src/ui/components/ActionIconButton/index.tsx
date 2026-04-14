import { ActionIcon, Tooltip, type ActionIconProps } from '@mantine/core'
import type { ReactNode } from 'react'
import type { MessageDescriptor } from 'react-intl'
import { composeHooks } from '@/ui/hooks/compose-hooks'
import { useActionIconButtonProps } from './lib'

type ActionIconButtonViewProps = Omit<ActionIconProps, 'children'> & {
  icon: ReactNode
  tooltipText: string
  tooltip: string | MessageDescriptor
  onClick?: () => void
}

type ActionIconButtonProps = Omit<ActionIconProps, 'children'> & {
  icon: ReactNode
  tooltip: string | MessageDescriptor
  onClick?: () => void
}

export function ActionIconButtonView({
  icon,
  tooltipText,
  onClick,
  variant = 'subtle',
  ...rest
}: ActionIconButtonViewProps) {
  return (
    <Tooltip label={tooltipText} openDelay={250}>
      <ActionIcon variant={variant} onClick={onClick} aria-label={tooltipText} {...rest}>
        {icon}
      </ActionIcon>
    </Tooltip>
  )
}

/**
 * ActionIconButton - Icon button with tooltip.
 *
 * Features:
 * - Accepts string or MessageDescriptor for tooltip
 * - Automatic intl formatting for MessageDescriptor tooltips
 * - Configurable ActionIcon variant (default: subtle)
 */
export const ActionIconButton = composeHooks<ActionIconButtonViewProps, ActionIconButtonProps>(
  ActionIconButtonView
)(useActionIconButtonProps)
