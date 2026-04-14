import { ActionIcon, Box, Button, Group, Paper, Table } from '@mantine/core'
import { IconPencil, IconPlus, IconTrash } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import type { MessageDescriptor } from 'react-intl'
import { TableEmptyState } from '@/ui/components/TableEmptyState'
import { TableSkeleton } from '@/ui/components/TableSkeleton'
import { TranslationText } from '@/ui/components/TranslationText'
import styles from './styles.module.css'

export type CrudColumnDef<T> = {
  label: MessageDescriptor
  width?: number
  render: (item: T) => ReactNode
}

type CrudTableProps<T extends { id: string }> = {
  items: T[]
  isLoading: boolean
  columns: CrudColumnDef<T>[]
  emptyMessage: MessageDescriptor
  addLabel: MessageDescriptor
  actionsColumnLabel: MessageDescriptor
  editAriaLabel: string
  deleteAriaLabel: string
  onAdd: () => void
  onEdit: (item: T) => void
  onDelete: (id: string) => void
  modal: ReactNode
}

export function CrudTable<T extends { id: string }>({
  items,
  isLoading,
  columns,
  emptyMessage,
  addLabel,
  actionsColumnLabel,
  editAriaLabel,
  deleteAriaLabel,
  onAdd,
  onEdit,
  onDelete,
  modal,
}: CrudTableProps<T>) {
  if (isLoading) {
    return <TableSkeleton />
  }

  return (
    <>
      <Box className={styles.container}>
        <Box className={styles.header}>
          <Button leftSection={<IconPlus size={16} aria-hidden="true" />} onClick={onAdd}>
            <TranslationText {...addLabel} />
          </Button>
        </Box>

        {items.length === 0 ? (
          <TableEmptyState message={emptyMessage} />
        ) : (
          <Paper className={styles.tableWrapper}>
            <Table striped highlightOnHover horizontalSpacing="md" verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  {columns.map((col) => (
                    <Table.Th key={col.label.id} scope="col" w={col.width}>
                      <TranslationText {...col.label} />
                    </Table.Th>
                  ))}
                  <Table.Th scope="col" w={100}>
                    <TranslationText {...actionsColumnLabel} />
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {items.map((item) => (
                  <Table.Tr key={item.id}>
                    {columns.map((col) => (
                      <Table.Td key={col.label.id}>{col.render(item)}</Table.Td>
                    ))}
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          variant="subtle"
                          onClick={() => onEdit(item)}
                          aria-label={editAriaLabel}
                        >
                          <IconPencil size={16} aria-hidden="true" />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => onDelete(item.id)}
                          aria-label={deleteAriaLabel}
                        >
                          <IconTrash size={16} aria-hidden="true" />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        )}
      </Box>

      {modal}
    </>
  )
}
