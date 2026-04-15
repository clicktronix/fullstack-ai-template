import { ColorSchemeScript } from '@mantine/core'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { appContextModals } from '@/app/_internal/modals/context-modals'
import { LOCALE_COOKIE_NAME } from '@/lib/constants'
import { ClientProviders } from '@/ui/layout/ClientProviders'
import type { Locale } from '@/ui/providers/LocaleContext'
import './globals.css'
// Use .layer.css files to ensure CSS Modules have higher specificity than Mantine styles
// This fixes production CSS order issues where Mantine's display:block overrides our display:flex
import '@mantine/core/styles.layer.css'
import '@mantine/charts/styles.layer.css'
import '@mantine/notifications/styles.layer.css'
import '@mantine/nprogress/styles.layer.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com'),
  title: {
    default: 'Fullstack AI Template',
    template: '%s | Fullstack AI Template',
  },
  description: 'Шаблон full-stack B2B и AI-приложений на Next.js, Supabase и Clean Architecture',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'Fullstack AI Template',
    title: 'Fullstack AI Template',
    description: 'Шаблон full-stack B2B и AI-приложений на Next.js и Supabase',
  },
  twitter: {
    card: 'summary',
    title: 'Fullstack AI Template',
  },
}

const SUPPORTED_LOCALES = new Set(['ru', 'en'])

/**
 * Root layout - minimal shell without auth checks.
 *
 * Architecture:
 * - Root layout: Providers, fonts, styles (no auth HTTP calls)
 * - (protected) layout: verifySession() for protected routes only
 * - AuthContext: Fetches user client-side if not provided by SSR
 *
 * Benefits:
 * - Public pages (/, /login) don't trigger /auth/me SSR requests
 * - Protected pages get SSR session from their layout
 * - Better performance for unauthenticated users
 */

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get(LOCALE_COOKIE_NAME)?.value
  const initialLocale: Locale =
    localeCookie && SUPPORTED_LOCALES.has(localeCookie) ? (localeCookie as Locale) : 'ru'

  return (
    <html lang={initialLocale} suppressHydrationWarning data-mantine-color-scheme="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#1a1b1e" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        )}
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body>
        {/*
          Note: ClientProviders includes an ErrorBoundary inside,
          but we can't add a top-level ErrorBoundary here because:
          1. ErrorBoundary requires 'use client' directive
          2. Root layout must be a server component
          3. ClientProviders already wraps providers in ErrorBoundary internally

          Architecture:
          - Root layout (server): HTML shell, fonts, ColorSchemeScript
          - ClientProviders (client): All providers + nested ErrorBoundary
          - initialLocale read from cookie to avoid hydration flicker
        */}
        <ClientProviders modals={appContextModals} initialLocale={initialLocale}>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
