type DataTableCellInteractionKind = 'none' | 'inline-edit' | 'popover'

/** Props the View component accepts (P) */
export type DataTableCellViewProps = {
  width?: number
  minWidth?: number
  className?: string
  'data-testid'?: string
  children: React.ReactNode
  /**
   * When true, stops double click propagation in capture phase.
   * Useful to disable inner popover double-click triggers.
   */
  blockDoubleClickPropagation?: boolean
  /** onClick handler for the cell */
  handleClick: (e: React.MouseEvent) => void
  /** onMouseDown handler for the cell */
  handleMouseDown: (e: React.MouseEvent) => void
  /** onDoubleClick handler for the cell */
  handleDoubleClick: (e: React.MouseEvent) => void
  /** onDoubleClickCapture handler (only used when blockDoubleClickPropagation is true) */
  handleDoubleClickCapture: (e: React.MouseEvent) => void
}

/** Extra props consumed by the hook but not passed to the View (E) */
export type DataTableCellExternalProps = {
  /** Whether this cell supports any edit interaction on double click */
  isEditable: boolean
  /** Interaction kind determines how double click is handled */
  interactionKind: DataTableCellInteractionKind
  /** Called when row selection is requested (opens sidebar) */
  onRowClick?: () => void
  /** Whether row click should be blocked right now (editing in progress) */
  shouldBlockRowClick: () => boolean
  /** Called when inline edit should start (for inline-edit kind) */
  onInlineEditStart?: () => void
}

/** Hook return type (H1) - computed subset of ViewProps */
export type DataTableCellHookReturn = {
  handleClick: (e: React.MouseEvent) => void
  handleMouseDown: (e: React.MouseEvent) => void
  handleDoubleClick: (e: React.MouseEvent) => void
  handleDoubleClickCapture: (e: React.MouseEvent) => void
}

/** Full external API = DataTableCellProps (for external usage) */
export type DataTableCellProps = Omit<DataTableCellViewProps, keyof DataTableCellHookReturn> &
  DataTableCellExternalProps
