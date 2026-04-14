'use client'

import { Modal, Stack, Switch, Group, Button, Tabs } from '@mantine/core'
import { IconSettings, IconColumns } from '@tabler/icons-react'
import { TranslationText } from '@/ui/components/TranslationText'
import messages from '../messages.json'
import type { TableSettingsProps, TableSettingsViewProps } from './lib'
import { useTableSettingsProps } from './lib'

export function TableSettingsView<T>({
  opened,
  onClose,
  columns,
  config,
  visibleColumnSet,
  onReset,
  handleStripedChange,
  handleHighlightOnHoverChange,
  handleWithColumnBordersChange,
  createToggleColumnHandler,
}: TableSettingsViewProps<T>) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<TranslationText {...messages.tableSettings} />}
      size="lg"
    >
      <Stack gap="lg" pt="md">
        <Tabs defaultValue="general">
          <Tabs.List mb="lg">
            <Tabs.Tab value="general" leftSection={<IconSettings size={16} aria-hidden="true" />}>
              <TranslationText {...messages.generalTab} />
            </Tabs.Tab>
            <Tabs.Tab value="columns" leftSection={<IconColumns size={16} aria-hidden="true" />}>
              <TranslationText {...messages.columnsTab} />
            </Tabs.Tab>
          </Tabs.List>

          {/* General Tab */}
          <Tabs.Panel value="general">
            <Stack gap="md">
              <Switch
                label={<TranslationText {...messages.stripedRows} />}
                checked={config.striped ?? true}
                onChange={handleStripedChange}
              />
              <Switch
                label={<TranslationText {...messages.highlightOnHover} />}
                checked={config.highlightOnHover ?? true}
                onChange={handleHighlightOnHoverChange}
              />
              <Switch
                label={<TranslationText {...messages.showColumnGrid} />}
                checked={config.withColumnBorders ?? false}
                onChange={handleWithColumnBordersChange}
              />
            </Stack>
          </Tabs.Panel>

          {/* Columns Tab */}
          <Tabs.Panel value="columns">
            <Stack gap="md">
              {columns.map((col) => {
                const isRequired = !!col.required
                const isVisible = isRequired || visibleColumnSet.has(col.key)

                return (
                  <Switch
                    key={col.key}
                    label={col.settingsLabel ?? col.label}
                    checked={isVisible}
                    disabled={isRequired}
                    onChange={isRequired ? undefined : createToggleColumnHandler(col.key)}
                  />
                )
              })}
            </Stack>
          </Tabs.Panel>
        </Tabs>

        {/* Actions */}
        <Group justify="space-between" mt="md">
          <Button variant="default" onClick={onReset}>
            <TranslationText {...messages.resetToDefault} />
          </Button>
          <Button variant="default" onClick={onClose}>
            <TranslationText {...messages.close} />
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

// Does not use composeHooks: generic <T> cannot be preserved through composeHooks.
export function TableSettings<T>(props: TableSettingsProps<T>) {
  const viewProps = useTableSettingsProps(props)
  return <TableSettingsView {...viewProps} />
}
