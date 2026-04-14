import { Center, Loader } from '@mantine/core'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { verifySession } from '@/infrastructure/auth/verify-session'
import { DEFAULT_AUTHENTICATED_ROUTE } from '@/lib/constants'
import { AuthLayout } from '@/ui/layout/AuthLayout'
import { SignupView } from './_internal/ui/SignupView'

// This page calls verifySession() (uses `cookies()`), so it must be dynamic.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Регистрация | Platform',
}

export default async function SignupPage() {
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
        <SignupView />
      </Suspense>
    </AuthLayout>
  )
}
