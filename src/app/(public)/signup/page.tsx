import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { verifySession } from '@/infrastructure/auth/verify-session'
import { DEFAULT_AUTHENTICATED_ROUTE } from '@/lib/constants'
import { AuthLayout } from '@/ui/layout/AuthLayout'
import { SignupView } from './_internal/ui/SignupView'

export const metadata: Metadata = {
  title: 'Sign Up | Platform',
}

type SignupPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function getRedirectParam(searchParams: Record<string, string | string[] | undefined>): string {
  const redirectTo = searchParams.redirect
  return typeof redirectTo === 'string' ? redirectTo : ''
}

export default function SignupPage({ searchParams }: SignupPageProps) {
  return (
    <AuthLayout>
      <Suspense fallback={<SignupView />}>
        <SignupContent searchParams={searchParams} />
      </Suspense>
    </AuthLayout>
  )
}

async function SignupContent({ searchParams }: SignupPageProps) {
  await connection()
  const redirectTo = getRedirectParam(await searchParams)

  // Check if user is already authenticated on the server
  const session = await verifySession()

  // Redirect to dashboard if already logged in
  if (session) {
    redirect(DEFAULT_AUTHENTICATED_ROUTE)
  }

  return <SignupView redirectTo={redirectTo} />
}
