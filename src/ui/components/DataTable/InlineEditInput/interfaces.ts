/** Props the View component accepts (P) */
export type InlineEditInputViewProps = {
  value: string
  onBlur: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  inputRef: React.RefObject<HTMLInputElement | null>
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleClick: (e: React.MouseEvent) => void
  editAriaLabel: string
}

/** Extra props consumed by the hook but not passed to the View (E) */
export type InlineEditInputExternalProps = {
  onChange: (value: string) => void
}

/** Hook return type (H1) - computed subset of ViewProps */
export type InlineEditInputHookReturn = {
  inputRef: React.RefObject<HTMLInputElement | null>
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleClick: (e: React.MouseEvent) => void
  editAriaLabel: string
}

/** Full external API = InlineEditInputProps (for external usage) */
export type InlineEditInputProps = Omit<InlineEditInputViewProps, keyof InlineEditInputHookReturn> &
  InlineEditInputExternalProps
