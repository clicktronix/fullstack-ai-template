import { Alert } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'

type FormErrorAlertProps = {
  error: string | null | undefined
}

export function FormErrorAlert({ error }: FormErrorAlertProps) {
  if (!error) return null

  return (
    <Alert
      icon={<IconAlertCircle size={16} aria-hidden="true" />}
      color="red"
      role="alert"
      data-testid="form-error-alert"
    >
      {error}
    </Alert>
  )
}
