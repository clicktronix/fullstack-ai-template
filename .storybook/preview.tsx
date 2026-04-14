import { MantineProvider } from '@mantine/core'
import type { Preview } from '@storybook/nextjs-vite'
import { IntlProvider } from 'react-intl'
import { enMessages } from '@/infrastructure/i18n/locales/en'
import { theme } from '@/ui/themes'
import { cssVariablesResolver } from '@/ui/themes/resolver'
import '@mantine/core/styles.layer.css'
import '@mantine/charts/styles.layer.css'
import '@mantine/notifications/styles.layer.css'
import '@mantine/nprogress/styles.layer.css'
import '../src/app/globals.css'

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Global color scheme for stories',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: ['dark', 'light'],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'dark',
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: { disable: true },
  },
  decorators: [
    (Story, context) => (
      <IntlProvider locale="en" messages={enMessages}>
        <MantineProvider
          theme={theme}
          forceColorScheme={context.globals.theme === 'light' ? 'light' : 'dark'}
          cssVariablesResolver={cssVariablesResolver}
        >
          <Story />
        </MantineProvider>
      </IntlProvider>
    ),
  ],
}

export default preview
