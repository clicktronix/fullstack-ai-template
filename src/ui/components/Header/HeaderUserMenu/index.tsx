import { Button, Group, Menu, Skeleton, Text, UnstyledButton } from '@mantine/core'
import { IconLogout, IconUser } from '@tabler/icons-react'
import Link from 'next/link'
import { memo } from 'react'
import { getUserDisplayName, getUserInitials, type User } from '@/domain/user/user'
import { Avatar } from '@/ui/components/Avatar'
import { LocaleSelector } from '@/ui/components/LocaleSelector'
import { ThemeToggle } from '@/ui/components/ThemeToggle'
import { TranslationText } from '@/ui/components/TranslationText'
import type { Locale } from '@/ui/providers/LocaleContext'
import messages from '../messages.json'
import styles from './styles.module.css'

export type HeaderUserMenuProps = {
  user: User | null
  isLoading: boolean
  isLoggingOut: boolean
  onLogout: () => void
  locale: Locale
  setLocale: (locale: Locale) => void
  userMenuAriaLabel: string
}

export const HeaderUserMenu = memo(function HeaderUserMenu({
  user,
  isLoading,
  isLoggingOut,
  onLogout,
  locale,
  setLocale,
  userMenuAriaLabel,
}: HeaderUserMenuProps) {
  return (
    <Group gap="md" className={styles.noShrink}>
      <ThemeToggle />

      {isLoading ? (
        <Skeleton circle height={38} width={38} />
      ) : user ? (
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <UnstyledButton
              className={styles.clickable}
              aria-label={userMenuAriaLabel}
              data-testid="user-menu-trigger"
            >
              <Avatar alt={getUserDisplayName(user)} radius="xl" size="md">
                {getUserInitials(user)}
              </Avatar>
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>
              <Text size="sm" fw={500} truncate="end">
                {getUserDisplayName(user)}
              </Text>
              <Text size="xs" c="dimmed" truncate="end">
                {user.email}
              </Text>
            </Menu.Label>

            <Menu.Divider />

            <Menu.Label>
              <TranslationText {...messages.application} />
            </Menu.Label>
            <Menu.Item
              component={Link}
              href="/profile"
              leftSection={<IconUser size={14} aria-hidden="true" />}
            >
              <TranslationText {...messages.profile} />
            </Menu.Item>

            <Menu.Divider />

            <Menu.Label>
              <TranslationText {...messages.settings} />
            </Menu.Label>
            <LocaleSelector locale={locale} setLocale={setLocale} />

            <Menu.Divider />

            <Menu.Item
              onClick={onLogout}
              leftSection={<IconLogout size={14} aria-hidden="true" />}
              color="red"
              disabled={isLoggingOut}
              data-testid="user-menu-logout"
            >
              <TranslationText {...messages.logout} />
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ) : (
        <Button component={Link} href="/login" variant="filled">
          <TranslationText {...messages.signIn} />
        </Button>
      )}
    </Group>
  )
})
