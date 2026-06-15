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
- **Auth**: Supabase Auth (SSR)
- **i18n**: React Intl
- **Package Manager**: Bun

Optional integrations prepared in the template:

- Storybook
- Sentry
- OpenTelemetry via `@vercel/otel`

## Architecture

Hybrid Clean Architecture with clear layering:

| Layer              | Path                         | Purpose                                                    |
| ------------------ | ---------------------------- | ---------------------------------------------------------- |
| **Domain**         | `src/domain/`                | Valibot schemas, pure business rules, invariants           |
| **Use-Cases**      | `src/use-cases/`             | Application scenarios, ports, feature-local types          |
| **Server-State**   | `src/ui/server-state/`       | TanStack Query hooks, keys, cache orchestration            |
| **UI Actions**     | feature-local `actions.ts`   | Thin direct Server Action wrappers without query semantics |
| **Inbound**        | `src/adapters/inbound/next/` | Server Actions, route handlers, request mapping            |
| **Outbound**       | `src/adapters/outbound/`     | Supabase, external APIs, transport                         |
| **UI**             | `src/app/`, `src/ui/`        | Pages, layouts, components, presentation hooks             |
| **Infrastructure** | `src/infrastructure/`        | Auth, i18n, logging, config, common support                |

**Dependency Flow**:
`app/ui → ui/server-state | actions.ts → inbound adapters → use-cases → outbound adapters → domain`

(Full tree: `@docs/ARCHITECTURE/FOLDER_STRUCTURE.md`.)

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

**Domain Validation**: Valibot schemas for runtime validation + inferred TypeScript types.

**Component Pattern**: Smart/Dumb separation via `composeHooks(View)(useProps)`.

**State Management**: UI state (`useState` / `useReducer`), Server state (TanStack Query), Global (Context).

**Server State**: TanStack Query lives in `src/ui/server-state/<feature>/`.

**Server Actions**: inbound mutations use `next-safe-action` clients from `src/infrastructure/actions/safe-action.ts`. Keep exported action functions as stable app-level APIs, but put validation, auth context, and role checks in the safe-action layer.

**Direct Server Actions**: Use feature-local `actions.ts`, not direct adapter imports from component hooks.

**Cache Invalidation**: use centralized tags from `src/infrastructure/cache/tags.ts` with `updateTag()` for read-your-writes after Server Actions and `revalidateTag(tag, profile)` for broader invalidation. Avoid ad-hoc `revalidatePath()` unless the route tree itself is the unit of invalidation.

**Proxy/CSP**: the active Next.js Proxy file is `src/proxy.ts` because the app router is under `src/app`. Do not move it to the repository root unless the app router is moved too. Keep CSP changes compatible with Cache Components/PPR; request-time nonces require fully dynamic rendering.

**Authorization Boundary**: `src/proxy.ts` is not the authorization boundary. It may refresh sessions, redirect, set request headers, and apply CSP/security headers. Data access must verify auth/authz again inside server-only DAL, inbound adapters, or use-case paths. Modules that read cookies, headers, DB clients, service role keys, or secrets must use `import 'server-only'` and must not be imported by Client Components.

**Environment**: read env through `src/infrastructure/env/public.ts`, `client.ts`, `server.ts`, or `runtime.ts`. Do not read `process.env` directly in runtime code; ESLint enforces this outside env helpers and tests.

**i18n**: `messages.json` + `<TranslationText {...messages.key} />`; locale files live in `src/infrastructure/i18n/`. `src/proxy.ts` seeds the locale cookie from `Accept-Language`; `LocaleProvider` then prefers localStorage, cookie, and finally `en`.

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
- ✅ Run `bun run lint`, `bun run typecheck`, `bun test`, `bun run test:e2e` explicitly when needed
- ✅ Keep architecture boundaries enforced by ESLint
- ✅ Use `data-testid` for critical interactive UI used in e2e

## Adding Features

Follow layer order: **Domain → Use-Case ports/types → Outbound Adapter → Inbound Adapter (safe Server Action / route handler) → Server-State or feature-local action → UI**

If the feature needs server data in UI:

1. create domain schemas
2. add use-cases and ports
3. implement outbound adapter
4. add safe Server Action / route handler
5. add `ui/server-state/<feature>/queries.ts` or `mutations.ts`
6. consume from UI

See `@.claude/rules/architecture.md` and `@docs/ARCHITECTURE/ARCHITECTURE.md` + `COMPONENT_PATTERNS.md` for the full per-layer code walkthrough.

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
| `.agents/skills/project-onboarding/SKILL.md` | Project onboarding entry point                                                    |

## Environment Variables

Copy `.env.example` → `.env.local` and fill in values.

Required in `.env.local`:

| Variable                        | Description               |
| ------------------------------- | ------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key    |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key |

Env values are validated in `src/infrastructure/env/*`. Optional browser-safe values live in `public.ts`, required browser client values in `client.ts`, server-only values in `server.ts`, and runtime flags in `runtime.ts`. Never create `NEXT_PUBLIC_*` variants for service role keys or backend API keys.

The template uses placeholder env variables for:

- Supabase URL / anon key / service role key
- optional Sentry config
- optional external AI gateway config

Customize them before first real project use. Optional integrations add their own env variables (Sentry, external AI gateway) — see `docs/TEMPLATE_GUIDE/OPTIONAL_*`.

<!-- cc-tuner:karpathy-guidelines -->
## Coding Guidelines

Behavioral guidelines to reduce common LLM coding mistakes (derived from Andrej Karpathy's observations). Bias toward caution over speed; for trivial tasks, use judgment.

### 1. Think Before Coding
**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First
**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes
**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution
**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.
