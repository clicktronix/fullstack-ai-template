// Dark scheme color scales
// Each key is a Mantine color name with 10 shades [0..9]
// - dark: primary dark neutrals for backgrounds, text contrast and UI chrome
// - gray: neutral utility scale for borders, dividers, subtle fills
// - blue/orange: primary and secondary accent colors
// - green/red: positive/negative statuses
// - teal/violet/yellow: additional data viz and emphasis colors
export const darkColorScales = {
  // Premium Slate: Deep blue-grey for rich, modern application surfaces
  dark: [
    '#C1C2C5', // 0: Text (High Contrast)
    '#A6A7AB', // 1: Text (Dimmed)
    '#909296', // 2: Text (Muted)
    '#5C5F66', // 3: Borders (Subtle)
    '#373A40', // 4: Borders (Strong)
    '#2C2E33', // 5: UI Elements (Hover)
    '#25262B', // 6: UI Elements (Default)
    '#1A1B1E', // 7: Surface (Elevated)
    '#141517', // 8: Surface (Base)
    '#101113', // 9: Surface (Deep)
  ],
  // Cool Gray: Complements the slate tones
  gray: [
    '#F8F9FA',
    '#F1F3F5',
    '#E9ECEF',
    '#DEE2E6',
    '#CED4DA',
    '#ADB5BD',
    '#868E96',
    '#495057',
    '#343A40',
    '#212529',
  ],
  blue: [
    '#E7F5FF',
    '#D0EBFF',
    '#A5D8FF',
    '#74C0FC',
    '#4DABF7',
    '#339AF0',
    '#228BE6',
    '#1C7ED6',
    '#1971C2',
    '#1864AB',
  ],
  // Vibrant Orange: High energy, high contrast against slate
  orange: [
    '#FFF4E6',
    '#FFE8CC',
    '#FFD8A8',
    '#FFC078',
    '#FFA94D',
    '#FF922B',
    '#FD7E14',
    '#F76707',
    '#E8590C',
    '#D9480F',
  ],
  green: [
    '#EBFBEE',
    '#D3F9D8',
    '#B2F2BB',
    '#8CE99A',
    '#69DB7C',
    '#51CF66',
    '#40C057',
    '#37B24D',
    '#2F9E44',
    '#2B8A3E',
  ],
  red: [
    '#FFF5F5',
    '#FFE3E3',
    '#FFC9C9',
    '#FFA8A8',
    '#FF8787',
    '#FF6B6B',
    '#FA5252',
    '#F03E3E',
    '#E03131',
    '#C92A2A',
  ],
  teal: [
    '#E6FCF5',
    '#C3FAE8',
    '#96F2D7',
    '#63E6BE',
    '#38D9A9',
    '#20C997',
    '#12B886',
    '#0CA678',
    '#099268',
    '#087F5B',
  ],
  violet: [
    '#F3F0FF',
    '#E5DBFF',
    '#D0BFFF',
    '#B197FC',
    '#9775FA',
    '#845EF7',
    '#7950F2',
    '#7048E8',
    '#6741D9',
    '#5F3DC4',
  ],
  yellow: [
    '#FFF9DB',
    '#FFF3BF',
    '#FFEC99',
    '#FFE066',
    '#FFD43B',
    '#FCC419',
    '#FAB005',
    '#F59F00',
    '#F08C00',
    '#E67700',
  ],
  // Coral-Rose: Primary brand accent for dark theme
  // Primary: #E84580 (shade 5), Secondary: #FF8FAB (shade 3), Subtle: #7A1245 (shade 9)
  rose: [
    '#FFF0F3', // 0: Lightest tint
    '#FFD6E0', // 1: Light hover
    '#FFB3C6', // 2: Secondary accents
    '#FF8FAB', // 3: Dimmed accent
    '#F06292', // 4: Bright focus
    '#E84580', // 5: PRIMARY
    '#D63672', // 6: Deep buttons
    '#C02565', // 7: Hover buttons
    '#A01A57', // 8: Pressed
    '#7A1245', // 9: Subtle dark
  ],
  // Amber: Secondary accent for data-viz and secondary accents
  amber: [
    '#FFF8E1',
    '#FFECB3',
    '#FFE082',
    '#FFD54F',
    '#FFCA28',
    '#FFC107',
    '#FFB300',
    '#FFA000',
    '#FF8F00',
    '#FF6F00',
  ],
  // Sky: Same as light theme for consistency (used as secondary on dark)
  sky: [
    '#f0f9ff',
    '#e0f2fe',
    '#bae6fd',
    '#7dd3fc',
    '#38bdf8',
    '#0ea5e9',
    '#0284c7',
    '#0369a1',
    '#075985',
    '#0c4a6e',
  ],
} as const
