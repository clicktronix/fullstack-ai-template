import { Box, Button, Stack, Text, ThemeIcon } from '@mantine/core'
import { IconDatabaseOff } from '@tabler/icons-react'
import type { MessageDescriptor } from 'react-intl'
import { TranslationText } from '@/ui/components/TranslationText'
import styles from './styles.module.css'

type TableEmptyStateAction = {
  /** Текст кнопки (IntlMessage) */
  label: MessageDescriptor
  /** Обработчик нажатия */
  onClick: () => void
}

type TableEmptyStateProps = {
  /** Сообщение для отображения (IntlMessage) */
  message: MessageDescriptor
  /** Дополнительное описание под основным сообщением (IntlMessage) */
  description?: MessageDescriptor
  /** CTA-кнопка действия */
  action?: TableEmptyStateAction
}

/**
 * TableEmptyState - Компонент пустого состояния для таблиц.
 *
 * Отображает центрированное сообщение с иконкой когда в таблице нет данных.
 * Опционально показывает описание и кнопку действия.
 */
export function TableEmptyState({ message, description, action }: TableEmptyStateProps) {
  return (
    <Box className={styles.emptyState}>
      <ThemeIcon size={56} radius="xl" variant="default">
        <IconDatabaseOff size={28} />
      </ThemeIcon>
      <Stack gap={4} align="center">
        <Text mt="md" size="sm" ta="center">
          <TranslationText {...message} />
        </Text>
        {description && (
          <Text c="dimmed" size="xs" ta="center">
            <TranslationText {...description} />
          </Text>
        )}
      </Stack>
      {action && (
        <Button variant="light" mt="md" onClick={action.onClick}>
          <TranslationText {...action.label} />
        </Button>
      )}
    </Box>
  )
}
