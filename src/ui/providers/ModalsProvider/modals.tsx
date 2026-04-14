import type { ContextModalProps } from '@mantine/modals'
import type { ComponentType, FC } from 'react'
import { ErrorBoundary } from '@/ui/components/ErrorBoundary'

/**
 * HOC that wraps a context modal content component in an ErrorBoundary.
 * Prevents modal errors from crashing the entire application.
 * Принимает ComponentType для совместимости с next/dynamic.
 */
function withModalErrorBoundary<P extends Record<string, unknown>>(
  Component: ComponentType<ContextModalProps<P>>
): FC<ContextModalProps<P>> {
  const WrappedModalContent: FC<ContextModalProps<P>> = (props) => (
    <ErrorBoundary>
      <Component {...props} />
    </ErrorBoundary>
  )
  WrappedModalContent.displayName = `withModalErrorBoundary(${Component.displayName ?? Component.name})`
  return WrappedModalContent
}

export { withModalErrorBoundary }
