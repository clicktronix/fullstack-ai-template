# Fullstack AI Template

Next.js 16 template for AI products and full-stack B2B apps.

## Commands

| Command             | Purpose               |
| ------------------- | --------------------- |
| `bun run dev`       | Development server    |
| `bun run build`     | Production build      |
| `bun run lint`      | ESLint                |
| `bun run typecheck` | TypeScript validation |
| `bun run check`     | Lint + types + format |
| `bun test`          | Unit tests            |
| `bun run test:e2e`  | Playwright e2e        |

## Stack

- Next.js 16
- React 19
- TypeScript
- Bun
- Mantine + CSS Modules
- Valibot
- TanStack Query
- Supabase SSR/Auth

Optional integrations prepared in the template:

- Storybook
- Sentry
- OpenTelemetry via `@vercel/otel`

## Architecture

Hybrid Clean Architecture for a full-stack Next.js app:

| Layer             | Path                         | Purpose                                                    |
| ----------------- | ---------------------------- | ---------------------------------------------------------- |
| Domain            | `src/domain/`                | Pure schemas, business rules, invariants                   |
| Use-Cases         | `src/use-cases/`             | Application scenarios, ports, feature-local types          |
| Server-State      | `src/ui/server-state/`       | TanStack Query hooks, keys, cache orchestration            |
| UI Actions        | feature-local `actions.ts`   | Thin direct Server Action wrappers without query semantics |
| Inbound Adapters  | `src/adapters/inbound/next/` | Server Actions, route handlers, request mapping            |
| Outbound Adapters | `src/adapters/outbound/`     | Supabase, external APIs, transport                         |
| UI                | `src/app/`, `src/ui/`        | Pages, layouts, components, presentation hooks             |
| Infrastructure    | `src/infrastructure/`        | Auth, i18n, logging, config, common support                |

**Dependency Flow**:
`app/ui -> ui/server-state | feature-local actions.ts -> inbound adapters -> use-cases -> outbound adapters -> domain`

## Core Rules

- `domain` depends on nothing except domain
- `use-cases` must not import `app`, `ui`, or inbound adapters
- `ui/server-state` is the only UI layer allowed to depend on inbound adapters
- presentation UI must not import outbound adapters directly
- `app/` files stay thin and delegate
- if UI needs a one-off Server Action call without TanStack Query, create local `actions.ts`

## Project Structure

```text
src/
├── app/
├── domain/
├── use-cases/
├── adapters/
│   ├── inbound/next/
│   └── outbound/
├── infrastructure/
└── ui/
    ├── server-state/
    ├── components/
    ├── hooks/
    └── providers/
```

## Key Patterns

**Domain Validation**: Valibot schemas + inferred TypeScript types.

**Server State**: TanStack Query lives in `src/ui/server-state/<feature>/`.

**Server Actions**: inbound mutations use `next-safe-action` clients from `src/infrastructure/actions/safe-action.ts`; keep auth, role checks, and input schemas there.

**Cache**: use `src/infrastructure/cache/tags.ts`, `updateTag()` for same-request read-your-writes, and `revalidateTag(tag, profile)` for broader invalidation.

**Proxy/CSP**: the active Next.js Proxy file is `src/proxy.ts` because the app router is under `src/app`. Do not move it to the repository root unless the app router is moved too.

**Authorization Boundary**: `src/proxy.ts` is not the authorization boundary. It may refresh sessions, redirect, set request headers, and apply CSP/security headers. Data access must verify auth/authz again inside server-only DAL, inbound adapters, or use-case paths. Modules that read cookies, headers, DB clients, service role keys, or secrets must use `import 'server-only'` and must not be imported by Client Components.

**Env**: read env variables only through `src/infrastructure/env/*`. Runtime code must not read `process.env` directly; ESLint enforces this outside env helpers and tests.

**Component Pattern**: `composeHooks(View)(useProps)` for Smart/Dumb separation.

**Direct Server Actions**: Use feature-local `actions.ts`, not direct adapter imports from component hooks.

**Forms**: Mantine Forms + `createMantineValidator(...)`.

**i18n**: Locale files in `src/infrastructure/i18n/` + `TranslationText`. `src/proxy.ts` seeds the locale cookie from `Accept-Language`; `LocaleProvider` then prefers localStorage, cookie, and finally `en`.

## Critical Constraints

- ❌ No `interface` — use `type`
- ❌ No classes — functional only
- ❌ No `any`
- ❌ No `import * as v from 'valibot'`
- ❌ No inline `style={{}}`
- ❌ No barrel exports
- ❌ No direct `process.env` outside `src/infrastructure/env/*`
- ✅ Run `bun run lint`, `bun run typecheck`, `bun test`, `bun run test:e2e` explicitly when needed
- ✅ Keep architecture boundaries enforced by ESLint
- ✅ Use `data-testid` for critical interactive UI used in e2e

## Adding Features

Follow order:
**Domain -> Use-Cases/Ports -> Outbound Adapters -> Inbound Adapters -> Server-State or feature-local action -> UI**

If the feature needs server data in UI:

1. create domain schemas
2. add use-cases and ports
3. implement outbound adapter
4. add safe Server Action / route handler
5. add `ui/server-state/<feature>/queries.ts` or `mutations.ts`
6. consume from UI

## Demo Slice

The template includes one neutral vertical slice built around:

- `work-items`
- `labels`
- optional `assistant-suggestions`

Use it as the reference example for new product features.

## Documentation

Source of truth:

- `AGENTS.md`
- `docs/ARCHITECTURE/*`
- `docs/TEMPLATE_GUIDE/*`

Start here:

- `docs/ARCHITECTURE/QUICK_REFERENCE.md`
- `docs/TEMPLATE_GUIDE/GETTING_STARTED.md`
- `.agents/skills/project-onboarding/SKILL.md`

## Environment

The template uses placeholder env variables for:

- Supabase URL / anon key / service role key
- optional Sentry config
- optional external AI gateway config

Customize them before first real project use.
