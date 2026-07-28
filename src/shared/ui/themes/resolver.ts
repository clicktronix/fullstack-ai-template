import type { CSSVariablesResolver } from '@mantine/core'
import { actionIntentTokens } from './intents'
import { darkColorScales } from './palette-dark'
import { lightColorScales } from './palette-light'
import { surfaceTokens } from './surfaces'

// Export map of scheme -> palette for consumers that need raw scales
export const schemePalettes = {
  dark: darkColorScales,
  light: lightColorScales,
} as const

export type ColorSchemeName = keyof typeof schemePalettes

// Build CSS variables for a given scheme:
// - core surfaces (body/default/text/border)
// - full 10-shade series for each color (e.g., --mantine-color-blue-0..9)
// - primary color: rose in both schemes
// - links/info accent: sky in both schemes
// - primary color semantic variables (filled, light, contrast)
// - action intent tokens (edit, delete, confirm, cancel)
const paletteKeys = Object.keys(darkColorScales) as Array<keyof typeof darkColorScales>

const buildSchemeVariables = (scheme: ColorSchemeName) => {
  const palette = schemePalettes[scheme]
  const surfaces = surfaceTokens[scheme]
  const isDark = scheme === 'dark'

  const variables: Record<string, string> = {
    // Core surface tokens
    '--mantine-color-body': surfaces.body,
    '--mantine-color-text': surfaces.text,
    '--mantine-color-dimmed': surfaces.mutedText,
    '--mantine-color-default': surfaces.elevated,
    '--mantine-color-default-hover': surfaces.elevatedHover,
    '--mantine-color-default-color': surfaces.text,
    '--mantine-color-default-border': surfaces.border,
  }

  // Inject all color scales (0-9 shades for each color)
  // + light variant variables with brighter alpha on dark theme
  const lightAlpha = isDark ? '30%' : '15%'
  const lightHoverAlpha = isDark ? '38%' : '20%'

  for (const color of paletteKeys) {
    const shades = palette[color]
    shades.forEach((value, index) => {
      variables[`--mantine-color-${color}-${index}`] = value
    })

    const refShade = shades[5]
    variables[`--mantine-color-${color}-light`] =
      `color-mix(in srgb, ${refShade} ${lightAlpha}, transparent)`
    variables[`--mantine-color-${color}-light-hover`] =
      `color-mix(in srgb, ${refShade} ${lightHoverAlpha}, transparent)`
    variables[`--mantine-color-${color}-light-color`] = refShade
  }

  // Primary color variables
  // Current Theme v2 keeps one primary accent (rose) across both schemes.
  const primary = isDark ? darkColorScales.rose : lightColorScales.rose
  const primaryShade = 6
  const primaryHoverShade = 7

  primary.forEach((value, index) => {
    variables[`--mantine-color-primary-${index}`] = value
  })

  // Semantic primary color variables (Mantine 7+ best practice)
  variables['--mantine-primary-color-filled'] = primary[primaryShade]
  variables['--mantine-primary-color-filled-hover'] = primary[primaryHoverShade]
  const primaryRef = primary[primaryShade]
  variables['--mantine-primary-color-light'] =
    `color-mix(in srgb, ${primaryRef} ${lightAlpha}, transparent)`
  variables['--mantine-primary-color-light-hover'] =
    `color-mix(in srgb, ${primaryRef} ${lightHoverAlpha}, transparent)`
  variables['--mantine-primary-color-light-color'] = primary[primaryShade]
  variables['--mantine-primary-color-contrast'] = '#FFFFFF'

  // Anchor/info color stays blue to separate links from primary CTA
  const anchor = isDark ? darkColorScales.sky[5] : lightColorScales.sky[6]
  variables['--mantine-color-anchor'] = anchor

  // Action intent tokens (edit, delete, confirm, cancel)
  Object.entries(actionIntentTokens).forEach(([intent, schemes]) => {
    const tokens = schemes[scheme]
    variables[`--mantine-action-${intent}-fg`] = tokens.fg
    variables[`--mantine-action-${intent}-bg`] = tokens.bg
    variables[`--mantine-action-${intent}-hover-bg`] = tokens.hoverBg
    variables[`--mantine-action-${intent}-border`] = tokens.border
  })

  return variables
}

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: buildSchemeVariables('light'),
  dark: buildSchemeVariables('dark'),
})
