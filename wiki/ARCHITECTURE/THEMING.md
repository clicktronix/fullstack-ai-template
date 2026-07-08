# Theme System Architecture

> Modern, scalable theming system built on Mantine 7+ with CSS variables and dual color scheme support.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [File Structure](#file-structure)
- [CSS Variables Strategy](#css-variables-strategy)
- [Color System](#color-system)
- [Usage Guide](#usage-guide)
- [Design Decisions](#design-decisions)

## Overview

### Key Features

- 🎨 **Dual Color Schemes** — Separate light and dark palettes
- 🔧 **CSS Variables** — Modern CSS custom properties approach
- 📦 **Modular Structure** — Clean separation of concerns
- 🎯 **Action Intent Tokens** — Semantic color tokens for UI actions
- ⚡ **Performance** — No runtime calculations, pure CSS
- 🔒 **Type-Safe** — Full TypeScript support with `as const`

### Design Philosophy

| Principle                    | Implementation                              | Benefit                               |
| ---------------------------- | ------------------------------------------- | ------------------------------------- |
| **Separation of Concerns**   | Split palettes, surfaces, intents, resolver | Easy maintenance and testing          |
| **CSS Variables**            | All colors as CSS custom properties         | No JavaScript calculations at runtime |
| **Semantic Tokens**          | Action intents (edit, delete, confirm)      | Consistent UI patterns                |
| **Mantine 7+ Compatibility** | Modern CSS-in-JS syntax                     | Future-proof implementation           |

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Theme System                            │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Palettes    │  │  Surfaces    │  │  Intents     │      │
│  │              │  │              │  │              │      │
│  │ • Dark       │  │ • Body       │  │ • Edit       │      │
│  │ • Light      │  │ • Elevated   │  │ • Delete     │      │
│  │              │  │ • Border     │  │ • Confirm    │      │
│  │ 8 colors ×   │  │ • Text       │  │ • Cancel     │      │
│  │ 10 shades    │  │ • Dimmed     │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │   Resolver     │                        │
│                    │                │                        │
│                    │ Builds CSS     │                        │
│                    │ variables for  │                        │
│                    │ light & dark   │                        │
│                    └───────┬────────┘                        │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Mantine       │
                    │   Provider      │
                    │                 │
                    │ • cssVariables  │
                    │   Resolver      │
                    │ • createTheme   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   Components    │
                    │                 │
                    │ Use CSS vars:   │
                    │ var(--mantine-  │
                    │  color-*)       │
                    └─────────────────┘
```

### Data Flow

```
Color Definitions (palette-*.ts)
    ↓
Surface Tokens (surfaces.ts)
    ↓
Action Intent Tokens (intents.ts)
    ↓
Build Scheme Variables (resolver.ts)
    ├─→ light: {...}
    └─→ dark: {...}
    ↓
CSS Variables Resolver
    ↓
Mantine Theme (index.ts)
    ↓
Component Styles
```

## File Structure

```
src/ui/themes/
├── index.ts              # Main export + theme definition
├── resolver.ts           # CSS variables resolver
├── palette-dark.ts       # Dark mode color scales
├── palette-light.ts      # Light mode color scales
├── surfaces.ts           # Surface tokens (body, elevated, border)
└── intents.ts            # Action intent tokens (edit, delete, etc.)
```

### Responsibilities

| File                 | Purpose                 | Exports                                                     |
| -------------------- | ----------------------- | ----------------------------------------------------------- |
| **index.ts**         | Theme entry point       | `theme`, `cssVariablesResolver`, types                      |
| **resolver.ts**      | CSS variable generation | `cssVariablesResolver`, `schemePalettes`, `ColorSchemeName` |
| **palette-dark.ts**  | Dark color scales       | `darkColorScales` (8 colors × 10 shades)                    |
| **palette-light.ts** | Light color scales      | `lightColorScales` (8 colors × 10 shades)                   |
| **surfaces.ts**      | Surface semantics       | `surfaceTokens` (body, elevated, border, text)              |
| **intents.ts**       | Action semantics        | `actionIntentTokens` (edit, delete, confirm, cancel)        |

## CSS Variables Strategy

### Why CSS Variables?

| Approach                       | Runtime Cost | Theme Switch     | Browser Support | Type Safety |
| ------------------------------ | ------------ | ---------------- | --------------- | ----------- |
| **Inline styles**              | High         | Slow (re-render) | ✅              | ⚠️ Partial  |
| **CSS-in-JS (runtime)**        | High         | Slow             | ✅              | ✅          |
| **CSS Modules**                | Low          | Manual           | ✅              | ❌          |
| **CSS Variables (our choice)** | Low          | Instant          | ✅ Modern       | ✅          |

### Variable Structure

```typescript
// All variables follow consistent naming:
--mantine - color - { name } - { shade } // Color scales (0-9)
--mantine - color - { semantic } // Semantic colors
--mantine - primary - color - { variant } // Primary color variants
--mantine - action - { intent } - { property } // Action intent tokens
```

### Generated Variables

#### Color Scales (80 total)

```css
/* 8 colors × 10 shades = 80 variables */
--mantine-color-dark-0 through --mantine-color-dark-9
--mantine-color-gray-0 through --mantine-color-gray-9
--mantine-color-blue-0 through --mantine-color-blue-9
--mantine-color-orange-0 through --mantine-color-orange-9
--mantine-color-green-0 through --mantine-color-green-9
--mantine-color-red-0 through --mantine-color-red-9
--mantine-color-teal-0 through --mantine-color-teal-9
--mantine-color-violet-0 through --mantine-color-violet-9
--mantine-color-yellow-0 through --mantine-color-yellow-9
```

#### Surface Tokens (7 variables)

```css
--mantine-color-body             /* Page background */
--mantine-color-text             /* Primary text */
--mantine-color-dimmed           /* Secondary text */
--mantine-color-default          /* Default surface (cards) */
--mantine-color-default-hover    /* Hover state */
--mantine-color-default-color    /* Text on default surface */
--mantine-color-default-border   /* Border color */
```

#### Primary Color Variants (16 variables)

```css
/* Shades */
--mantine-color-primary-0 through --mantine-color-primary-9

/* Semantic variants (Mantine 7+ standard) */
--mantine-primary-color-filled        /* Filled variant background */
--mantine-primary-color-filled-hover  /* Filled variant hover */
--mantine-primary-color-light         /* Light variant background */
--mantine-primary-color-light-hover   /* Light variant hover */
--mantine-primary-color-light-color   /* Light variant text */
--mantine-primary-color-contrast      /* Contrast text color */
```

#### Action Intent Tokens (16 variables)

```css
/* Edit intent */
--mantine-action-edit-fg          /* Foreground color */
--mantine-action-edit-bg          /* Background color */
--mantine-action-edit-hover-bg    /* Hover background */
--mantine-action-edit-border      /* Border color */

/* Delete intent (same pattern) */
--mantine-action-delete-*

/* Confirm intent (same pattern) */
--mantine-action-confirm-*

/* Cancel intent (same pattern) */
--mantine-action-cancel-*
```

### Automatic Color Scheme Switching

```css
/* Light mode */
[data-mantine-color-scheme='light'] {
  --mantine-color-body: #f6f8fb;
  --mantine-color-text: #1c1e25;
  /* ... */
}

/* Dark mode */
[data-mantine-color-scheme='dark'] {
  --mantine-color-body: #0a0b0c;
  --mantine-color-text: #f3f4f6;
  /* ... */
}
```

**How it works:**

1. User toggles color scheme
2. Mantine updates `data-mantine-color-scheme` attribute
3. CSS variables automatically switch
4. No component re-renders needed!

## Color System

### Color Palette Structure

Each color has **10 shades** (indexed 0-9):

```
Shade 0: Lightest (backgrounds, tints)
Shade 1-2: Light variants
Shade 3-4: Medium variants
Shade 5-6: Default/Primary shades ← Most used
Shade 7-8: Dark variants
Shade 9: Darkest (text, emphasis)
```

### Primary Color Mapping

```typescript
primaryColor: 'orange'
primaryShade: {
  light: 6,  // orange[6] in light mode
  dark: 5    // orange[5] in dark mode
}
```

**Why different shades?**

- Light mode needs darker primaries for contrast on white
- Dark mode needs lighter primaries for contrast on black

### Color Usage Matrix

| Color      | Purpose             | Example Usage               |
| ---------- | ------------------- | --------------------------- |
| **dark**   | Neutrals, UI chrome | Backgrounds, subtle borders |
| **gray**   | Utility neutrals    | Dividers, disabled states   |
| **blue**   | Informational       | Links, info messages        |
| **orange** | Primary actions     | CTA buttons, active states  |
| **green**  | Success, positive   | Profit, success messages    |
| **red**    | Errors, negative    | Loss, error messages        |
| **teal**   | Data visualization  | Charts, graphs              |
| **violet** | Data visualization  | Secondary chart colors      |
| **yellow** | Warnings            | Alert messages              |

### Surface Token Strategy

```typescript
surfaceTokens = {
  dark: {
    body: '#0A0B0C', // Very dark page background
    elevated: '#15171E', // Slightly lighter cards
    border: '#1E2128', // Subtle borders
    text: '#F3F4F6', // High contrast text
    mutedText: '#8B8E94', // Lower contrast text
  },
  light: {
    body: '#F6F8FB', // Light gray background
    elevated: '#FFFFFF', // White cards
    border: '#D5DAE5', // Visible borders
    text: '#1C1E25', // Dark text
    mutedText: '#4A5164', // Gray text
  },
}
```

**Design rationale:**

- `body` vs `elevated`: Creates depth through elevation
- `border` vs `elevated`: Ensures borders are always visible
- `text` vs `mutedText`: Hierarchy through contrast

### Action Intent Tokens

```typescript
actionIntentTokens = {
  edit: {
    dark: {
      fg: '#7DA9FF', // Blue-ish
      bg: 'rgba(82, 139, 255, 0.16)', // Semi-transparent
      hoverBg: 'rgba(82, 139, 255, 0.24)',
      border: 'rgba(82, 139, 255, 0.35)',
    },
    light: {
      /* darker versions */
    },
  },
  delete: {
    /* red */
  },
  confirm: {
    /* green */
  },
  cancel: {
    /* gray */
  },
}
```

**Why semi-transparent backgrounds?**

- Works on any surface color
- Creates layering effect
- Doesn't overwhelm the UI
- Subtle but clear affordance

## Usage Guide

### In Components (CSS-in-JS)

```typescript
// Using color scales
<Box
  style={{
    color: 'var(--mantine-color-blue-6)',
    backgroundColor: 'var(--mantine-color-gray-0)',
  }}
/>

// Using surface tokens
<Paper
  style={{
    backgroundColor: 'var(--mantine-color-default)',
    borderColor: 'var(--mantine-color-default-border)',
  }}
/>

// Using primary color variants
<Button
  style={{
    backgroundColor: 'var(--mantine-primary-color-filled)',
    color: 'var(--mantine-primary-color-contrast)',
  }}
/>

// Using action intent tokens
<ActionIcon
  style={{
    color: 'var(--mantine-action-edit-fg)',
    backgroundColor: 'var(--mantine-action-edit-bg)',
    borderColor: 'var(--mantine-action-edit-border)',
    ':hover': {
      backgroundColor: 'var(--mantine-action-edit-hover-bg)',
    },
  }}
/>
```

### In Mantine Props

```typescript
// Mantine components accept color names
<Button color="orange">Primary Action</Button>
<Badge color="green">Success</Badge>
<Text c="dimmed">Secondary text</Text>

// Or specific shades
<Box bg="dark.7">Dark background</Box>
<Text c="blue.6">Blue text</Text>
```

### In CSS Modules

```css
.myComponent {
  background-color: var(--mantine-color-default);
  color: var(--mantine-color-text);
  border: 1px solid var(--mantine-color-default-border);
}

.myComponent:hover {
  background-color: var(--mantine-color-default-hover);
}

.editButton {
  color: var(--mantine-action-edit-fg);
  background-color: var(--mantine-action-edit-bg);
}
```

### Custom Theme Extensions

```typescript
// Extending the theme
import { theme as baseTheme } from '@/ui/themes'

const customTheme = createTheme({
  ...baseTheme,
  other: {
    ...baseTheme.other,
    myCustomValue: '#FF00FF',
  },
})

// Then in cssVariablesResolver:
const customResolver: CSSVariablesResolver = (theme) => ({
  variables: {
    '--my-custom-color': theme.other.myCustomValue,
  },
  light: buildSchemeVariables('light'),
  dark: buildSchemeVariables('dark'),
})
```

## Design Decisions

### ADR-001: Why Separate Light & Dark Palettes?

**Context:**
Need to support both light and dark modes with optimal contrast.

**Options Considered:**

1. **Single palette + invert:** Use one palette, invert for dark mode
2. **CSS filters:** Use CSS filters to adjust colors
3. **Separate palettes (chosen):** Different palettes for each mode

**Decision:** Separate palettes

**Rationale:**

- ✅ **Better control:** Each shade optimized for its mode
- ✅ **Design flexibility:** Not constrained by mathematical transformations
- ✅ **Accessibility:** Can fine-tune contrast ratios
- ✅ **Predictability:** No surprising color inversions
- ❌ **More maintenance:** Need to manage two palettes
- ❌ **Larger bundle:** ~2KB extra (acceptable trade-off)

### ADR-002: Why CSS Variables Over Runtime Styles?

**Context:**
Need performant theme switching and dynamic styling.

**Options Considered:**

1. **Inline styles:** Calculate colors in JavaScript
2. **Styled-components:** Runtime CSS-in-JS
3. **CSS Variables (chosen):** CSS custom properties

**Decision:** CSS Variables

**Rationale:**

- ✅ **Performance:** No JS calculations at runtime
- ✅ **Instant switching:** Theme changes via CSS only
- ✅ **SSR-friendly:** Works with Server Components
- ✅ **Standard:** Built-in browser feature
- ✅ **Debuggable:** Visible in DevTools
- ⚠️ **IE11:** Doesn't work (acceptable, IE11 EOL)

### ADR-003: Why Action Intent Tokens?

**Context:**
Need consistent colors for semantic UI actions (edit, delete, etc.)

**Options Considered:**

1. **Hardcode colors:** Use Mantine colors directly
2. **Variants:** Use Mantine's variant system
3. **Intent tokens (chosen):** Custom semantic tokens

**Decision:** Action Intent Tokens

**Rationale:**

- ✅ **Semantic:** Conveys intent, not just color
- ✅ **Consistency:** Same colors across all actions
- ✅ **Flexible:** Can adjust per scheme
- ✅ **Scalable:** Easy to add new intents
- ✅ **Type-safe:** TypeScript enforces valid intents
- ❌ **Extra abstraction:** More concepts to learn

### ADR-004: Why Modular File Structure?

**Context:**
Theme system growing complex with multiple concerns.

**Options Considered:**

1. **Single file:** All theme code in one file
2. **By feature:** Split by light/dark
3. **By concern (chosen):** Split by palettes/surfaces/intents

**Decision:** Split by concern

**Rationale:**

- ✅ **Maintainability:** Each file has single responsibility
- ✅ **Testability:** Can test parts in isolation
- ✅ **Collaboration:** Multiple developers can work simultaneously
- ✅ **Tree-shaking:** Unused parts can be eliminated
- ✅ **Discoverability:** Clear file names indicate purpose
- ❌ **More files:** 6 files vs 1 (worth it for organization)

### ADR-005: Why Primary Color Semantic Variables?

**Context:**
Mantine 7+ expects specific CSS variables for primary color variants.

**Decision:** Generate all primary color semantic variables

**Rationale:**

- ✅ **Mantine 7+ compatibility:** Follows official conventions
- ✅ **Component support:** Works with all Mantine components
- ✅ **Variant support:** Enables filled, light, outline variants
- ✅ **Consistency:** Matches Mantine's internal expectations
- ✅ **Documentation:** Aligns with official Mantine docs

Variables generated:

```typescript
--mantine - primary - color - filled
--mantine - primary - color - filled - hover
--mantine - primary - color - light
--mantine - primary - color - light - hover
--mantine - primary - color - light - color
--mantine - primary - color - contrast
```

### Comparison Table: Our Approach vs Alternatives

| Feature             | Our Approach | Emotion/Styled | Tailwind     | Plain CSS    |
| ------------------- | ------------ | -------------- | ------------ | ------------ |
| **Type Safety**     | ✅ Full      | ✅ Full        | ⚠️ Partial   | ❌ None      |
| **Performance**     | ✅ Excellent | ⚠️ Good        | ✅ Excellent | ✅ Excellent |
| **Theme Switch**    | ✅ Instant   | ⚠️ Re-render   | ✅ Instant   | ✅ Instant   |
| **SSR Support**     | ✅ Native    | ⚠️ Complex     | ✅ Native    | ✅ Native    |
| **Maintainability** | ✅ Modular   | ⚠️ Scattered   | ✅ Config    | ⚠️ Verbose   |
| **Bundle Size**     | ✅ Small     | ❌ Large       | ✅ Small     | ✅ Smallest  |
| **Learning Curve**  | ⚠️ Medium    | ⚠️ Medium      | ⚠️ Medium    | ✅ Low       |
| **Flexibility**     | ✅ High      | ✅ High        | ⚠️ Medium    | ✅ High      |

---

**Last Updated:** 2025-11-10
**Version:** 1.0.0
**Authors:** Stokli Team
