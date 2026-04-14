'use client'

import { ActionIcon, Badge, Group, MultiSelect, Stack, Tooltip } from '@mantine/core'
import { IconStar, IconStarFilled } from '@tabler/icons-react'
import { composeHooks } from '@/ui/hooks/compose-hooks'
import type { PrimaryItemMultiSelectProps, PrimaryItemMultiSelectViewProps } from './interfaces'
import { usePrimaryItemMultiSelectProps } from './lib'

/**
 * View component for PrimaryItemMultiSelect.
 * Pure presentation - no hooks.
 */
export function PrimaryItemMultiSelectView({
  options,
  selectedIds,
  selectedItems,
  label,
  placeholder,
  disabled,
  searchable,
  clearable,
  setPrimaryTooltip,
  togglePrimaryAriaLabel,
  onSelectionChange,
  createPrimaryToggleHandler,
}: PrimaryItemMultiSelectViewProps) {
  return (
    <Stack gap="xs">
      <MultiSelect
        label={label}
        placeholder={placeholder}
        data={options}
        value={selectedIds}
        onChange={onSelectionChange}
        disabled={disabled}
        searchable={searchable}
        clearable={clearable}
      />
      {selectedItems.length > 0 && (
        <Group gap="xs">
          {selectedItems.map((item) => (
            <Badge
              key={item.id}
              size="sm"
              variant={item.isPrimary ? 'filled' : 'light'}
              color={item.color ?? 'gray'}
              rightSection={
                <Tooltip label={setPrimaryTooltip}>
                  <ActionIcon
                    size="xs"
                    variant="transparent"
                    color={item.isPrimary ? 'yellow' : 'gray'}
                    onClick={createPrimaryToggleHandler(item.id)}
                    aria-label={`${togglePrimaryAriaLabel}: ${item.name}`}
                  >
                    {item.isPrimary ? (
                      <IconStarFilled size={12} aria-hidden="true" />
                    ) : (
                      <IconStar size={12} aria-hidden="true" />
                    )}
                  </ActionIcon>
                </Tooltip>
              }
            >
              {item.name}
            </Badge>
          ))}
        </Group>
      )}
    </Stack>
  )
}

/**
 * Composed PrimaryItemMultiSelect component with hooks.
 * Manages selection options, primary toggle logic, and i18n.
 */
export const PrimaryItemMultiSelect = composeHooks<
  PrimaryItemMultiSelectViewProps,
  PrimaryItemMultiSelectProps
>(PrimaryItemMultiSelectView)(usePrimaryItemMultiSelectProps)
