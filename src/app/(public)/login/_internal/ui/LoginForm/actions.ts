'use server'

import { redirect } from 'next/navigation'
import { signInAction } from '@/adapters/inbound/next/server-actions/auth'
import { getPostLoginRedirect } from '@/infrastructure/auth/auth-routes'
import { getUserFacingErrorMessage } from '@/infrastructure/errors/presentation'

export type LoginFormState = {
  error: string | null
}

export const initialLoginFormState: LoginFormState = {
  error: null,
}

function getFormString(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === 'string' ? value : ''
}

function getRedirectUrl(formData: FormData): string {
  const searchParams = new URLSearchParams()
  const redirectValue = getFormString(formData, 'redirect')

  if (redirectValue) {
    searchParams.set('redirect', redirectValue)
  }

  return getPostLoginRedirect(searchParams)
}

export async function submitLoginForm(
  _previousState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  let redirectUrl: string | null = null

  try {
    await signInAction({
      email: getFormString(formData, 'email'),
      password: getFormString(formData, 'password'),
    })
    redirectUrl = getRedirectUrl(formData)
  } catch (error) {
    return { error: getUserFacingErrorMessage(error) }
  }

  redirect(redirectUrl)
}
