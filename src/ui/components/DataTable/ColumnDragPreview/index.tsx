'use client'

/**
 * ColumnDragPreview - visual preview shown in DragOverlay when dragging a column.
 *
 * Layout matches ResizableColumn: [Label] ... [Drag Handle]
 */

import { ActionIcon, Box, Group, Text } from '@mantine/core'
import { IconGripVertical } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import styles from '../styles.module.css'

export type ColumnDragPreviewProps = {
  /** Column label to display */
  label: ReactNode
}

export function ColumnDragPreview({ label }: ColumnDragPreviewProps) {
  return (
    <Box className={styles.columnDragPreview} aria-hidden="true">
      <Group gap={4} wrap="nowrap" justify="space-between">
        <Text size="sm" fw={500}>
          {label}
        </Text>
        <ActionIcon variant="subtle" size="sm" className={styles.dragHandlePreview}>
          <IconGripVertical size={16} />
        </ActionIcon>
      </Group>
    </Box>
  )
}
