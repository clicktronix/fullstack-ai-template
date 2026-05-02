# Fullstack AI Template

Next.js 16 template for AI products and full-stack B2B apps, powered by Supabase and designed for rapid bootstrapping with coding agents.

## First-Time Setup

```bash
bun install
cp .env.example .env.local          # fill in Supabase keys
bun run setup:mcp                   # configure MCP servers
bun run setup:skills                # install Claude plugins + Vercel skills
bun run bootstrap                   # (optional) rename template for a new product
```

Native Claude plugins and marketplaces are declared in `.claude/settings.json` (`extraKnownMarketplaces` + `enabledPlugins`). On first `claude` invocation in the trusted repo, Claude Code prompts to install them automatically — the `setup:skills` script is a fallback for CI and headless setups, and it also installs Vercel `agent-skills` which are separate from native plugins. See [Skills & Plugins](docs/TEMPLATE_GUIDE/SKILLS_AND_PLUGINS.md).

## Commands

| Command                         | Purpose                                       |
| ------------------------------- | --------------------------------------------- |
| `bun run dev`                   | Development server (port 3000)                |
| `bun run build`                 | Production build                              |
| `bun run lint`                  | ESLint                                        |
| `bun run format`                | Prettier + ESLint `--fix`                     |
| `bun run typecheck`             | TypeScript validation                         |
| `bun run check`                 | `lint + typecheck + format:check + i18n:sync` |
| `bun run knip`                  | Detect unused exports/dependencies            |
| `bun test`                      | Unit tests                                    |
| `bun test path/to/file.test.ts` | Run a single test file                        |
| `bun run test:watch`            | Watch mode for unit tests                     |
| `bun run test:coverage`         | Unit tests with coverage report               |
| `bun run test:e2e`              | Playwright e2e                                |
| `bun run storybook`             | Component explorer (port 6006)                |
| `bun run i18n:sync`             | Verify English translation keys               |
| `bun run gen:types`             | Generate Supabase TypeScript types            |
| `bun run bootstrap`             | Rename/rebrand template to a new project      |
| `bun run setup:mcp`             | Configure MCP servers                         |
| `bun run setup:skills`          | Install marketplace plugins + Vercel skills   |
| `bun run skills:doctor`         | Verify skills/plugins state without changes   |
| `bun run mcp:doctor`            | Verify MCP servers state without changes      |

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **UI**: Mantine UI, CSS Modules
- **Validation**: Valibot (domain schemas)
- **State**: TanStack Query (server), React state/reducer (page UI), React Context (global)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **i18n**: React Intl
- **Package Manager**: Bun

## Architecture

Hybrid Clean Architecture with clear layering:

| Layer              | Path                         | Purpose                                                    |
| ------------------ | ---------------------------- | ---------------------------------------------------------- |
| **Domain**         | `src/domain/`                | Valibot schemas, pure business rules                       |
| **Use-Cases**      | `src/use-cases/`             | Application scenarios, ports, feature-local types          |
| **Server-State**   | `src/ui/server-state/`       | TanStack Query hooks, keys, cache orchestration            |
| **UI Actions**     | feature-local `actions.ts`   | Thin direct Server Action wrappers without query semantics |
| **Inbound**        | `src/adapters/inbound/next/` | Server Actions, route handlers, request mapping            |
| **Outbound**       | `src/adapters/outbound/`     | Supabase, external APIs, transport                         |
| **UI**             | `src/app/`, `src/ui/`        | Pages, layouts, components, presentation hooks             |
| **Infrastructure** | `src/infrastructure/`        | Auth, i18n, logging, config                                |

**Dependency Flow**:
`app/ui → ui/server-state | actions.ts → inbound adapters → use-cases → outbound adapters → domain`

## Project Structure

```
src/
├── app/                   # Next.js App Router
│   ├── (protected)/       # Authenticated pages
│   └── (public)/          # Public pages (home, login, signup)
├── domain/                # Business entities (Valibot schemas)
├── adapters/
│   ├── inbound/next/      # Server Actions, route handlers
│   └── outbound/          # Supabase, external APIs
├── use-cases/             # Application scenarios
├── infrastructure/        # Cross-cutting concerns (auth, i18n, logging)
│   └── i18n/              # Translations (en.ts, types)
└── ui/
    ├── server-state/      # TanStack Query hooks
    ├── components/        # Reusable components
    ├── hooks/             # Shared presentation hooks
    └── providers/         # React contexts
```

## Key Patterns

**Domain Validation**: Valibot schemas for runtime validation + inferred TypeScript types.

**Component Pattern**: Smart/Dumb separation via `composeHooks(View)(useProps)`.

