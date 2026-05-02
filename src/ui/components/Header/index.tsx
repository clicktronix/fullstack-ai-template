'use client'

import { Box } from '@mantine/core'
import type { User } from '@/domain/user/user'
import { composeHooks } from '@/ui/hooks/compose-hooks'
import { HeaderNavigation } from './HeaderNavigation'
import { HeaderUserMenu } from './HeaderUserMenu'
import { useHeaderProps } from './lib'
import styles from './styles.module.css'

export type HeaderHookProps = {
  user: User | null
  isLoading: boolean
  isLoggingOut: boolean
  pathname: string
  onLogout: () => void
  createTabChangeHandler: (path: string) => () => void
  userMenuAriaLabel: string
}

export function HeaderView({
  user,
  isLoading,
  isLoggingOut,
  onLogout,
  pathname,
  createTabChangeHandler,
  userMenuAriaLabel,
}: HeaderHookProps) {
  return (
    <Box className={styles.root}>
      <Box className={styles.inner}>
        <HeaderNavigation
          user={user}
          isLoading={isLoading}
          pathname={pathname}
          createTabChangeHandler={createTabChangeHandler}
        />

        <HeaderUserMenu
          user={user}
          isLoading={isLoading}
          isLoggingOut={isLoggingOut}
          onLogout={onLogout}
          userMenuAriaLabel={userMenuAriaLabel}
        />
      </Box>
    </Box>
  )
}

export const Header = composeHooks<HeaderHookProps, Record<string, never>>(HeaderView)(
  useHeaderProps
)
