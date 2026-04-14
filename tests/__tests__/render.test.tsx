/// <reference lib="dom" />

/**
 * Tests for custom render utilities
 *
 * Verifies that the custom render function properly wraps components
 * with all necessary providers (Mantine, Intl, QueryClient).
 */

import { Button, Text } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'
import { describe, expect, test } from 'bun:test'
import { FormattedMessage } from 'react-intl'
import {
  render,
  renderWithMantine,
  createTestQueryClient,
  createHookWrapper,
  getScreen,
  waitFor,
  within,
} from '../utils/render'

// Simple test component using Mantine
function MantineButton({ label }: { label: string }) {
  return (
    <Button data-testid="mantine-button" variant="filled">
      {label}
    </Button>
  )
}

// Component using react-intl
function IntlComponent() {
  return (
    <Text data-testid="intl-text">
      <FormattedMessage id="nav.home" defaultMessage="Home" />
    </Text>
  )
}

// Component using TanStack Query
function QueryComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['test-query'],
    queryFn: () => Promise.resolve('Query Result'),
  })

  if (isLoading) {
    return <div data-testid="loading">Loading...</div>
  }

  return <div data-testid="query-result">{data}</div>
}

describe('Custom Render Utilities', () => {
  describe('render (full providers)', () => {
    test('renders component with Mantine styles', () => {
      const { container } = render(<MantineButton label="Click me" />)
      const screen = within(container)

      const button = screen.getByTestId('mantine-button')
      expect(button).toBeDefined()
      expect(button.textContent).toBe('Click me')
    })

    test('renders component with i18n (English)', () => {
      const { container } = render(<IntlComponent />)
      const screen = within(container)

      const text = screen.getByTestId('intl-text')
      expect(text.textContent).toBe('Home')
    })

    test('renders component with i18n (Russian)', () => {
      const { container } = render(<IntlComponent />, { locale: 'ru' })
      const screen = within(container)

      const text = screen.getByTestId('intl-text')
      expect(text.textContent).toContain('Главная')
    })

    test('renders component with TanStack Query', async () => {
      const { container } = render(<QueryComponent />)
      const screen = within(container)

      // Initially shows loading
      expect(screen.getByTestId('loading')).toBeDefined()

      // Wait for query to resolve
      await waitFor(() => {
        const result = container.querySelector('[data-testid="query-result"]')
        expect(result).not.toBeNull()
      })

      expect(screen.getByTestId('query-result').textContent).toBe('Query Result')
    })

    test('accepts custom query client with prefilled data', async () => {
      const queryClient = createTestQueryClient()
      // Set data with long staleTime so it won't refetch
      queryClient.setQueryData(['test-query'], 'Prefilled Data')
      queryClient.setQueryDefaults(['test-query'], { staleTime: Infinity })

      const { container } = render(<QueryComponent />, { queryClient })

      // Wait for component to settle with prefilled data
      await waitFor(() => {
        const result = container.querySelector('[data-testid="query-result"]')
        expect(result).not.toBeNull()
      })

      const screen = within(container)
      // Should show prefilled data
      expect(screen.getByTestId('query-result').textContent).toBe('Prefilled Data')
    })
  })

  describe('renderWithMantine', () => {
    test('renders component with Mantine only', () => {
      const { container } = renderWithMantine(<MantineButton label="Mantine Only" />)
      const screen = within(container)

      const button = screen.getByTestId('mantine-button')
      expect(button.textContent).toBe('Mantine Only')
    })
  })

  describe('createHookWrapper', () => {
    test('creates wrapper for renderHook', async () => {
      const wrapper = createHookWrapper()
      const queryFn = () => Promise.resolve('Hook Result')

      const { result } = renderHook(
        () =>
          useQuery({
            queryKey: ['hook-test'],
            queryFn,
          }),
        { wrapper }
      )

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBe('Hook Result')
    })
  })

  describe('createTestQueryClient', () => {
    test('creates QueryClient with test-friendly defaults', () => {
      const client = createTestQueryClient()

      const defaultOptions = client.getDefaultOptions()

      // Verify retry is disabled
      expect(defaultOptions.queries?.retry).toBe(false)
      expect(defaultOptions.mutations?.retry).toBe(false)
    })

    test('allows setting query data', () => {
      const client = createTestQueryClient()

      client.setQueryData(['test-key'], { foo: 'bar' })

      const data = client.getQueryData(['test-key'])
      expect(data).toEqual({ foo: 'bar' })
    })
  })

  describe('getScreen utility', () => {
    test('returns screen queries', () => {
      render(<div data-testid="screen-test">Screen Test</div>)

      const screen = getScreen()
      const element = screen.getByTestId('screen-test')

      expect(element.textContent).toBe('Screen Test')
    })
  })
})

describe('jest-dom Matchers', () => {
  test('toBeInTheDocument works', () => {
    const { container } = render(<div data-testid="test-element">Content</div>)
    const queries = within(container)

    expect(queries.getByTestId('test-element')).toBeInTheDocument()
  })

  test('toHaveTextContent works', () => {
    const { container } = render(<div data-testid="text-element">Hello World</div>)
    const queries = within(container)

    expect(queries.getByTestId('text-element')).toHaveTextContent('Hello World')
  })

  test('toBeVisible works', () => {
    const { container } = render(<div data-testid="visible-element">Visible</div>)
    const queries = within(container)

    expect(queries.getByTestId('visible-element')).toBeVisible()
  })

  test('toHaveAttribute works', () => {
    const { container } = render(<button data-testid="attr-button" disabled type="submit" />)
    const queries = within(container)

    const button = queries.getByTestId('attr-button')
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toBeDisabled()
  })
})