**State Management**: UI state (`useState` / `useReducer`), Server state (TanStack Query), Global (Context).

**Server Actions**: inbound mutations use `next-safe-action` clients from `src/infrastructure/actions/safe-action.ts`. Keep exported action functions as stable app-level APIs, but put validation, auth context, and role checks in the safe-action layer.

**Cache Invalidation**: use centralized tags from `src/infrastructure/cache/tags.ts` with `updateTag()` for read-your-writes after Server Actions and `revalidateTag(tag, profile)` for broader invalidation. Avoid ad-hoc `revalidatePath()` unless the route tree itself is the unit of invalidation.

**Proxy/CSP**: the active Next.js Proxy file is `src/proxy.ts` because the app router is under `src/app`. Keep CSP changes compatible with Cache Components/PPR; request-time nonces require fully dynamic rendering.

**Authorization Boundary**: `src/proxy.ts` is not the authorization boundary. It may refresh sessions, redirect, set request headers, and apply CSP/security headers. Data access must verify auth/authz again inside server-only DAL, inbound adapters, or use-case paths. Modules that read cookies, headers, DB clients, service role keys, or secrets must use `import 'server-only'` and must not be imported by Client Components.

**Environment**: read env through `src/infrastructure/env/public.ts`, `client.ts`, `server.ts`, or `runtime.ts`. Do not read `process.env` directly in runtime code; tests and env helpers are the only exceptions.

**i18n**: `messages.json` + `<TranslationText {...messages.key} />`. `src/proxy.ts` seeds the locale cookie from `Accept-Language`; `LocaleProvider` then prefers localStorage, cookie, and finally `en`.

**Forms**: Mantine Forms + `createMantineValidator(schema)`. The helper accepts Standard Schema v1 compatible schemas; Valibot v1 schemas implement that contract.

**Feature co-location**: page-local UI, hooks, and logic live in `_internal/` inside the App Router segment (e.g. `src/app/(public)/signup/_internal/ui/SignupForm/`). Nothing under `_internal/` is imported from outside its owning segment.

## Critical Constraints

- ❌ Do not rely on hooks or editor integrations for quality gates — run `bun run lint`, `bun run typecheck`, `bun test`, `bun run build`, and `bun run knip` explicitly when the change warrants it
- ❌ No `interface` — use `type`
- ❌ No classes — functional only
- ❌ No inline `style={{}}` — use Mantine props or CSS Modules
- ❌ No `import * as v from 'valibot'` — import functions directly
- ❌ No `any` types
- ❌ No barrel exports (`index.ts` for re-exporting) — import directly from files
- ❌ No direct `process.env` in runtime code — use `src/infrastructure/env/*`
- ❌ No hardcoded hex colors — use Mantine CSS vars or `ui/themes/palette-*.ts`
- ✅ Import domain types from `@/domain/entity`
- ✅ Use `composeHooks` for Smart/Dumb separation
- ✅ Use `TranslationText` for i18n, never hardcoded strings
- ✅ Dark theme is default (`defaultColorScheme="dark"`)
- ✅ Many types in component? Create `interfaces.ts` file

## Adding Features

Follow layer order: **Domain → Use-Case ports/types → Outbound Adapter → Inbound Adapter (safe Server Action / route handler) → Server-State or feature-local action → UI**

```typescript
// 1. Domain (src/domain/work-item/index.ts)
export const WorkItemSchema = object({ id: string(), title: string(), status: string() })
export type WorkItem = InferOutput<typeof WorkItemSchema>

// 2. Use-case port + scenario (src/use-cases/work-items/work-items.ts)
export type WorkItemsRepository = {
  list(filters: WorkItemFilters): Promise<WorkItem[]>
}

export async function listWorkItems(
  deps: { workItems: WorkItemsRepository },
  filters: WorkItemFilters
) {
  return deps.workItems.list(filters)
}

// 3. Outbound adapter (src/adapters/outbound/supabase/work-items.repository.ts)
export function createSupabaseWorkItemsRepository(supabase: SupabaseServerClient) {
  return {
    list: (filters) => listWorkItemsOperation(supabase, filters),
  } satisfies WorkItemsRepository
}

// 4. Inbound adapter / safe Server Action (src/adapters/inbound/next/server-actions/work-items.ts)
'use server'
const safeListWorkItemsAction = adminActionClient
  .inputSchema(WorkItemFiltersSchema)
  .action(async ({ ctx, parsedInput }) =>
    listWorkItems(
      { workItems: createSupabaseWorkItemsRepository(ctx.supabase) },
      parsedInput
    )
  )

// 5. Server-State (src/ui/server-state/work-items/queries.ts)
export function useWorkItems(filters: WorkItemFilters) {
  return useQuery({
    queryKey: workItemKeys.list(filters),
    queryFn: () => listWorkItemsAction(filters),
  })
}

// 6. UI Component
export function WorkItemListView({ data, isLoading }: ViewProps) { ... }
export const WorkItemList = composeHooks<ViewProps, Props>(WorkItemListView)(useProps)
```

