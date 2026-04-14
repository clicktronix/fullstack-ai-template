import { Box, Text, ThemeIcon } from '@mantine/core'
import { IconAlertTriangle, IconFolderOff } from '@tabler/icons-react'
import type { MessageDescriptor } from 'react-intl'
import { TranslationText } from '@/ui/components/TranslationText'
import styles from './styles.module.css'

type GridEmptyStateProps = {
  title: MessageDescriptor
  description?: MessageDescriptor
  variant?: 'empty' | 'error'
}

export function GridEmptyState({ title, description, variant = 'empty' }: GridEmptyStateProps) {
  const isError = variant === 'error'

  return (
    <Box className={styles.container} role={isError ? 'alert' : undefined}>
      <ThemeIcon
        size={56}
        radius="xl"
        variant={isError ? 'light' : 'default'}
        color={isError ? 'red' : undefined}
      >
        {isError ? <IconAlertTriangle size={28} /> : <IconFolderOff size={28} />}
      </ThemeIcon>
      <Text size="md" c={isError ? 'red' : undefined} ta="center" fw={500}>
        <TranslationText {...title} />
      </Text>
      {description && (
        <Text size="sm" c="dimmed" ta="center">
          <TranslationText {...description} />
        </Text>
      )}
    </Box>
  )
}
