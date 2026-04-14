/**
 * Color manipulation utilities
 *
 * Common functions for working with colors in different formats (hex, rgb, rgba).
 * Used primarily for chart visualizations and dynamic color calculations.
 */

type RGB = [number, number, number]

/**
 * Parse any color format to RGB array
 * Supports: #RRGGBB, rgb(r,g,b), rgba(r,g,b,a)
 *
 * @returns RGB array or null if parsing fails
 */
export function parseColor(color: string): RGB | null {
  if (!color) return null

  // #RRGGBB format
  if (color.startsWith('#') && color.length === 7) {
    const r = Number.parseInt(color.slice(1, 3), 16)
    const g = Number.parseInt(color.slice(3, 5), 16)
    const b = Number.parseInt(color.slice(5, 7), 16)
    if ([r, g, b].some((x) => Number.isNaN(x))) return null
    return [r, g, b]
  }

  // rgb(...) / rgba(...) format
  const rgbMatch = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i)
  if (rgbMatch) {
    const r = Number(rgbMatch[1])
    const g = Number(rgbMatch[2])
    const b = Number(rgbMatch[3])
    if ([r, g, b].some((x) => Number.isNaN(x))) return null
    return [r, g, b]
  }

  return null
}

/**
 * Parse hex color to RGB array (strict #RRGGBB only)
 *
 * @returns RGB array, fallback to gray if parsing fails
 */
export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return [128, 128, 128]
  return [
    Number.parseInt(result[1], 16),
    Number.parseInt(result[2], 16),
    Number.parseInt(result[3], 16),
  ]
}

/**
 * Convert RGB values to hex string
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('')}`
}

/**
 * Interpolate between two hex colors based on intensity (0-1)
 *
 * @param fromHex - Starting color
 * @param toHex - Target color
 * @param intensity - Interpolation factor (0 = fromHex, 1 = toHex)
 */
export function interpolateColor(fromHex: string, toHex: string, intensity: number): string {
  const from = hexToRgb(fromHex)
  const to = hexToRgb(toHex)
  const r = from[0] + (to[0] - from[0]) * intensity
  const g = from[1] + (to[1] - from[1]) * intensity
  const b = from[2] + (to[2] - from[2]) * intensity
  return rgbToHex(r, g, b)
}

/**
 * Add alpha channel to a hex color
 *
 * @param hexColor - Color in #RRGGBB format
 * @param alpha - Alpha value (0-1)
 * @returns rgba() string
 */
export function withAlpha(hexColor: string, alpha: number): string {
  if (!hexColor.startsWith('#') || hexColor.length !== 7) return hexColor
  const [r, g, b] = hexToRgb(hexColor)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Calculate relative luminance of a color (sRGB)
 * Used for determining readable text color against a background
 *
 * @returns Luminance value (0-1, where 0 is black and 1 is white)
 */
export function getLuminance(color: string): number {
  const rgb = parseColor(color)
  if (!rgb) return 0.5 // Return mid-luminance for invalid colors

  // sRGB to linear RGB conversion constants
  const SRGB_TO_LINEAR_THRESHOLD = 3.928e-2
  const SRGB_TO_LINEAR_DIVISOR = 12.92
  const SRGB_TO_LINEAR_OFFSET = 0.055
  const SRGB_TO_LINEAR_SCALE = 1.055
  const SRGB_TO_LINEAR_EXPONENT = 2.4

  const [r, g, b] = rgb.map((v) => {
    const s = v / 255
    return s <= SRGB_TO_LINEAR_THRESHOLD
      ? s / SRGB_TO_LINEAR_DIVISOR
      : ((s + SRGB_TO_LINEAR_OFFSET) / SRGB_TO_LINEAR_SCALE) ** SRGB_TO_LINEAR_EXPONENT
  }) as RGB

  // Relative luminance formula (ITU-R BT.709)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Determine readable text color based on background luminance
 *
 * @param backgroundColor - Background color in any supported format
 * @param darkColors - Colors to use on bright backgrounds
 * @param lightColors - Colors to use on dark backgrounds
 * @param threshold - Luminance threshold (default 0.45)
 */
export function getReadableTextColor<T>(
  backgroundColor: string,
  darkColors: T,
  lightColors: T,
  threshold = 0.45
): T {
  const luminance = getLuminance(backgroundColor)
  return luminance > threshold ? darkColors : lightColors
}
