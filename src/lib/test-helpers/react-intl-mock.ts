/**
 * Shared react-intl mock for test files that use mock.module('react-intl').
 *
 * Usage in test files:
 * ```ts
 * import { mock } from 'bun:test'
 * import { reactIntlMock } from '@/lib/test-helpers/react-intl-mock'
 * mock.module('react-intl', () => reactIntlMock)
 * ```
 *
 * Why this exists:
 * bun's mock.module() affects the global module cache across ALL parallel test files.
 * If a mock is incomplete (e.g., missing FormattedMessage or values interpolation),
 * other test files that use react-intl will break with hard-to-debug errors.
 */

function interpolateValues(template: string, values?: Record<string, string | number>): string {
  if (!values) return template
  let result = template
  for (const [key, val] of Object.entries(values)) {
    result = result.replaceAll(`{${key}}`, String(val))
  }
  return result
}

export const reactIntlMock = {
  useIntl: () => ({
    formatMessage: (
      msg: { id: string; defaultMessage: string },
      values?: Record<string, string | number>
    ) => interpolateValues(msg.defaultMessage, values),
  }),
  FormattedMessage: ({
    defaultMessage,
    values,
  }: {
    id: string
    defaultMessage: string
    values?: Record<string, string | number>
  }) => interpolateValues(defaultMessage, values),
  IntlProvider: ({ children }: { children: unknown }) => children,
  defineMessages: (msgs: unknown) => msgs,
}
