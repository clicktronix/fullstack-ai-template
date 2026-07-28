import {
  createTheme,
  Button,
  Card,
  SegmentedControl,
  Radio,
  Switch,
  Checkbox,
  NumberInput,
  MultiSelect,
  Select,
  Tabs,
  Textarea,
  ActionIcon,
  TextInput,
  PasswordInput,
  Paper,
  Table,
  Tooltip,
  Popover,
  Menu,
  Modal,
  Anchor,
  Badge,
  Loader,
  NavLink,
} from '@mantine/core'
import { actionIntentTokens } from './intents'
import { darkColorScales } from './palette-dark'
import { schemePalettes } from './resolver'
import { surfaceTokens } from './surfaces'
import inputStyles from './theme-inputs.module.css'

export const theme = createTheme({
  colors: {
    // Provide base map (Mantine uses these to derive tokens)
    ...darkColorScales,
  },
  primaryColor: 'rose',
  primaryShade: {
    light: 6,
    dark: 6,
  },
  white: 'rgba(255, 255, 255, 1)',
  black: 'rgba(0, 0, 0, 1)',
  autoContrast: true,
  luminanceThreshold: 0.3,
  defaultGradient: {
    from: 'rose',
    to: 'sky',
    deg: 135,
  },
  fontFamily: 'var(--font-onest), system-ui, sans-serif',
  defaultRadius: 'md',
  fontSmoothing: true,
  focusRing: 'auto',

  // Expose tokens to theme.other for consumers that need raw values
  other: {
    surfaces: surfaceTokens,
    actions: actionIntentTokens,
    palette: schemePalettes,
  },

  fontSizes: {
    xs: '0.6875rem',
    sm: '0.8125rem',
    md: '0.875rem',
    lg: '1rem',
    xl: '1.25rem',
  },
  lineHeights: {
    xs: '1.3',
    sm: '1.35',
    md: '1.45',
    lg: '1.5',
    xl: '1.6',
  },
  headings: {
    fontFamily: 'var(--font-unbounded), var(--font-onest), system-ui, sans-serif',
    sizes: {
      h1: { fontSize: '28px', lineHeight: '1.2', fontWeight: '700' },
      h2: { fontSize: '22px', lineHeight: '1.25', fontWeight: '600' },
      h3: { fontSize: '18px', lineHeight: '1.3', fontWeight: '600' },
      h4: { fontSize: '16px', lineHeight: '1.35', fontWeight: '500' },
      h5: { fontSize: '14px', lineHeight: '1.4', fontWeight: '500' },
    },
  },

  components: {
    // Tabs and SegmentedControl don't use --mantine-primary-color-filled by default
    Tabs: Tabs.extend({
      styles: () => ({
        root: {
          '--tabs-color': 'var(--mantine-primary-color-filled)',
        },
        panel: {
          animation: 'tabFadeIn 200ms ease',
        },
      }),
    }),
    Button: Button.extend({
      defaultProps: { size: 'xs' },
      vars: (_theme, props) => {
        // Only override variants without explicit color
        if (props.color) {
          return { root: {} }
        }
        const isFilled = props.variant === 'filled' || props.variant === undefined
        const isLight = props.variant === 'light'
        const isSubtle = props.variant === 'subtle'
        const isOutline = props.variant === 'outline'
        const isTransparent = props.variant === 'transparent'

        if (isFilled) {
          return {
            root: {
              '--button-bg': 'var(--mantine-primary-color-filled)',
              '--button-hover': 'var(--mantine-primary-color-filled-hover)',
              '--button-color': 'var(--mantine-primary-color-contrast)',
            },
          }
        }
        if (isLight) {
          return {
            root: {
              '--button-bg': 'var(--mantine-primary-color-light)',
              '--button-hover': 'var(--mantine-primary-color-light-hover)',
              '--button-color': 'var(--mantine-primary-color-light-color)',
            },
          }
        }
        if (isSubtle) {
          return {
            root: {
              '--button-bg': 'transparent',
              '--button-hover': 'var(--mantine-primary-color-light)',
              '--button-color': 'var(--mantine-primary-color-filled)',
            },
          }
        }
        if (isOutline) {
          return {
            root: {
              '--button-bg': 'transparent',
              '--button-hover': 'var(--mantine-primary-color-light)',
              '--button-color': 'var(--mantine-primary-color-filled)',
              '--button-bd': `1px solid var(--mantine-primary-color-filled)`,
            },
          }
        }
        if (isTransparent) {
          return {
            root: {
              '--button-bg': 'transparent',
              '--button-hover': 'transparent',
              '--button-color': 'var(--mantine-primary-color-filled)',
            },
          }
        }
        return { root: {} }
      },
    }),
    Card: Card.extend({
      defaultProps: { withBorder: true },
      styles: () => ({
        root: {
          backgroundColor: 'var(--mantine-color-default)',
          borderColor: 'var(--mantine-color-default-border)',
          color: 'var(--mantine-color-text)',
          boxShadow: 'var(--shadow-xs)',
        },
      }),
    }),
    ActionIcon: ActionIcon.extend({
      defaultProps: { size: 'sm', variant: 'transparent' },
      styles: () => ({
        root: {
          transition: 'background-color 150ms ease, color 150ms ease',
        },
      }),
      vars: (_theme, props) => {
        // Only override variants without explicit color
        if (props.color) {
          return { root: {} }
        }
        const isFilled = props.variant === 'filled'
        const isLight = props.variant === 'light'
        const isSubtle = props.variant === 'subtle'
        const isTransparent = props.variant === 'transparent'

        if (isFilled) {
          return {
            root: {
              '--ai-bg': 'var(--mantine-primary-color-filled)',
              '--ai-hover': 'var(--mantine-primary-color-filled-hover)',
              '--ai-color': 'var(--mantine-primary-color-contrast)',
            },
          }
        }
        if (isLight) {
          return {
            root: {
              '--ai-bg': 'var(--mantine-primary-color-light)',
              '--ai-hover': 'var(--mantine-primary-color-light-hover)',
              '--ai-color': 'var(--mantine-primary-color-light-color)',
            },
          }
        }
        if (isSubtle) {
          return {
            root: {
              '--ai-bg': 'transparent',
              '--ai-hover': 'var(--mantine-primary-color-light)',
              '--ai-color': 'var(--mantine-primary-color-filled)',
            },
          }
        }
        if (isTransparent) {
          return {
            root: {
              '--ai-bg': 'transparent',
              '--ai-hover': 'transparent',
              '--ai-color': 'var(--mantine-primary-color-filled)',
            },
          }
        }
        return { root: {} }
      },
    }),
    // Base input styles for a flatter, crisp look
    TextInput: TextInput.extend({
      defaultProps: { size: 'xs' },
      classNames: { input: inputStyles.input },
    }),
    PasswordInput: PasswordInput.extend({
      defaultProps: { size: 'xs' },
      classNames: { input: inputStyles.inputFocusWithin },
    }),
    Textarea: Textarea.extend({
      defaultProps: { size: 'xs' },
      classNames: { input: inputStyles.input },
    }),
    Select: Select.extend({
      defaultProps: { size: 'xs' },
      classNames: { input: inputStyles.input },
    }),
    MultiSelect: MultiSelect.extend({
      defaultProps: { size: 'xs' },
      classNames: { input: inputStyles.inputFocusWithin },
    }),
    NumberInput: NumberInput.extend({
      defaultProps: { size: 'xs' },
      classNames: { input: inputStyles.input },
    }),
    // Checkbox, Switch, Radio - override colors to use CSS variables
    Checkbox: Checkbox.extend({
      defaultProps: { size: 'xs' },
      vars: (_theme, props) => {
        if (props.color) {
          return { root: {} }
        }
        return {
          root: {
            '--checkbox-color': 'var(--mantine-primary-color-filled)',
          },
        }
      },
    }),
    Switch: Switch.extend({
      defaultProps: { size: 'xs' },
      vars: (_theme, props) => {
        if (props.color) {
          return { root: {} }
        }
        return {
          root: {
            '--switch-color': 'var(--mantine-primary-color-filled)',
          },
        }
      },
    }),
    Radio: Radio.extend({
      vars: (_theme, props) => {
        if (props.color) {
          return { root: {} }
        }
        return {
          root: {
            '--radio-color': 'var(--mantine-primary-color-filled)',
          },
        }
      },
    }),
    RadioGroup: Radio.Group.extend({ defaultProps: { size: 'xs' } }),
    // SegmentedControl doesn't use --mantine-primary-color-filled by default
    SegmentedControl: SegmentedControl.extend({
      defaultProps: { size: 'xs' },
      styles: () => ({
        root: {
          '--sc-color': 'var(--mantine-primary-color-filled)',
        },
      }),
    }),
    Paper: Paper.extend({
      defaultProps: { withBorder: true },
      styles: () => ({
        root: {
          backgroundColor: 'var(--mantine-color-default)',
          borderColor: 'var(--mantine-color-default-border)',
          color: 'var(--mantine-color-text)',
        },
      }),
    }),
    Table: Table.extend({
      styles: () => ({
        table: {
          borderColor: 'var(--mantine-color-default-border)',
        },
        thead: {
          backgroundColor: 'transparent',
        },
        th: {
          borderBottom: '1px solid var(--mantine-color-default-border)',
          color: 'var(--mantine-color-dimmed)',
          fontWeight: '500',
        },
        tbody: {
          'tr td': {
            borderColor: 'var(--mantine-color-default-border)',
          },
        },
      }),
    }),
    Tooltip: Tooltip.extend({
      defaultProps: {
        openDelay: 1000,
        transitionProps: { transition: 'fade', duration: 150 },
      },
      styles: () => ({
        tooltip: {
          backgroundColor:
            'light-dark(color-mix(in srgb, var(--mantine-color-default) 92%, white), color-mix(in srgb, var(--mantine-color-default) 88%, black))',
          color: 'var(--mantine-color-text)',
          border: '1px solid var(--mantine-color-default-border)',
          boxShadow: 'var(--shadow-md)',
        },
      }),
    }),
    Popover: Popover.extend({
      defaultProps: {
        transitionProps: { transition: 'fade', duration: 150 },
      },
      styles: () => ({
        dropdown: {
          backgroundColor: 'var(--mantine-color-default)',
          borderColor: 'var(--mantine-color-default-border)',
          color: 'var(--mantine-color-text)',
          boxShadow: 'var(--shadow-md)',
        },
      }),
    }),
    Menu: Menu.extend({
      defaultProps: {
        transitionProps: { transition: 'fade', duration: 100 },
      },
      styles: () => ({
        dropdown: {
          backgroundColor: 'var(--mantine-color-default)',
          borderColor: 'var(--mantine-color-default-border)',
          color: 'var(--mantine-color-text)',
          boxShadow: 'var(--shadow-md)',
        },
      }),
    }),
    Modal: Modal.extend({
      defaultProps: {
        transitionProps: { transition: 'pop', duration: 200 },
      },
      styles: () => ({
        content: {
          backgroundColor: 'var(--mantine-color-default)',
          color: 'var(--mantine-color-text)',
          overscrollBehavior: 'contain',
          boxShadow: 'var(--shadow-lg)',
        },
        header: {
          backgroundColor: 'var(--mantine-color-default)',
          color: 'var(--mantine-color-text)',
        },
      }),
    }),
    Anchor: Anchor.extend({
      styles: () => ({
        root: {
          color: 'var(--mantine-color-anchor)',
        },
      }),
    }),
    Badge: Badge.extend({
      defaultProps: { radius: 'md', fw: 500, size: 'sm' },
      styles: () => ({
        root: {
          transition: 'background-color 150ms ease, color 150ms ease, opacity 150ms ease',
        },
        label: { textTransform: 'none' as const },
      }),
      vars: (_theme, props) => {
        // Custom hex colors: brighter light variant on dark theme
        if (props.color?.startsWith('#') && props.variant === 'light') {
          return {
            root: {
              '--badge-bg': `light-dark(color-mix(in srgb, ${props.color} 15%, transparent), color-mix(in srgb, ${props.color} 30%, transparent))`,
              '--badge-color': props.color,
            },
          }
        }

        if (props.color) {
          return { root: {} }
        }

        const isFilled = props.variant === 'filled' || props.variant === undefined
        const isLight = props.variant === 'light'

        if (isFilled) {
          return {
            root: {
              '--badge-bg': 'var(--mantine-primary-color-filled)',
              '--badge-color': 'var(--mantine-primary-color-contrast)',
            },
          }
        }
        if (isLight) {
          return {
            root: {
              '--badge-bg': 'var(--mantine-primary-color-light)',
              '--badge-color': 'var(--mantine-color-text)', // Notion tags use standard text color on subtle BG
            },
          }
        }
        return { root: {} }
      },
    }),
    NavLink: NavLink.extend({
      vars: (_theme, props) => {
        if (props.color) {
          return { root: {}, children: {} }
        }
        const isLight = props.variant === 'light'
        const isSubtle = props.variant === 'subtle'
        const isFilled = props.variant === 'filled'

        if (isLight) {
          return {
            root: {
              '--nl-bg': 'var(--mantine-primary-color-light)',
              '--nl-hover': 'var(--mantine-primary-color-light-hover)',
              '--nl-color': 'var(--mantine-primary-color-filled)',
            },
            children: {},
          }
        }
        if (isSubtle) {
          return {
            root: {
              '--nl-bg': 'transparent',
              '--nl-hover': 'var(--mantine-primary-color-light)',
              '--nl-color': 'var(--mantine-primary-color-filled)',
            },
            children: {},
          }
        }
        if (isFilled) {
          return {
            root: {
              '--nl-bg': 'var(--mantine-primary-color-filled)',
              '--nl-hover': 'var(--mantine-primary-color-filled-hover)',
              '--nl-color': 'var(--mantine-primary-color-contrast)',
            },
            children: {},
          }
        }
        return { root: {}, children: {} }
      },
    }),
    Loader: Loader.extend({
      vars: (_theme, props) => {
        if (props.color) {
          return { root: {} }
        }
        return {
          root: {
            '--loader-color': 'var(--mantine-primary-color-filled)',
          },
        }
      },
    }),
  },
})
