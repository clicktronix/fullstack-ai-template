import { describe, expect, test } from 'bun:test'
import {
  parseColor,
  hexToRgb,
  rgbToHex,
  interpolateColor,
  withAlpha,
  getLuminance,
  getReadableTextColor,
} from '../color-utils'

describe('parseColor', () => {
  describe('hex format', () => {
    test('parses #RRGGBB format', () => {
      expect(parseColor('#ff0000')).toEqual([255, 0, 0])
    })

    test('parses black hex', () => {
      expect(parseColor('#000000')).toEqual([0, 0, 0])
    })

    test('parses white hex', () => {
      expect(parseColor('#ffffff')).toEqual([255, 255, 255])
    })

    test('parses uppercase hex', () => {
      expect(parseColor('#FF0000')).toEqual([255, 0, 0])
    })

    test('parses mixed case hex', () => {
      expect(parseColor('#aAbBcC')).toEqual([170, 187, 204])
    })

    test('returns null for 3-digit hex', () => {
      expect(parseColor('#f00')).toBeNull()
    })

    test('returns null for hex without #', () => {
      expect(parseColor('ff0000')).toBeNull()
    })

    test('returns null for invalid hex characters', () => {
      expect(parseColor('#gggggg')).toBeNull()
    })
  })

  describe('rgb format', () => {
    test('parses rgb(r,g,b)', () => {
      expect(parseColor('rgb(255, 0, 0)')).toEqual([255, 0, 0])
    })

    test('parses rgb without spaces', () => {
      expect(parseColor('rgb(255,128,64)')).toEqual([255, 128, 64])
    })

    test('parses rgb with extra spaces', () => {
      expect(parseColor('rgb(  255 ,  128  ,  64  )')).toEqual([255, 128, 64])
    })

    test('parses RGB uppercase', () => {
      expect(parseColor('RGB(100, 150, 200)')).toEqual([100, 150, 200])
    })
  })

  describe('rgba format', () => {
    test('parses rgba (ignores alpha)', () => {
      expect(parseColor('rgba(255, 0, 0, 0.5)')).toEqual([255, 0, 0])
    })

    test('parses rgba with alpha = 1', () => {
      expect(parseColor('rgba(128, 64, 32, 1)')).toEqual([128, 64, 32])
    })

    test('parses RGBA uppercase', () => {
      expect(parseColor('RGBA(100, 100, 100, 0.8)')).toEqual([100, 100, 100])
    })
  })

  describe('edge cases', () => {
    test('returns null for empty string', () => {
      expect(parseColor('')).toBeNull()
    })

    test('returns null for invalid format', () => {
      expect(parseColor('red')).toBeNull()
    })

    test('returns null for hsl format', () => {
      expect(parseColor('hsl(0, 100%, 50%)')).toBeNull()
    })
  })
})

describe('hexToRgb', () => {
  test('parses #RRGGBB format', () => {
    expect(hexToRgb('#ff0000')).toEqual([255, 0, 0])
  })

  test('parses without # prefix', () => {
    expect(hexToRgb('ff0000')).toEqual([255, 0, 0])
  })

  test('parses black', () => {
    expect(hexToRgb('#000000')).toEqual([0, 0, 0])
  })

  test('parses white', () => {
    expect(hexToRgb('#ffffff')).toEqual([255, 255, 255])
  })

  test('parses mixed color', () => {
    expect(hexToRgb('#4287f5')).toEqual([66, 135, 245])
  })

  test('returns gray fallback for invalid hex', () => {
    expect(hexToRgb('invalid')).toEqual([128, 128, 128])
  })

  test('returns gray fallback for 3-digit hex', () => {
    expect(hexToRgb('#fff')).toEqual([128, 128, 128])
  })

  test('returns gray fallback for empty string', () => {
    expect(hexToRgb('')).toEqual([128, 128, 128])
  })
})

describe('rgbToHex', () => {
  test('converts RGB to hex', () => {
    expect(rgbToHex(255, 0, 0)).toBe('#ff0000')
  })

  test('converts black', () => {
    expect(rgbToHex(0, 0, 0)).toBe('#000000')
  })

  test('converts white', () => {
    expect(rgbToHex(255, 255, 255)).toBe('#ffffff')
  })

  test('handles single digit values', () => {
    expect(rgbToHex(1, 2, 3)).toBe('#010203')
  })

  test('rounds decimal values', () => {
    expect(rgbToHex(127.4, 127.5, 127.6)).toBe('#7f8080')
  })

  test('converts mixed color', () => {
    expect(rgbToHex(66, 135, 245)).toBe('#4287f5')
  })
})

