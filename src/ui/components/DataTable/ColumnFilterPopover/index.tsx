'use client'

import { ActionIcon, Center, SegmentedControl, Stack, Text } from '@mantine/core'
import { IconArrowDown, IconArrowUp, IconFilter, IconMinus } from '@tabler/icons-react'
import { ActionPopover } from '@/ui/components/ActionPopover'
import { TranslationText } from '@/ui/components/TranslationText'
import { composeHooks } from '@/ui/hooks/compose-hooks'
import { FilterInput } from './FilterInput'
import type {
  ColumnFilterPopoverProps,
  ColumnFilterPopoverViewProps,
  SortSegmentValue,
} from './interfaces'
import { useColumnFilterPopoverProps } from './lib'
import messages from './messages.json'
import styles from './styles.module.css'

const SORT_OPTIONS = [
  {
    value: 'asc',
    label: (
      <Center className={styles.sortLabel}>
        <IconArrowUp size={14} aria-hidden="true" />
        <span>A-Z</span>
      </Center>
    ),
  },
  {
    value: 'desc',
    label: (
      <Center className={styles.sortLabel}>
        <IconArrowDown size={14} aria-hidden="true" />
        <span>Z-A</span>
      </Center>
    ),
  },
  {
    value: 'none',
    label: (
      <Center>
        <IconMinus size={14} aria-hidden="true" />
      </Center>
    ),
  },
]

export function ColumnFilterPopoverView({
  opened,
  isActive,
  isDropdownOpen,
  localSortDirection,
  localFilterValue,
  sortable,
  filterConfig,
  filterAriaLabel,
  triggerTestId,
  filterInputTestId,
  onLocalSortChange,
  onLocalFilterChange,
  onDropdownOpen,
  onDropdownClose,
  onPopoverChange,
  onToggle,
  onReset,
  onApply,
}: ColumnFilterPopoverViewProps) {
  const hasContent = sortable || filterConfig
  if (!hasContent) return null

  return (
    <ActionPopover
      opened={opened}
      onChange={onPopoverChange}
      width={260}
      closeOnClickOutside={!isDropdownOpen}
      target={
        <ActionIcon
          variant={isActive ? 'light' : 'subtle'}
          size="sm"
          onClick={onToggle}
          className={isActive ? undefined : styles.trigger}
          aria-label={filterAriaLabel}
          aria-expanded={opened}
          data-testid={triggerTestId}
        >
          <IconFilter size={16} aria-hidden="true" />
        </ActionIcon>
      }
      onCancel={onReset}
      onConfirm={onApply}
      cancelLabel={<TranslationText {...messages.reset} />}
      confirmLabel={<TranslationText {...messages.apply} />}
    >
      <Stack gap="sm">
        {sortable && (
          <Stack gap="xs">
            <Text className={styles.sectionLabel} size="xs">
              <TranslationText {...messages.sort} />
            </Text>
            <SegmentedControl
              size="xs"
              fullWidth
              value={localSortDirection}
              onChange={(value) => onLocalSortChange(value as SortSegmentValue)}
              data={SORT_OPTIONS}
            />
          </Stack>
        )}

        {filterConfig && (
          <Stack gap="xs">
            <Text className={styles.sectionLabel} size="xs">
              <TranslationText {...messages.filter} />
            </Text>
            <FilterInput
              filterConfig={filterConfig}
              value={localFilterValue}
              filterInputTestId={filterInputTestId}
              onChange={onLocalFilterChange}
              onDropdownOpen={onDropdownOpen}
              onDropdownClose={onDropdownClose}
            />
          </Stack>
        )}
      </Stack>
    </ActionPopover>
  )
}

export const ColumnFilterPopover = composeHooks<
  ColumnFilterPopoverViewProps,
  ColumnFilterPopoverProps
>(ColumnFilterPopoverView)(useColumnFilterPopoverProps)
