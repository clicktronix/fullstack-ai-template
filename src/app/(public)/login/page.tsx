import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { Suspense } from 'react'
import { readCurrentUser } from '@/modules/identity/rsc'
import { DEFAULT_AUTHENTICATED_ROUTE } from '@/modules/identity/server'
import { AuthLayout } from '@/modules/identity/ui'
import { LoginView } from './_internal/ui/LoginView'

export const metadata: Metadata = {
  title: 'Sign In | Platform',
}

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function getRedirectParam(searchParams: Record<string, string | string[] | undefined>): string {
  const redirectTo = searchParams.redirect
  return typeof redirectTo === 'string' ? redirectTo : ''
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <AuthLayout>
      <Suspense fallback={<LoginView />}>
        <LoginContent searchParams={searchParams} />
      </Suspense>
    </AuthLayout>
  )
}

async function LoginContent({ searchParams }: LoginPageProps) {
  await connection()
  const redirectTo = getRedirectParam(await searchParams)

  // Check if user is already authenticated on the server
  const user = await readCurrentUser()

  // Redirect to dashboard if already logged in
  if (user) {
    redirect(DEFAULT_AUTHENTICATED_ROUTE)
  }

  return <LoginView redirectTo={redirectTo} />
}