describe('interpolateColor', () => {
  test('returns fromHex at intensity 0', () => {
    expect(interpolateColor('#000000', '#ffffff', 0)).toBe('#000000')
  })

  test('returns toHex at intensity 1', () => {
    expect(interpolateColor('#000000', '#ffffff', 1)).toBe('#ffffff')
  })

  test('returns midpoint at intensity 0.5', () => {
    expect(interpolateColor('#000000', '#ffffff', 0.5)).toBe('#808080')
  })

  test('interpolates red to blue', () => {
    expect(interpolateColor('#ff0000', '#0000ff', 0.5)).toBe('#800080')
  })

  test('handles intensity 0.25', () => {
    const result = interpolateColor('#000000', '#ffffff', 0.25)
    expect(result).toBe('#404040')
  })

  test('handles intensity 0.75', () => {
    const result = interpolateColor('#000000', '#ffffff', 0.75)
    expect(result).toBe('#bfbfbf')
  })

  test('same colors returns same color', () => {
    expect(interpolateColor('#4287f5', '#4287f5', 0.5)).toBe('#4287f5')
  })
})

describe('withAlpha', () => {
  test('adds alpha to hex color', () => {
    expect(withAlpha('#ff0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)')
  })

  test('handles alpha = 0', () => {
    expect(withAlpha('#000000', 0)).toBe('rgba(0, 0, 0, 0)')
  })

  test('handles alpha = 1', () => {
    expect(withAlpha('#ffffff', 1)).toBe('rgba(255, 255, 255, 1)')
  })

  test('handles mixed color', () => {
    expect(withAlpha('#4287f5', 0.75)).toBe('rgba(66, 135, 245, 0.75)')
  })

  test('returns original for invalid hex (no #)', () => {
    expect(withAlpha('ff0000', 0.5)).toBe('ff0000')
  })

  test('returns original for 3-digit hex', () => {
    expect(withAlpha('#fff', 0.5)).toBe('#fff')
  })

  test('returns original for invalid format', () => {
    expect(withAlpha('invalid', 0.5)).toBe('invalid')
  })

  test('handles decimal alpha', () => {
    expect(withAlpha('#123456', 0.123)).toBe('rgba(18, 52, 86, 0.123)')
  })
})

describe('getLuminance', () => {
  test('returns ~0 for black', () => {
    expect(getLuminance('#000000')).toBeCloseTo(0, 5)
  })

  test('returns ~1 for white', () => {
    expect(getLuminance('#ffffff')).toBeCloseTo(1, 5)
  })

  test('returns ~0.21 for red', () => {
    // Red has luminance coefficient of 0.2126
    expect(getLuminance('#ff0000')).toBeCloseTo(0.2126, 2)
  })

  test('returns ~0.72 for green', () => {
    // Green has luminance coefficient of 0.7152
    expect(getLuminance('#00ff00')).toBeCloseTo(0.7152, 2)
  })

  test('returns ~0.07 for blue', () => {
    // Blue has luminance coefficient of 0.0722
    expect(getLuminance('#0000ff')).toBeCloseTo(0.0722, 2)
  })

  test('works with rgb format', () => {
    expect(getLuminance('rgb(255, 255, 255)')).toBeCloseTo(1, 5)
  })

  test('works with rgba format', () => {
    expect(getLuminance('rgba(0, 0, 0, 0.5)')).toBeCloseTo(0, 5)
  })

  test('returns 0.5 for invalid color', () => {
    expect(getLuminance('invalid')).toBe(0.5)
  })

  test('returns 0.5 for empty string', () => {
    expect(getLuminance('')).toBe(0.5)
  })

  test('mid-gray has luminance ~0.22', () => {
    // Perceptual mid-gray is not 0.5 due to gamma
    expect(getLuminance('#808080')).toBeCloseTo(0.22, 1)
  })
})

describe('getReadableTextColor', () => {
  const darkText = { color: 'black' }
  const lightText = { color: 'white' }

  test('returns dark text for white background', () => {
    expect(getReadableTextColor('#ffffff', darkText, lightText)).toBe(darkText)
  })

  test('returns light text for black background', () => {
    expect(getReadableTextColor('#000000', darkText, lightText)).toBe(lightText)
  })

  test('returns dark text for bright yellow', () => {
    expect(getReadableTextColor('#ffff00', darkText, lightText)).toBe(darkText)
  })

  test('returns light text for dark blue', () => {
    expect(getReadableTextColor('#000080', darkText, lightText)).toBe(lightText)
  })

  test('returns dark text for bright background above threshold', () => {
    // Light gray has luminance > 0.45
    expect(getReadableTextColor('#cccccc', darkText, lightText)).toBe(darkText)
  })

  test('returns light text for dark background below threshold', () => {
    // Dark gray has luminance < 0.45
    expect(getReadableTextColor('#333333', darkText, lightText)).toBe(lightText)
  })

  test('works with custom threshold', () => {
    // Mid-gray ~0.22, with threshold 0.2, dark text should be returned
    expect(getReadableTextColor('#808080', darkText, lightText, 0.2)).toBe(darkText)
  })

  test('works with strings', () => {
    expect(getReadableTextColor('#ffffff', 'black', 'white')).toBe('black')
  })

  test('works with rgb format', () => {
    expect(getReadableTextColor('rgb(255, 255, 255)', darkText, lightText)).toBe(darkText)
  })

  test('handles invalid color (uses mid luminance 0.5)', () => {
    // Invalid color returns 0.5 luminance, > 0.45 threshold, so dark text
    expect(getReadableTextColor('invalid', darkText, lightText)).toBe(darkText)
  })
})
