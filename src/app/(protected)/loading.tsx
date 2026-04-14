import { Center, Loader } from '@mantine/core'

/**
 * Fallback loading state for protected routes.
 * Shown while the protected layout verifies the session.
 */
export default function ProtectedLoading() {
  return (
    <Center h="50vh" role="status" aria-live="polite">
      <Loader />
    </Center>
  )
}
