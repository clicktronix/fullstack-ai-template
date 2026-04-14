import { Box, Text } from '@mantine/core'
import type { ReactNode } from 'react'
import type { MessageDescriptor } from 'react-intl'
import { TranslationText } from '@/ui/components/TranslationText'
import styles from './styles.module.css'

type ViewSectionProps = {
  title: MessageDescriptor
  children: ReactNode
}

export function ViewSection({ title, children }: ViewSectionProps) {
  return (
    <Box className={styles.section}>
      <Text className={styles.sectionTitle}>
        <TranslationText {...title} />
      </Text>
      {children}
    </Box>
  )
}