## Naming Conventions

| Type         | Convention            | Example                                              |
| ------------ | --------------------- | ---------------------------------------------------- |
| Domain files | kebab-case            | `work-item.ts`, `assistant-suggestion.ts`            |
| Components   | PascalCase folders    | `WorkItemList/`, `LabelBadge/`                       |
| Hooks        | camelCase             | `useWorkItems()`, `useLabels()`                      |
| Types        | Inferred from schemas | `type WorkItem = InferOutput<typeof WorkItemSchema>` |

## Demo Slice

The template ships with one neutral vertical slice around:

- `work-items`
- `labels`
- optional `assistant-suggestions`

Use it as the reference example for new product features. Replace or extend with your own domain.

## Modular Documentation

Rules files loaded conditionally by file path:

| Document                         | Paths                                                  | Purpose                                       |
| -------------------------------- | ------------------------------------------------------ | --------------------------------------------- |
| `@.claude/rules/core.md`         | `frontend/**/*`                                        | Critical constraints, naming, common pitfalls |
| `@.claude/rules/architecture.md` | `src/domain/**`, `src/adapters/**`, `src/use-cases/**` | Clean Architecture layers                     |
| `@.claude/rules/components.md`   | `src/ui/**`, `src/app/**`                              | composeHooks, i18n, Server/Client components  |
| `@.claude/rules/styling.md`      | `**/*.module.css`, `**/*Form*/**`                      | CSS Modules, Form validation                  |
| `@.claude/rules/data-state.md`   | `src/use-cases/**`, `src/ui/widgets/store/**`          | State management decision tree                |
| `@.claude/rules/quality.md`      | `**/*.test.{ts,tsx}`                                   | Testing, Performance                          |

Detailed documentation:

| Document                                     | Purpose                                                                           |
| -------------------------------------------- | --------------------------------------------------------------------------------- |
| `nextjs-clean-skills@nextjs-clean-skills`    | Next.js 16 Hybrid Clean Architecture + Server/Client component skills marketplace |
| `@docs/ARCHITECTURE/QUICK_REFERENCE.md`      | One-page cheatsheet                                                               |
| `@docs/ARCHITECTURE/ARCHITECTURE.md`         | Complete architecture guide                                                       |
| `@docs/ARCHITECTURE/COMPONENT_PATTERNS.md`   | composeHooks + Custom Hooks Library                                               |
| `@docs/ARCHITECTURE/DATA_ACCESS.md`          | API adapters, Supabase                                                            |
| `@docs/ARCHITECTURE/FOLDER_STRUCTURE.md`     | Project structure                                                                 |
| `@docs/TEMPLATE_GUIDE/GETTING_STARTED.md`    | First-time setup                                                                  |
| `@docs/TEMPLATE_GUIDE/CUSTOMIZE_TEMPLATE.md` | Adapting the template to a new product                                            |
| `@docs/TEMPLATE_GUIDE/SKILLS_AND_PLUGINS.md` | Skill/plugin install & authoring                                                  |
| `@docs/TESTING/TESTING_STRATEGY.md`          | Testing pyramid, patterns by layer, mocking rules                                 |

## Environment Variables

Copy `.env.example` → `.env.local` and fill in values.

Required in `.env.local`:

| Variable                        | Description               |
| ------------------------------- | ------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key    |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key |

Env values are validated in `src/infrastructure/env/*`. Optional browser-safe values live in `public.ts`, required browser client values in `client.ts`, server-only values in `server.ts`, and runtime flags in `runtime.ts`. Never create `NEXT_PUBLIC_*` variants for service role keys or backend API keys.

Optional integrations add their own env variables (Sentry, external AI gateway) — see `docs/TEMPLATE_GUIDE/OPTIONAL_*`.

## Quick Links

- [Getting Started](docs/TEMPLATE_GUIDE/GETTING_STARTED.md) — first-time setup
- [Customize Template](docs/TEMPLATE_GUIDE/CUSTOMIZE_TEMPLATE.md) — adapt to a new product
- [Architecture](docs/ARCHITECTURE/ARCHITECTURE.md) — complete architecture guide
- [Quick Reference](docs/ARCHITECTURE/QUICK_REFERENCE.md) — one-page cheatsheet
