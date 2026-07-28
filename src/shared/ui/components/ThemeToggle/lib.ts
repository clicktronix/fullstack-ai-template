import { useComputedColorScheme, useMantineColorScheme } from '@mantine/core'
import { useMounted } from '@mantine/hooks'
import { useCallback } from 'react'
import { useIntl } from 'react-intl'
import messages from './messages.json'

export function useThemeToggleProps() {
  const intl = useIntl()
  const computedColorScheme = useComputedColorScheme('dark', { getInitialValueInEffect: true })
  const { setColorScheme } = useMantineColorScheme()
  const mounted = useMounted()

  const handleToggle = useCallback(() => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark')
  }, [computedColorScheme, setColorScheme])

  const ariaLabel = intl.formatMessage(messages.toggleTheme)

  return {
    colorScheme: computedColorScheme,
    onToggle: handleToggle,
    ariaLabel,
    mounted,
  }
}
