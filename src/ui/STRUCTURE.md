# UI Layer Structure

```
src/ui/
├── components/       # Reusable UI components (composeHooks pattern)
├── server-state/     # React Query hooks (queries, mutations, keys)
├── hooks/            # Custom React hooks (shared across components)
│   ├── server-action-form/
│   ├── compose-hooks.tsx  # Core Smart/Dumb pattern utility
│   └── use-*.ts           # Simple hooks stay flat
├── themes/           # Mantine theme, palettes, color mappings
├── layout/           # App shell, page layouts (AuthLayout, ChatDashboard, Sidebar)
└── providers/        # React Context providers (Auth, Locale, QueryClient)
```

## Conventions

- **Components**: Each in PascalCase folder with `index.tsx`, `lib.ts`, `messages.json`, `styles.module.css`
- **Hooks with translations**: Own folder with `messages.json` (like components)
- **Hooks without translations**: Flat files `use-*.ts`
- **Color mappings**: In `themes/` (status-colors, semantic palettes)
- **Layouts**: In `layout/` (AppShell, AuthLayout, etc.)
- **Server state**: In `server-state/{feature}/` (queries.ts, mutations.ts, keys.ts)
- **Direct Server Actions**: In feature-local `actions.ts` next to the component or hook

## What does NOT belong here

- Business logic → `use-cases/`
- Domain types → `domain/`
- Server Actions → `adapters/inbound/`
- Supabase operations → `adapters/outbound/`
