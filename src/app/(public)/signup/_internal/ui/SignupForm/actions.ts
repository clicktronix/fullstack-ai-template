'use server'

import { redirect } from 'next/navigation'
import { signUpAction } from '@/adapters/inbound/next/server-actions/auth'
import { getPostLoginRedirect } from '@/lib/auth-routes'
import { getUserFacingErrorMessage } from '@/lib/errors/presentation'

export type SignupFormErrorKey = 'PASSWORDS_DO_NOT_MATCH'

export type SignupFormState = {
  error: string | null
  errorKey: SignupFormErrorKey | null
  confirmationEmail: string | null
}

export const initialSignupFormState: SignupFormState = {
  error: null,
  errorKey: null,
  confirmationEmail: null,
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

export async function submitSignupForm(
  _previousState: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  const email = getFormString(formData, 'email')
  const password = getFormString(formData, 'password')
  const confirmPassword = getFormString(formData, 'confirmPassword')

  if (password !== confirmPassword) {
    return {
      error: null,
      errorKey: 'PASSWORDS_DO_NOT_MATCH',
      confirmationEmail: null,
    }
  }

  let redirectUrl: string | null = null

  try {
    const session = await signUpAction({
      email,
      password,
      fullName: getFormString(formData, 'fullName'),
    })

    if (!session) {
      return {
        error: null,
        errorKey: null,
        confirmationEmail: email,
      }
    }

    redirectUrl = getRedirectUrl(formData)
  } catch (error) {
    return {
      error: getUserFacingErrorMessage(error),
      errorKey: null,
      confirmationEmail: null,
    }
  }

  redirect(redirectUrl)
}
