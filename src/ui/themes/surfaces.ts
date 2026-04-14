// Surface tokens drive the base UI colors (body, cards, borders, text)
// They are consumed by the CSS variables resolver and component overrides
// so that components (Card, Paper, Table, AppShell) adapt per scheme.
export const surfaceTokens = {
  dark: {
    // Page background: Softer dark (reduces eye strain vs pure black)
    body: '#1c1c1c',
    // Elevated surfaces: Noticeably lighter for depth
    elevated: '#242424',
    // Elevated surfaces hover: Subtle highlight
    elevatedHover: '#2e2f31',
    // Border: Box-shadow style with subtle glow
    border: 'rgba(255, 255, 255, 0.06)',
    // Primary text: Warm off-white
    text: '#f0efed',
    // Secondary/dimmed text: slightly stronger warm gray for dashboard readability
    mutedText: '#938e86',
  },
  light: {
    // Page background: white-first light mode
    body: '#ffffff',
    // Elevated surfaces: near-white to keep data UIs crisp in light mode
    elevated: '#fffdfd',
    // Elevated surfaces hover: restrained warm lift instead of full rose wash
    elevatedHover: '#fff7f8',
    // Border: subtle graphite border for separation on white surfaces
    border: 'rgba(55, 53, 47, 0.1)',
    // Primary text: warmer graphite
    text: '#37352f',
    // Secondary/dimmed text: stronger muted ink for better contrast
    mutedText: '#6f6b66',
  },
} as const
