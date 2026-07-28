---
paths: ['src/app/**/*.tsx', 'src/modules/**/{client,ui}/**/*', 'src/shared/ui/**/*']
---

# React Composition

## Ownership

- Route-private presentation: `app/<route>/_internal`.
- Reusable capability presentation: `modules/<capability>/ui` through `ui.ts`.
- Cross-capability primitives: admitted `shared/ui`.
- Browser async lifecycle: capability `client/` through `client.ts`.

## Hooks

Call named hooks directly in the component that owns them:

```tsx
export function WorkItemsPanel(props: WorkItemsPanelProps) {
  const viewProps = useWorkItemsPanelProps(props)
  return <WorkItemsPanelView {...viewProps} />
}
```

Do not pass hooks as values, hide them behind a generic composer, or add `memo` without measured
need. A separate View is optional; use it only when it improves testing or readability.

## Server and Client

- Keep components server-rendered unless browser interactivity requires `'use client'`.
- Server Components call `rsc.ts` or `server.ts` directly.
- Client query hooks call GET/stream contracts through `client.ts`.
- Client components may import exact command actions, never `server.ts` or `server/**`.
- Keep `server-only` and `client-only` markers on runtime-specific modules.

## UI Rules

- Prefer Mantine components/props and CSS Modules.
- Use `TranslationText` or `TranslationTitle` with local `messages.json`.
- Put form validation in a named Valibot schema and bridge it with
  `createMantineValidator`.
- Use stable `data-testid` values only for critical E2E interactions.
- Keep loading, empty, error, disabled, and success states explicit.
