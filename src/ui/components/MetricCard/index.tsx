import { Box, Text } from '@mantine/core'
import type { ReactNode } from 'react'
import type { MessageDescriptor } from 'react-intl'
import { TranslationText } from '@/ui/components/TranslationText'
import styles from './styles.module.css'

type MetricCardProps = {
  value: ReactNode
  label: MessageDescriptor | ReactNode
}

function isMessageDescriptor(label: unknown): label is MessageDescriptor {
  return (
    typeof label === 'object' &&
    label !== null &&
    'id' in label &&
    'defaultMessage' in label &&
    typeof (label as MessageDescriptor).id === 'string' &&
    typeof (label as MessageDescriptor).defaultMessage === 'string'
  )
}

export function MetricCard({ value, label }: MetricCardProps) {
  return (
    <Box className={styles.card}>
      <Text className={styles.value}>{value}</Text>
      <Text className={styles.label}>
        {isMessageDescriptor(label) ? <TranslationText {...label} /> : label}
      </Text>
    </Box>
  )
}
