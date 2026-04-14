# Quick Reference

## Dependency Flow

```text
app/ui -> ui/server-state | feature-local actions.ts -> inbound adapters -> use-cases -> outbound adapters -> domain
```

## Layer Map

| Layer          | Path                         | Purpose                                           |
| -------------- | ---------------------------- | ------------------------------------------------- |
| Domain         | `src/domain/`                | Schemas, invariants, pure helpers                 |
| Use-Cases      | `src/use-cases/`             | Application scenarios, ports, feature-local types |
| Server-State   | `src/ui/server-state/`       | TanStack Query hooks, keys, SSR prefetch          |
| Inbound        | `src/adapters/inbound/next/` | Server Actions, route handlers                    |
| Outbound       | `src/adapters/outbound/`     | Supabase, external APIs, transport                |
| UI             | `src/app/`, `src/ui/`        | Next entrypoints and presentation                 |
| Infrastructure | `src/infrastructure/`        | Auth, i18n, config, logging                       |

## Demo Slice

The template ships with one reference vertical slice:

- `work-items`
- `labels`

This slice demonstrates:

- domain schemas
- use-case ports
- Supabase outbound adapters
- Server Actions
- React Query integration
- SSR prefetch
- UI composition with `composeHooks`

## Rules

- `src/use-cases/**` must not import `app`, `ui`, or inbound adapters
- `src/ui/server-state/**` is the only UI-facing layer allowed to call inbound adapters
- feature-local `actions.ts` are allowed only for thin direct Server Action wrappers
- UI must not import outbound adapters directly
- `app/` entrypoints stay thin
