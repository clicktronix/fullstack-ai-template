'use client'

import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { NavigationProgress } from '@mantine/nprogress'
import { Suspense, type ComponentProps, type ReactNode } from 'react'
import { IntlProvider } from 'react-intl'
import { enMessages } from '@/app/_internal/i18n/en'
import { useRealtimeInvalidation } from '@/app/_internal/live-updates/use-realtime-invalidation'
import { AuthProvider } from '@/modules/identity/ui'
import { ErrorBoundary } from '@/shared/ui/components/ErrorBoundary'
import { Notifications } from '@/shared/ui/mantine-notifications'
import { LocaleProvider, useLocale, type Locale } from '@/shared/ui/providers/LocaleContext'
import { QueryProvider } from '@/shared/ui/providers/QueryProvider/QueryProvider'
import { theme } from '@/shared/ui/themes'
import { cssVariablesResolver } from '@/shared/ui/themes/resolver'
import { AppShell } from './AppShell'
import classes from './ClientProviders.module.css'
import { RouterProgress } from './RouterProgress'

const loadAppMessages = async (_locale: Locale) => enMessages

function IntlWrapper({ children }: { children: ReactNode }) {
  const { locale, messages } = useLocale()

  return (
    <IntlProvider locale={locale} messages={messages}>
      {children}
    </IntlProvider>
  )
}

function RealtimeSync() {
  useRealtimeInvalidation()
  return null
}

// Outer fallback renders OUTSIDE IntlProvider/MantineProvider, so i18n and Mantine
// are unavailable. Hardcoded English text is intentional because English is the default locale.
const outerFallback = (
  <div className={classes.fallback}>
    <h2>Something went wrong</h2>
    <p>Please reload the page</p>
    <button type="button" onClick={() => globalThis.location.reload()}>
      Reload
    </button>
  </div>
)

type ClientProvidersProps = {
  children: ReactNode
  modals: ComponentProps<typeof ModalsProvider>['modals']
  initialLocale?: Locale
}

export function ClientProviders({ children, modals, initialLocale }: ClientProvidersProps) {
  return (
    <ErrorBoundary fallback={outerFallback}>
      <LocaleProvider
        initialLocale={initialLocale}
        initialMessages={enMessages}
        loadMessages={loadAppMessages}
      >
        <MantineProvider
          theme={theme}
          defaultColorScheme="dark"
          cssVariablesResolver={cssVariablesResolver}
        >
          <IntlWrapper>
            <NavigationProgress />
            <Suspense fallback={null}>
              <RouterProgress />
            </Suspense>
            <Notifications position="top-right" zIndex={1000} />
            <QueryProvider>
              <RealtimeSync />
              <AuthProvider>
                <ModalsProvider modals={modals}>
                  <ErrorBoundary>
                    <Suspense fallback={children}>
                      <AppShell>{children}</AppShell>
                    </Suspense>
                  </ErrorBoundary>
                </ModalsProvider>
              </AuthProvider>
            </QueryProvider>
          </IntlWrapper>
        </MantineProvider>
      </LocaleProvider>
    </ErrorBoundary>
  )
}
