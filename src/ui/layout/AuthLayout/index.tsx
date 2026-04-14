'use client'

import { Box, Center, Loader } from '@mantine/core'
import { TranslationText } from '@/ui/components/TranslationText'
import { composeHooks } from '@/ui/hooks/compose-hooks'
import type { AuthLayoutViewProps } from './interfaces'
import { useAuthLayoutProps, type AuthLayoutProps } from './lib'
import messages from './messages.json'
import styles from './styles.module.css'

/**
 * View component for AuthLayout.
 * Pure presentation - no hooks.
 *
 * Shows loading state while checking authentication.
 * Shows redirecting message if user is authenticated.
 * Otherwise renders children.
 */
export function AuthLayoutView({ isLoading, isAuthenticated, children }: AuthLayoutViewProps) {
  // Show loading state while checking auth
  if (isLoading) {
    return (
      <Box className={styles.loadingContainer}>
        <Loader size="lg" />
        <TranslationText {...messages.loading} c="dimmed" />
      </Box>
    )
  }

  // Show redirecting message if authenticated
  if (isAuthenticated) {
    return (
      <Box className={styles.loadingContainer}>
        <Loader size="lg" />
        <TranslationText {...messages.redirecting} c="dimmed" />
      </Box>
    )
  }

  // Render children for unauthenticated users
  return (
    <Center className={styles.container}>
      <Box className={styles.content}>{children}</Box>
    </Center>
  )
}

/**
 * AuthLayout for public authentication pages (login, signup).
 *
 * Features:
 * - Centers content on page
 * - Shows loading state while checking authentication
 * - Automatically redirects authenticated users to dashboard
 *
 * Usage:
 * ```tsx
 * import { AuthLayout } from '@/ui/layout/AuthLayout'
 *
 * export default function LoginPage() {
 *   return (
 *     <AuthLayout>
 *       <LoginForm />
 *     </AuthLayout>
 *   )
 * }
 * ```
 */
export const AuthLayout = composeHooks<AuthLayoutViewProps, AuthLayoutProps>(AuthLayoutView)(
  useAuthLayoutProps
)
