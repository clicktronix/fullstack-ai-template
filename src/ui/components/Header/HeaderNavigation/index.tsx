import { Box, Button, Group, Skeleton } from '@mantine/core'
import { IconChecklist, IconSettings, IconUser } from '@tabler/icons-react'
import Link from 'next/link'
import { memo } from 'react'
import { hasAccess, isOwner, type User } from '@/domain/user/user'
import { TranslationText } from '@/ui/components/TranslationText'
import messages from '../messages.json'
import styles from './styles.module.css'

const iconMap = {
  workItems: IconChecklist,
  settings: IconSettings,
  team: IconUser,
  profile: IconUser,
} satisfies Record<string, typeof IconUser>

type NavigationItem = {
  path: string
  icon: keyof typeof iconMap
  messageKey: 'workItems' | 'settings' | 'team' | 'profile'
  ownerOnly?: boolean
}

const ADMIN_NAVIGATION_ITEMS: NavigationItem[] = [
  { path: '/admin/work-items', icon: 'workItems', messageKey: 'workItems' },
  { path: '/admin/team', icon: 'team', messageKey: 'team', ownerOnly: true },
  { path: '/admin/settings', icon: 'settings', messageKey: 'settings', ownerOnly: true },
]

const MEMBER_NAVIGATION_ITEMS: NavigationItem[] = [
  { path: '/profile', icon: 'profile', messageKey: 'profile' },
]

export type HeaderNavigationProps = {
  user: User | null
  isLoading: boolean
  pathname: string
  createTabChangeHandler: (path: string) => () => void
}

export const HeaderNavigation = memo(function HeaderNavigation({
  user,
  isLoading,
  pathname,
  createTabChangeHandler,
}: HeaderNavigationProps) {
  // Show skeleton while loading to prevent hydration mismatch
  if (isLoading) {
    return (
      <Group gap="xs" className={styles.noShrink}>
        <Skeleton height={30} width={100} radius="sm" />
        <Skeleton height={30} width={100} radius="sm" />
      </Group>
    )
  }

  // No navigation for unauthenticated users
  if (!user) {
    return <div className={styles.spacer} />
  }

  // Show admin navigation on /admin/* routes for users with access, otherwise member navigation.
  const navigationItems = hasAccess(user) ? ADMIN_NAVIGATION_ITEMS : MEMBER_NAVIGATION_ITEMS

  return (
    <Group gap="xs" className={styles.noShrink}>
      {navigationItems.map((item) => {
        // Skip owner-only items for non-owners
        if (item.ownerOnly && !isOwner(user)) {
          return null
        }

        const Icon = iconMap[item.icon]
        const isActive = pathname.startsWith(item.path)

        return (
          <Button
            key={item.path}
            component={Link}
            href={item.path}
            variant={isActive ? 'light' : 'subtle'}
            color={isActive ? undefined : 'gray'}
            leftSection={<Icon size={16} aria-hidden="true" />}
            onClick={createTabChangeHandler(item.path)}
          >
            <Box component="span" visibleFrom="sm">
              <TranslationText {...messages[item.messageKey]} />
            </Box>
          </Button>
        )
      })}
    </Group>
  )
})
