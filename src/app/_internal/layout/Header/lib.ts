import { useIntl } from 'react-intl'
import { useHeaderAuth } from './hooks/use-header-auth'
import { useHeaderNavigation } from './hooks/use-header-navigation'
import messages from './messages.json'
import type { HeaderHookProps } from '.'

/**
 * Main hook for Header component
 * Composes multiple specialized hooks for better maintainability
 */
export function useHeaderProps(): HeaderHookProps {
  const intl = useIntl()

  // Authentication management
  const { user, isLoading, isLoggingOut, onLogout } = useHeaderAuth()

  // Navigation and tab management
  const { pathname, createTabChangeHandler } = useHeaderNavigation()

  // Translated aria-labels
  const userMenuAriaLabel = intl.formatMessage(messages.openUserMenu)

  return {
    user,
    isLoading,
    isLoggingOut,
    onLogout,
    pathname,
    createTabChangeHandler,
    userMenuAriaLabel,
  }
}
