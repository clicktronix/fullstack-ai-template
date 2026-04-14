'use client'

import { ActionIcon, Group, Menu, Table } from '@mantine/core'
import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react'
import { memo } from 'react'
import styles from '../styles.module.css'
import type { RowActionsCellProps } from './interfaces'
import { useRowActionsCellProps } from './lib'

/**
 * Cell component for row actions in DataTable.
 *
 * Supports two modes:
 * 1. **RowActions mode** - Dropdown menu with custom actions
 * 2. **Default mode** - Edit/Delete buttons
 *
 * NOTE: Does not use composeHooks because the component is generic (<T>).
 * composeHooks cannot preserve generic type parameters, so we call the hook directly.
 *
 * @template T - Type of the data item
 */
function RowActionsCellInner<T>({ item, actionsConfig, ariaLabels }: RowActionsCellProps<T>) {
  const { actionsWidth, rowActions, onEdit, onDelete } = actionsConfig
  const { handleMenuTargetClick, handleEditClick, handleDeleteClick, createActionClickHandler } =
    useRowActionsCellProps({ item, actionsConfig, ariaLabels })

  // RowActions mode - dropdown menu with custom actions
  if (rowActions && rowActions.length > 0) {
    return (
      <Table.Td className={styles.actionsCell} w={actionsWidth} miw={actionsWidth}>
        <Menu position="bottom-end" withArrow>
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              onClick={handleMenuTargetClick}
              aria-label={ariaLabels.rowActions}
            >
              <IconDotsVertical size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            {rowActions
              .filter((action) => !action.hidden?.(item))
              .map((action) => (
                <Menu.Item
                  key={action.key}
                  leftSection={action.icon}
                  color={action.color}
                  disabled={action.disabled?.(item)}
                  onClick={createActionClickHandler(action)}
                >
                  {action.label}
                </Menu.Item>
              ))}
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    )
  }

  // Default mode - Edit/Delete buttons
  return (
    <Table.Td className={styles.actionsCell} w={actionsWidth} miw={actionsWidth}>
      <Group gap="xs" justify="flex-end">
        {onEdit && (
          <ActionIcon
            variant="transparent"
            className={styles.actionIconEdit}
            onClick={handleEditClick}
            aria-label={ariaLabels.edit}
          >
            <IconEdit size={16} />
          </ActionIcon>
        )}
        {onDelete && (
          <ActionIcon
            variant="transparent"
            className={styles.actionIconDelete}
            onClick={handleDeleteClick}
            aria-label={ariaLabels.delete}
          >
            <IconTrash size={16} />
          </ActionIcon>
        )}
      </Group>
    </Table.Td>
  )
}

export const RowActionsCell = memo(RowActionsCellInner) as typeof RowActionsCellInner
