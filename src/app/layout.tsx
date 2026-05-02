import { ColorSchemeScript } from '@mantine/core'
import type { Metadata } from 'next'
import { appContextModals } from '@/app/_internal/modals/context-modals'
import { getPublicEnv } from '@/infrastructure/env/public'
import { getRuntimeEnv } from '@/infrastructure/env/runtime'
import { ClientProviders } from '@/ui/layout/ClientProviders'
import './globals.css'
// Use .layer.css files to ensure CSS Modules have higher specificity than Mantine styles
// This fixes production CSS order issues where Mantine's display:block overrides our display:flex
import '@mantine/core/styles.layer.css'
import '@mantine/charts/styles.layer.css'
import '@mantine/notifications/styles.layer.css'
import '@mantine/nprogress/styles.layer.css'

const publicEnv = getPublicEnv()
const runtimeEnv = getRuntimeEnv()

function getMetadataBase(): URL {
  if (publicEnv.NEXT_PUBLIC_SITE_URL) {
    return new URL(publicEnv.NEXT_PUBLIC_SITE_URL)
  }

  if (runtimeEnv.VERCEL_ENV === 'production') {
    const productionUrl = runtimeEnv.VERCEL_PROJECT_PRODUCTION_URL ?? runtimeEnv.VERCEL_URL

    if (!productionUrl) {
      throw new Error(
        'NEXT_PUBLIC_SITE_URL or VERCEL_PROJECT_PRODUCTION_URL is required for production metadata.'
      )
    }

    return new URL(`https://${productionUrl}`)
  }

  return new URL('http://localhost:3000')
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: 'Fullstack AI Template',
    template: '%s | Fullstack AI Template',
  },
  description:
    'Full-stack B2B and AI application template built with Next.js, Supabase, and Clean Architecture',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Fullstack AI Template',
    title: 'Fullstack AI Template',
    description: 'Full-stack B2B and AI application template built with Next.js and Supabase',
  },
  twitter: {
    card: 'summary',
    title: 'Fullstack AI Template',
  },
}

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-mantine-color-scheme="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#1a1b1e" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        {publicEnv.NEXT_PUBLIC_SUPABASE_URL && (
          <link rel="preconnect" href={publicEnv.NEXT_PUBLIC_SUPABASE_URL} />
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
          - LocaleProvider syncs persisted locale on the client.
            src/proxy.ts seeds the locale cookie from Accept-Language.
        */}
        <ClientProviders modals={appContextModals}>{children}</ClientProviders>
      </body>
    </html>
  )
}
