'use client'

import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { NavigationProgress } from '@mantine/nprogress'
import type { ComponentProps, ReactNode } from 'react'
import { IntlProvider } from 'react-intl'
import { Notifications } from '@/lib/mantine-notifications'
import { ErrorBoundary } from '@/ui/components/ErrorBoundary'
import { AuthProvider } from '@/ui/providers/AuthContext'
import { LocaleProvider, useLocale, type Locale } from '@/ui/providers/LocaleContext'
import { QueryProvider } from '@/ui/providers/QueryProvider/QueryProvider'
import { theme } from '@/ui/themes'
import { cssVariablesResolver } from '@/ui/themes/resolver'
import { AppShell } from './AppShell'
import classes from './ClientProviders.module.css'
import { RouterProgress } from './RouterProgress'

function IntlWrapper({ children }: { children: ReactNode }) {
  const { locale, messages } = useLocale()

  return (
    <IntlProvider locale={locale} messages={messages}>
      {children}
    </IntlProvider>
  )
}

// Outer fallback renders OUTSIDE IntlProvider/MantineProvider, so i18n and Mantine
// are unavailable. Hardcoded Russian text is intentional (ru is the default locale).
const outerFallback = (
  <div className={classes.fallback}>
    <h2>Что-то пошло не так</h2>
    <p>Пожалуйста, перезагрузите страницу</p>
    <button type="button" onClick={() => globalThis.location.reload()}>
      Перезагрузить
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
      <LocaleProvider initialLocale={initialLocale}>
        <MantineProvider
          theme={theme}
          defaultColorScheme="dark"
          cssVariablesResolver={cssVariablesResolver}
        >
          <IntlWrapper>
            <NavigationProgress />
            <RouterProgress />
            <Notifications position="top-right" zIndex={1000} />
            <QueryProvider>
              <AuthProvider>
                <ModalsProvider modals={modals}>
                  <ErrorBoundary>
                    <AppShell>{children}</AppShell>
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
