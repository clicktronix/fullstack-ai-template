'use client'

import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { Box, Loader, Table, Paper, Stack } from '@mantine/core'
import { composeHooks } from '@/ui/hooks/compose-hooks'
import { ColumnDragPreview } from './ColumnDragPreview'
import { DraggableColumn } from './DraggableColumn'
import { TableBody } from './TableBody'
import { TableHeader } from './TableHeader'
import { TablePagination } from './TablePagination'
import { TableSettings } from './TableSettings'
import { CellEditingContext } from './context'
import { useDataTableProps } from './lib'
import styles from './styles.module.css'

export type DataTableViewProps<T extends Record<string, unknown>> = ReturnType<
  typeof useDataTableProps<T>
>

export function DataTableView<T extends Record<string, unknown>>({
  data,
  visibleColumns,
  columnWidthsMap,
  keyExtractor,
  emptyMessage,
  isPending,
  isFetching,
  // Grouped state (reduces prop drilling)
  cellEditing,
  actionsConfig,
  ariaLabels,
  // Layout
  totalColumns,
  minWidth,
  striped,
  highlightOnHover,
  withColumnBorders,
  horizontalSpacing,
  verticalSpacing,
  actionsLabel,
  // Header
  showHeader,
  title,
  description,
  headerRightSection,
  onRefresh,
  // Settings
  enableUserSettings,
  settingsOpened,
  openSettings,
  columns,
  finalConfig,
  userVisibleColumns,
  handleToggleColumn,
  handleChangeColumnWidth,
  handleChangeTableConfig,
  handleResetSettings,
  handleSettingsClose,
  // Sorting
  sortConfig,
  onSort,
  onSortClear,
  // Pagination
  pagination,
  onPageChange,
  totalPages,
  showPagination,
  pageInfoText,
  paginationAriaLabel,
  // Row selection
  selectedKey,
  onRowClick,
  onRowHover,
  skeletonRows,
  // Cell editing context (pre-memoized)
  cellEditingContextValue,
  // DndContext stable ID
  dndContextId,
  // Column reorder
  enableColumnReorder,
  columnDragSensors,
  activeColumnKey,
  sortableColumnKeys,
  onColumnDragStart,
  onColumnDragOver,
  onColumnDragEnd,
  getActiveColumn,
  // Header aria-labels
  refreshAriaLabel,
  settingsAriaLabel,
  // Column filters
  columnFilters,
  onColumnFilterChange,
  // Batched sort+filter changes
  onColumnApplyChanges,
  // Separate filter config map (decoupled from columns)
  filterConfigMap,
}: DataTableViewProps<T>) {
  return (
    <CellEditingContext.Provider value={cellEditingContextValue}>
      <Stack gap="md" className={styles.stackContainer}>
        {showHeader && (
          <TableHeader
            title={title}
            description={description}
            onSettingsClick={enableUserSettings ? openSettings : undefined}
            onRefreshClick={onRefresh}
            rightSection={headerRightSection}
            refreshAriaLabel={refreshAriaLabel}
            settingsAriaLabel={settingsAriaLabel}
          />
        )}

        {enableUserSettings && (
          <TableSettings
            opened={settingsOpened}
            onClose={handleSettingsClose}
            columns={columns}
            config={finalConfig}
            visibleColumns={userVisibleColumns}
            onToggleColumn={handleToggleColumn}
            onChangeTableConfig={handleChangeTableConfig}
            onReset={handleResetSettings}
          />
        )}

        <Paper className={styles.tableWrapper}>
          <Box className={styles.scrollWrapper}>
            {/* Fetching overlay — shows when background refetch is in progress (keepPreviousData) */}
            {isFetching && !isPending && data.length > 0 && (
              <Box className={styles.fetchingOverlay} aria-live="polite">
                <Loader size="sm" />
              </Box>
            )}
            <DndContext
              id={dndContextId}
              sensors={columnDragSensors}
              collisionDetection={closestCenter}
              onDragStart={onColumnDragStart}
              onDragOver={onColumnDragOver}
              onDragEnd={onColumnDragEnd}
            >
              <Table
                data-testid="data-table"
                className={styles.fixedTable}
                miw={minWidth}
                striped={striped}
                highlightOnHover={highlightOnHover}
                withColumnBorders={withColumnBorders}
                horizontalSpacing={horizontalSpacing}
                verticalSpacing={verticalSpacing}
              >
                <Table.Thead className={styles.stickyHeader}>
                  <Table.Tr>
                    <SortableContext
                      items={sortableColumnKeys}
                      strategy={horizontalListSortingStrategy}
                    >
                      {visibleColumns.map((col) => {
                        const sortKey = (col.sortKey ?? col.key) as string
                        const isSorted = sortConfig?.key === sortKey
                        const sortDirection = sortConfig?.direction ?? 'asc'
                        const { width, minWidth: colMinWidth } = columnWidthsMap[col.key]

                        return (
                          <DraggableColumn
                            key={col.key}
                            columnKey={col.key}
                            testId={col.testId ?? `column-${col.key}`}
                            label={col.label}
                            width={width}
                            minWidth={colMinWidth}
                            sortable={col.sortable}
                            persistHeaderActions={col.persistHeaderActions}
                            isSorted={isSorted}
                            sortDirection={sortDirection}
                            sortKey={sortKey}
                            onParentSort={onSort}
                            onSortClear={onSortClear}
                            onResizeEnd={handleChangeColumnWidth}
                            enableReorder={enableColumnReorder && col.reorderable !== false}
                            activeColumnKey={activeColumnKey}
                            filterConfig={filterConfigMap?.[col.key] ?? col.filterConfig}
                            filterValue={columnFilters?.[col.key]}
                            onParentFilterChange={onColumnFilterChange}
                            onParentApplyChanges={onColumnApplyChanges}
                          />
                        )
                      })}
                    </SortableContext>
                    {/* Spacer column - absorbs remaining space */}
                    <Table.Th scope="col" className={styles.spacerColumn} />
                    {/* Actions column width comes from props (actionsWidth). */}
                    {actionsConfig.hasActions && (
                      <Table.Th
                        scope="col"
                        w={actionsConfig.actionsWidth}
                        miw={actionsConfig.actionsWidth}
                      >
                        {actionsLabel}
                      </Table.Th>
                    )}
                  </Table.Tr>
                </Table.Thead>
                <TableBody
                  data={data}
                  keyExtractor={keyExtractor}
                  visibleColumns={visibleColumns}
                  columnWidthsMap={columnWidthsMap}
                  totalColumns={totalColumns}
                  emptyMessage={emptyMessage}
                  isPending={isPending}
                  skeletonRows={skeletonRows}
                  selectedKey={selectedKey}
                  onRowClick={onRowClick}
                  onRowHover={onRowHover}
                  cellEditing={cellEditing}
                  actionsConfig={actionsConfig}
                  ariaLabels={ariaLabels}
                />
              </Table>

              {/* Drag Overlay - shows the dragged column header.
              dropAnimation is null because columns are reordered in real-time
              during onDragOver, so the destination is already correct. */}
              <DragOverlay dropAnimation={null}>
                {activeColumnKey ? (
                  <ColumnDragPreview label={getActiveColumn(activeColumnKey)?.label} />
                ) : null}
              </DragOverlay>
            </DndContext>
          </Box>

          {/* Pagination */}
          {showPagination && pagination && onPageChange && (
            <TablePagination
              pageInfoText={pageInfoText}
              totalPages={totalPages}
              currentPage={pagination.page}
              onPageChange={onPageChange}
              ariaLabel={paginationAriaLabel}
            />
          )}
        </Paper>
      </Stack>
    </CellEditingContext.Provider>
  )
}

export const DataTable = composeHooks(DataTableView)(useDataTableProps)
