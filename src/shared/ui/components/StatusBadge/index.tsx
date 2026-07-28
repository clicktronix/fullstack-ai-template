import { Badge } from '@mantine/core'
import type { MantineColor, MantineSize } from '@mantine/core'
import type { ReactNode } from 'react'
import styles from './styles.module.css'

type StatusBadgeProps = {
  children: ReactNode
  color: MantineColor
  size?: MantineSize
  variant?: 'light' | 'filled' | 'outline'
  leftSection?: ReactNode
}

export function StatusBadge({
  children,
  color,
  size = 'xs',
  variant = 'light',
  leftSection,
}: StatusBadgeProps) {
  return (
    <Badge
      size={size}
      variant={variant}
      color={color}
      leftSection={leftSection}
      className={styles.badge}
    >
      {children}
    </Badge>
  )
}
