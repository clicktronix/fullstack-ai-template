import { Skeleton, Switch, type MantineColorScheme } from '@mantine/core'
import { IconMoon, IconSun } from '@tabler/icons-react'
import { composeHooks } from '@/ui/hooks/compose-hooks'
import { useThemeToggleProps } from './lib'

export type ThemeToggleViewProps = {
  colorScheme: MantineColorScheme
  onToggle: () => void
  ariaLabel: string
  mounted: boolean
}

export function ThemeToggleView({
  colorScheme,
  onToggle,
  ariaLabel,
  mounted,
}: ThemeToggleViewProps) {
  if (!mounted) {
    return <Skeleton height={24} width={46} radius="xl" />
  }

  return (
    <Switch
      size="md"
      onLabel={<IconSun size={12} aria-hidden="true" />}
      offLabel={<IconMoon size={12} aria-hidden="true" />}
      checked={colorScheme === 'light'}
      onChange={onToggle}
      aria-label={ariaLabel}
    />
  )
}

export const ThemeToggle = composeHooks(ThemeToggleView)(useThemeToggleProps)
