import { Center, Loader } from '@mantine/core'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { verifySession } from '@/infrastructure/auth/verify-session'
import { DEFAULT_AUTHENTICATED_ROUTE } from '@/lib/constants'
import { AuthLayout } from '@/ui/layout/AuthLayout'
import { LoginView } from './_internal/ui/LoginView'

// This page calls verifySession() (uses `cookies()`), so it must be dynamic.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Вход | Platform',
}

export default async function LoginPage() {
  // Check if user is already authenticated on the server
  const session = await verifySession()

  // Redirect to dashboard if already logged in
  if (session) {
    redirect(DEFAULT_AUTHENTICATED_ROUTE)
  }

  return (
    <AuthLayout>
      <Suspense
        fallback={
          <Center h="50vh">
            <Loader />
          </Center>
        }
      >
        <LoginView />
      </Suspense>
    </AuthLayout>
  )
}
