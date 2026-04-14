import { useCallback, useEffect, useRef, type KeyboardEvent } from 'react'
import { useIntl } from 'react-intl'
import { useCellEditing } from '@/ui/components/DataTable/context'
import type { EditPopoverProps, EditPopoverViewProps } from './interfaces'
import messages from './messages.json'

const DEFAULT_WIDTH = 280
const DEFAULT_POSITION = 'bottom' as const

export function useEditPopoverProps(props: EditPopoverProps): EditPopoverViewProps {
  const {
    opened,
    onClose,
    onOpen,
    onSave,
    loading = false,
    disabled = false,
    width = DEFAULT_WIDTH,
    position = DEFAULT_POSITION,
    closeOnClickOutside,
    children,
    target,
  } = props

  const intl = useIntl()
  const { onCellEditStart, onCellEditEnd } = useCellEditing()

  /**
   * Refs to break circular useCallback dependencies.
   * Without refs, handleOpen/handleClose depend on onOpen/onClose,
   * and handlePopoverChange/handleTargetDoubleClick/handleTargetKeyDown
   * depend on handleOpen/handleClose, creating a chain that causes
   * all handlers to be recreated when any callback in the chain changes.
   */
  const onOpenRef = useRef(onOpen)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onOpenRef.current = onOpen
    onCloseRef.current = onClose
  }, [onOpen, onClose])

  const handleOpen = useCallback(() => {
    onCellEditStart()
    onOpenRef.current()
  }, [onCellEditStart])

  const handleClose = useCallback(() => {
    onCellEditEnd()
    onCloseRef.current()
  }, [onCellEditEnd])

  const handlePopoverChange = useCallback(
    (isOpen: boolean) => {
      if (isOpen) {
        handleOpen()
      } else {
        handleClose()
      }
    },
    [handleOpen, handleClose]
  )

  const handleTargetDoubleClick = useCallback(() => {
    if (disabled) return

    if (opened) {
      handleClose()
    } else {
      handleOpen()
    }
  }, [disabled, opened, handleClose, handleOpen])

  const handleTargetKeyDown = useCallback(
    (event: KeyboardEvent<HTMLSpanElement>) => {
      if (disabled) return
      if (event.key !== 'Enter' && event.key !== ' ') return

      event.preventDefault()
      if (opened) {
        handleClose()
      } else {
        handleOpen()
      }
    },
    [disabled, opened, handleClose, handleOpen]
  )

  return {
    opened,
    onSave,
    loading,
    disabled,
    width,
    position,
    closeOnClickOutside,
    children,
    target,
    handleOpen,
    handleClose,
    handlePopoverChange,
    handleTargetDoubleClick,
    handleTargetKeyDown,
    cancelAriaLabel: intl.formatMessage(messages.cancel),
    confirmAriaLabel: intl.formatMessage(messages.save),
  }
}
