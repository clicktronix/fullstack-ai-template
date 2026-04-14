'use client'

import { Group, UnstyledButton } from '@mantine/core'
import type { PlatformToggleGroupProps } from './interfaces'
import styles from './styles.module.css'

export function PlatformToggleGroup({ items, selectedValues, onToggle }: PlatformToggleGroupProps) {
  return (
    <Group gap={4} className={styles.group}>
      {items.map((item) => {
        const isSelected = selectedValues.includes(item.value)

        return (
          <UnstyledButton
            key={item.value}
            type="button"
            className={styles.button}
            data-selected={isSelected || undefined}
            aria-pressed={isSelected}
            onClick={() => onToggle(item.value)}
          >
            <span className={styles.label}>{item.label}</span>
          </UnstyledButton>
        )
      })}
    </Group>
  )
}
