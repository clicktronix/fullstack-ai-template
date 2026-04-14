import { useCallback, useMemo } from 'react'
import type { ColumnConfig, DataTableConfig } from '../interfaces'

export type TableSettingsViewCallbacks = {
  handleStripedChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleHighlightOnHoverChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleWithColumnBordersChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  createToggleColumnHandler: (key: string) => () => void
}

export type TableSettingsViewProps<T> = {
  opened: boolean
  onClose: () => void
  columns: ColumnConfig<T>[]
  config: DataTableConfig
  visibleColumnSet: Set<string>
  onReset: () => void
  handleStripedChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleHighlightOnHoverChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleWithColumnBordersChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  createToggleColumnHandler: (key: string) => () => void
}

export type TableSettingsProps<T> = {
  opened: boolean
  onClose: () => void
  columns: ColumnConfig<T>[]
  config: DataTableConfig
  visibleColumns: string[]
  onToggleColumn: (key: string) => void
  onChangeTableConfig: (config: Partial<DataTableConfig>) => void
  onReset: () => void
}

export function useTableSettingsProps<T>({
  opened,
  onClose,
  columns,
  config,
  visibleColumns,
  onToggleColumn,
  onChangeTableConfig,
  onReset,
}: TableSettingsProps<T>): TableSettingsViewProps<T> {
  const {
    handleStripedChange,
    handleHighlightOnHoverChange,
    handleWithColumnBordersChange,
    createToggleColumnHandler,
  } = useTableSettingsCallbacks(onChangeTableConfig, onToggleColumn)

  // O(1) lookup для проверки видимости колонок вместо .includes() внутри .map()
  const visibleColumnSet = useMemo(() => new Set(visibleColumns), [visibleColumns])

  return {
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
  }
}

function useTableSettingsCallbacks(
  onChangeTableConfig: (config: Partial<DataTableConfig>) => void,
  onToggleColumn: (key: string) => void
): TableSettingsViewCallbacks {
  const handleStripedChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChangeTableConfig({ striped: e.currentTarget.checked })
    },
    [onChangeTableConfig]
  )

  const handleHighlightOnHoverChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChangeTableConfig({ highlightOnHover: e.currentTarget.checked })
    },
    [onChangeTableConfig]
  )

  const handleWithColumnBordersChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChangeTableConfig({ withColumnBorders: e.currentTarget.checked })
    },
    [onChangeTableConfig]
  )

  const createToggleColumnHandler = useCallback(
    (key: string) => () => {
      onToggleColumn(key)
    },
    [onToggleColumn]
  )

  return {
    handleStripedChange,
    handleHighlightOnHoverChange,
    handleWithColumnBordersChange,
    createToggleColumnHandler,
  }
}
