// Light scheme color scales (Current Theme v2)
// Naming mirrors dark scales for consistency; shades fine-tuned for light UI
// - dark: dark neutrals used as text/ink in light backgrounds
// - gray: utility neutrals for borders/dividers on light backgrounds
// - rose: primary CTA/brand accent for both schemes
// - sky/blue: information and link accents
// - green/red: positive/negative statuses
// - teal/violet/yellow: additional chart/emphasis colors
export const lightColorScales = {
  // Dark neutrals for text/ink
  dark: [
    '#C1C2C5',
    '#A6A7AB',
    '#909296',
    '#5C5F66',
    '#373A40',
    '#2C2E33',
    '#25262B',
    '#1A1B1E',
    '#141517',
    '#101113',
  ],
  // Clean Gray: Crisp neutrals for light mode
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
  // Sky: information/link accent for light theme
  sky: [
    '#f0f9ff', // 0 - lightest, backgrounds
    '#e0f2fe', // 1 - subtle backgrounds, hover states
    '#bae6fd', // 2 - light borders, dividers
    '#7dd3fc', // 3 - disabled states
    '#38bdf8', // 4 - secondary accent
    '#0ea5e9', // 5 - primary (default shade)
    '#0284c7', // 6 - hover state
    '#0369a1', // 7 - active/pressed state
    '#075985', // 8 - dark accent
    '#0c4a6e', // 9 - darkest, text on light
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
  // Vibrant Orange: Matches dark mode energy
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
  // Coral-Rose: Primary brand accent in both dark and light themes
  rose: [
    '#fff4f7',
    '#f8e1e8',
    '#efc5d2',
    '#e0a2b5',
    '#d7849c',
    '#ca6d89',
    '#bf5b7c',
    '#aa4d6b',
    '#833c56',
    '#683044',
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
} as const
