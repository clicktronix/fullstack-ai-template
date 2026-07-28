import { darkColorScales } from './palette-dark'
import { lightColorScales } from './palette-light'

// Action intent tokens are used for compact, semi-transparent action icons and
// subtle emphasis (edit/delete/confirm/cancel) in both color schemes.
// Keep these soft to avoid overpowering muted dashboards and forms.
export const actionIntentTokens = {
  edit: {
    dark: {
      fg: darkColorScales.blue[4], // Blue-4 (Clearer blue)
      bg: 'rgba(51, 154, 240, 0.15)',
      hoverBg: 'rgba(51, 154, 240, 0.35)',
      border: 'rgba(51, 154, 240, 0.35)',
    },
    light: {
      fg: lightColorScales.blue[6],
      bg: 'rgba(34, 139, 230, 0.12)',
      hoverBg: 'rgba(34, 139, 230, 0.18)',
      border: 'rgba(34, 139, 230, 0.30)',
    },
  },
  delete: {
    dark: {
      fg: darkColorScales.red[4], // Red-4 (Softer red)
      bg: 'rgba(255, 135, 135, 0.15)',
      hoverBg: 'rgba(255, 135, 135, 0.35)',
      border: 'rgba(255, 135, 135, 0.35)',
    },
    light: {
      fg: lightColorScales.red[6],
      bg: 'rgba(250, 82, 82, 0.12)',
      hoverBg: 'rgba(250, 82, 82, 0.18)',
      border: 'rgba(250, 82, 82, 0.30)',
    },
  },
  confirm: {
    dark: {
      fg: darkColorScales.green[4], // Green-4 (Vibrant but soft)
      bg: 'rgba(105, 219, 124, 0.15)',
      hoverBg: 'rgba(105, 219, 124, 0.35)',
      border: 'rgba(105, 219, 124, 0.35)',
    },
    light: {
      fg: lightColorScales.green[6],
      bg: 'rgba(64, 192, 87, 0.12)',
      hoverBg: 'rgba(64, 192, 87, 0.18)',
      border: 'rgba(64, 192, 87, 0.30)',
    },
  },
  cancel: {
    dark: {
      fg: darkColorScales.gray[5], // Gray-5 (Clean gray)
      bg: 'rgba(173, 181, 189, 0.15)',
      hoverBg: 'rgba(173, 181, 189, 0.35)',
      border: 'rgba(173, 181, 189, 0.35)',
    },
    light: {
      fg: lightColorScales.gray[6],
      bg: 'rgba(134, 142, 150, 0.12)',
      hoverBg: 'rgba(134, 142, 150, 0.18)',
      border: 'rgba(134, 142, 150, 0.30)',
    },
  },
} as const
