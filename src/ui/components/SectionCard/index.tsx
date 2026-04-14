import { Card, Title } from '@mantine/core'
import type { MantineSpacing } from '@mantine/core'
import type { ReactNode } from 'react'
import type { MessageDescriptor } from 'react-intl'
import { TranslationText } from '@/ui/components/TranslationText'
import styles from './styles.module.css'

type SectionCardProps = {
  title: MessageDescriptor
  children: ReactNode
  padding?: MantineSpacing
  variant?: 'normal' | 'compact'
}

export function SectionCard({
  title,
  children,
  padding = 'lg',
  variant = 'normal',
}: SectionCardProps) {
  return (
    <Card withBorder p={padding}>
      <Title order={4} className={variant === 'compact' ? styles.compactTitle : styles.title}>
        <TranslationText {...title} />
      </Title>
      {children}
    </Card>
  )
}
