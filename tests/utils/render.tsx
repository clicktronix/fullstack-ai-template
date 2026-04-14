/// <reference lib="dom" />

/**
 * Custom render utilities for Testing Library
 *
 * Provides a render function that wraps components with all necessary providers:
 * - MantineProvider (UI components)
 * - IntlProvider (i18n)
 * - QueryClientProvider (TanStack Query)
 *
 * Usage:
 * ```typescript
 * import { render, screen } from '@/tests/utils/render'
 *
 * test('renders component', () => {
 *   render(<MyComponent />)
 *   expect(screen.getByText('Hello')).toBeInTheDocument()
 * })
 * ```
 */

import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render as rtlRender, RenderOptions } from '@testing-library/react'
import { createElement, ReactElement, ReactNode } from 'react'
import { IntlProvider } from 'react-intl'
import type { User } from '@/domain/user/user'
import type { Locale, Messages } from '@/infrastructure/i18n'
import { enMessages } from '@/infrastructure/i18n/locales/en'
import { ruMessages } from '@/infrastructure/i18n/locales/ru'
import { authKeys } from '@/ui/server-state/auth/keys'
import { theme } from '@/ui/themes'
import { cssVariablesResolver } from '@/ui/themes/resolver'

// Re-export everything from testing-library except screen (which has issues with happy-dom)
export {
  act,
  cleanup,
  fireEvent,
  renderHook,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react'
/**
 * Get screen queries bound to document.body
 * Must be called after DOM is available (in tests, not at import time)
 */
export function getScreen() {
  const { within } = require('@testing-library/react')
  return within(document.body)
}

// Custom render options
type CustomRenderOptions = {
  /**
   * Locale for IntlProvider
   * @default 'en'
   */
  locale?: Locale
  /**
   * Initial entries for router (if needed)
   */
  initialRouterEntries?: string[]
  /**
   * Custom QueryClient for testing specific cache states
   */
  queryClient?: QueryClient
  /**
   * Wrapper options from Testing Library
   */
  wrapper?: RenderOptions['wrapper']
} & Omit<RenderOptions, 'wrapper'>

/**
 * Create a new QueryClient configured for testing
 * - Disables retries (faster tests)
 * - Disables refetch on window focus
 * - Sets cacheTime to 0 (no caching between tests)
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

// Default test query client (recreated for each test via wrapper)
let testQueryClient: QueryClient

/**
 * Get or create the test query client
 */
function getTestQueryClient(): QueryClient {
  if (!testQueryClient) {
    testQueryClient = createTestQueryClient()
  }
  return testQueryClient
}

/**
 * Reset the test query client (call in afterEach if needed)
 */
export function resetTestQueryClient(): void {
  if (testQueryClient) {
    testQueryClient.clear()
  }
  testQueryClient = createTestQueryClient()
}

/**
 * Mock authenticated user for testing hooks that depend on auth state.
 * Seed into QueryClient via: `queryClient.setQueryData(authKeys.user(), mockAuthenticatedUser)`
 */
export const mockAuthenticatedUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  role: 'admin',
  full_name: 'Test User',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
}

/**
 * Create a lightweight wrapper with QueryClientProvider and pre-seeded auth user.
 * Useful for testing hooks (renderHook) that only need QueryClient + auth.
 *
 * @example
 * ```typescript
 * const { result } = renderHook(() => useMyHook(), {
 *   wrapper: createTestWrapper(),
 * })
 * ```
 */
export function createTestWrapper(queryClient?: QueryClient) {
  const client =
    queryClient ??
    new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

  client.setQueryData(authKeys.user(), mockAuthenticatedUser)

  // eslint-disable-next-line react/display-name
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children)
}

type AllProvidersProps = {
  children: ReactNode
  locale?: Locale
  queryClient?: QueryClient
}

/**
 * Wrapper component with all providers
 */
function AllProviders({ children, locale = 'en', queryClient }: AllProvidersProps) {
  const client = queryClient ?? getTestQueryClient()
  const testMessages: Record<Locale, Messages> = { ru: ruMessages, en: enMessages }
  const currentMessages = testMessages[locale]

  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme="dark"
      cssVariablesResolver={cssVariablesResolver}
    >
      <IntlProvider locale={locale} messages={currentMessages}>
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      </IntlProvider>
    </MantineProvider>
  )
}

/**
 * Custom render function with all providers
 *
 * @example
 * ```typescript
 * // Basic usage
 * render(<MyComponent />)
 *
 * // With custom locale
 * render(<MyComponent />, { locale: 'ru' })
 *
 * // With custom query client
 * const queryClient = createTestQueryClient()
 * queryClient.setQueryData(['user'], mockUser)
 * render(<MyComponent />, { queryClient })
 * ```
 */
function customRender(ui: ReactElement, options: CustomRenderOptions = {}) {
  const { locale = 'en', queryClient, wrapper: CustomWrapper, ...renderOptions } = options

  const Wrapper = ({ children }: { children: ReactNode }) => {
    const content = (
      <AllProviders locale={locale} queryClient={queryClient}>
        {children}
      </AllProviders>
    )

    if (CustomWrapper) {
      return <CustomWrapper>{content}</CustomWrapper>
    }

    return content
  }

  return {
    ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
    // Return utilities for advanced testing
    queryClient: queryClient ?? getTestQueryClient(),
  }
}

// Override render export
export { customRender as render }

/**
 * Render with Mantine only (without Query, Intl)
 * Useful for testing pure UI components
 */
export function renderWithMantine(ui: ReactElement, options: Omit<RenderOptions, 'wrapper'> = {}) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MantineProvider
      theme={theme}
      defaultColorScheme="dark"
      cssVariablesResolver={cssVariablesResolver}
    >
      {children}
    </MantineProvider>
  )

  return rtlRender(ui, { wrapper: Wrapper, ...options })
}

/**
 * Render with custom providers
 * For cases where you need fine-grained control
 */
export function renderWithProviders(
  ui: ReactElement,
  providers: Array<(children: ReactNode) => ReactNode>,
  options: Omit<RenderOptions, 'wrapper'> = {}
) {
  const Wrapper = ({ children }: { children: ReactNode }) => {
    return providers.reduceRight((acc, provider) => provider(acc), children)
  }

  return rtlRender(ui, { wrapper: Wrapper, ...options })
}

/**
 * Wait for async updates to complete
 * Useful when testing components with useEffect or async state
 */
export async function waitForLoadingToFinish() {
  const { waitFor, screen } = await import('@testing-library/react')

  await waitFor(
    () => {
      const loaders = screen.queryAllByRole('progressbar')
      if (loaders.length > 0) {
        throw new Error('Still loading')
      }
    },
    { timeout: 5000 }
  )
}

/**
 * Type-safe wrapper for testing hooks
 * Use with @testing-library/react's renderHook
 */
export function createHookWrapper(options: Omit<CustomRenderOptions, 'wrapper'> = {}) {
  const { locale = 'en', queryClient } = options

  return function HookWrapper({ children }: { children: ReactNode }) {
    return (
      <AllProviders locale={locale} queryClient={queryClient}>
        {children}
      </AllProviders>
    )
  }
}
