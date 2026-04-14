import { Box, Button, Group, type ButtonProps } from '@mantine/core'
import { IconDeviceFloppy, IconTrash, IconX } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { TranslationText } from '@/ui/components/TranslationText'
import messages from './messages.json'

const DEFAULT_DELETE_ICON = <IconTrash size={16} aria-hidden="true" />
const DEFAULT_CANCEL_ICON = <IconX size={16} aria-hidden="true" />
const DEFAULT_SUBMIT_ICON = <IconDeviceFloppy size={16} aria-hidden="true" />

export type FormActionsProps = {
  /** Submit button click handler (if provided, renders Submit button) */
  onSubmit?: () => void
  /** Cancel button click handler (if provided, renders Cancel button) */
  onCancel?: () => void
  /** Delete button click handler (if provided, renders Delete button) */
  onDelete?: () => void
  /** Custom label for submit button */
  submitLabel?: ReactNode
  /** Custom label for cancel button */
  cancelLabel?: ReactNode
  /** Custom label for delete button */
  deleteLabel?: ReactNode
  /** Loading state for submit button (boolean justified: independent mutation state) */
  isSubmitting?: boolean
  /** Loading state for delete button (boolean justified: independent mutation state) */
  isDeleting?: boolean
  /** Custom icon for submit button (default: IconDeviceFloppy) */
  submitIcon?: ReactNode
  /** Custom icon for cancel button (default: IconX) */
  cancelIcon?: ReactNode
  /** Custom icon for delete button (default: IconTrash) */
  deleteIcon?: ReactNode
  /** Color for delete button (default: red) */
  deleteColor?: string
  /** Justification of buttons (default: flex-end) */
  justify?: 'flex-start' | 'flex-end' | 'space-between' | 'center'
  /** Submit button type (default: button) - use "submit" for forms */
  submitType?: 'button' | 'submit'
  /** Form ID to link submit button to external form */
  formId?: string
  /** Submit button color */
  submitColor?: ButtonProps['color']
  /** Submit button variant */
  submitVariant?: ButtonProps['variant']
  /** Cancel button variant (default: subtle) */
  cancelVariant?: ButtonProps['variant']
  /** Disable all buttons */
  disabled?: boolean
  /** Top margin (Mantine spacing). Default: 'md' */
  mt?: string
  /** data-testid for submit button (e2e tests) */
  submitTestId?: string
}

/**
 * FormActions - Standard form action buttons (Submit, Cancel, Delete)
 *
 * Provides consistent styling and behavior for form action buttons.
 * Handles loading states, icons, and flexible layouts.
 *
 * @example
 * ```tsx
 * // Basic Save/Cancel
 * <FormActions
 *   onSubmit={handleSave}
 *   onCancel={onClose}
 *   submitLabel={<TranslationText {...messages.save} />}
 *   isSubmitting={isPending}
 * />
 *
 * // With Delete button
 * <FormActions
 *   onSubmit={handleSave}
 *   onCancel={onClose}
 *   onDelete={handleDelete}
 *   submitLabel="Save"
 *   deleteLabel="Delete"
 *   justify="space-between"
 * />
 *
 * // Form submission
 * <form onSubmit={handleSubmit}>
 *   <FormActions
 *     submitType="submit"
 *     onCancel={onClose}
 *     isSubmitting={isSubmitting}
 *   />
 * </form>
 * ```
 */
export function FormActions({
  onSubmit,
  onCancel,
  onDelete,
  submitLabel,
  cancelLabel,
  deleteLabel,
  isSubmitting = false,
  isDeleting = false,
  submitIcon,
  cancelIcon,
  deleteIcon,
  deleteColor = 'red',
  justify = 'flex-end',
  submitType = 'button',
  formId,
  submitColor = 'blue',
  submitVariant = 'filled',
  cancelVariant = 'subtle',
  disabled = false,
  mt = 'md',
  submitTestId,
}: FormActionsProps) {
  const resolvedSubmitLabel = submitLabel ?? <TranslationText {...messages.save} />
  const resolvedCancelLabel = cancelLabel ?? <TranslationText {...messages.cancel} />
  const resolvedDeleteLabel = deleteLabel ?? <TranslationText {...messages.delete} />

  const showSubmit = onSubmit !== undefined || submitType === 'submit'
  const showCancel = onCancel !== undefined
  const showDelete = onDelete !== undefined

  // If delete button exists, use space-between for better layout
  const finalJustify = showDelete && justify === 'flex-end' ? 'space-between' : justify

  return (
    <Group justify={finalJustify} mt={mt}>
      {/* Delete button on the left */}
      {showDelete && (
        <Button
          variant="light"
          color={deleteColor}
          onClick={onDelete}
          leftSection={deleteIcon ?? DEFAULT_DELETE_ICON}
          loading={isDeleting}
          disabled={disabled || isSubmitting}
        >
          {resolvedDeleteLabel}
        </Button>
      )}

      {/* Spacer when delete exists and we want right-aligned buttons */}
      {showDelete && justify === 'flex-end' && <Box flex={1} />}

      {/* Cancel and Submit buttons on the right */}
      <Group gap="sm">
        {showCancel && (
          <Button
            variant={cancelVariant}
            onClick={onCancel}
            leftSection={cancelIcon ?? DEFAULT_CANCEL_ICON}
            disabled={disabled || isSubmitting || isDeleting}
          >
            {resolvedCancelLabel}
          </Button>
        )}

        {showSubmit && (
          <Button
            data-testid={submitTestId}
            type={submitType}
            form={formId}
            onClick={submitType === 'button' ? onSubmit : undefined}
            leftSection={submitIcon ?? DEFAULT_SUBMIT_ICON}
            loading={isSubmitting}
            disabled={disabled || isDeleting}
            color={submitColor}
            variant={submitVariant}
          >
            {resolvedSubmitLabel}
          </Button>
        )}
      </Group>
    </Group>
  )
}
