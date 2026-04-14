import { useCallback, useEffect, useRef } from 'react'
import { useIntl } from 'react-intl'
import messages from '../messages.json'
import type {
  InlineEditInputExternalProps,
  InlineEditInputHookReturn,
  InlineEditInputViewProps,
} from './interfaces'

export function useInlineEditInputProps({
  onChange,
}: InlineEditInputViewProps & InlineEditInputExternalProps): InlineEditInputHookReturn {
  const intl = useIntl()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.currentTarget.value)
    },
    [onChange]
  )

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  return {
    inputRef,
    handleChange,
    handleClick,
    editAriaLabel: intl.formatMessage(messages.editLabel),
  }
}
