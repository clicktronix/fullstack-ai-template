# Fullstack AI Template

Next.js 16 template for AI products and full-stack B2B apps, powered by Supabase and designed for rapid bootstrapping with coding agents.

**Tech Stack**: Next.js 16 (App Router), React 19, TypeScript, Mantine UI + CSS Modules, Valibot (domain schemas), TanStack Query (server state), React Context (global state), Supabase (Postgres + Auth SSR), React Intl (i18n), Bun (package manager). Optional: Storybook, Sentry, OpenTelemetry via `@vercel/otel`.

## First-Time Setup

Run in order: `bun install`, `cp .env.example .env.local` (fill in Supabase keys), `bun run setup:mcp`, `bun run setup:skills`, `bun run bootstrap` (optional, renames the template).

## Commands

| Command             | Purpose                                       |
| ------------------- | --------------------------------------------- |
| `bun run dev`       | Development server (port 3000)                |
| `bun run build`     | Production build                              |
| `bun run lint`      | ESLint                                        |
| `bun run format`    | Prettier + ESLint `--fix`                     |
| `bun run typecheck` | TypeScript validation                         |
| `bun run check`     | `lint + typecheck + format:check + i18n:sync` |
| `bun test`          | Unit tests                                    |
| `bun run test:e2e`  | Playwright e2e                                |

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

**Runtime Call Flow**:
`app/ui → ui/server-state | actions.ts → inbound adapters → use-cases → outbound adapters → domain`

Compile-time imports differ: `use-cases` import only `domain` and their own ports — outbound implementations are injected by the composition root (inbound adapters/DAL), never imported directly by `use-cases`.

(Full tree: `@wiki/ARCHITECTURE/FOLDER_STRUCTURE.md`.)

## Core Rules

- `domain` depends on nothing except domain
- `use-cases` must not import `app`, `ui`, or inbound adapters
- `use-cases` must not import outbound adapters — depend on ports; adapters are injected
- `ui/server-state` is the only UI layer allowed to depend on inbound adapters
- presentation UI must not import outbound adapters directly
- `app/` files stay thin and delegate
- if UI needs a one-off Server Action call without TanStack Query, create local `actions.ts`

## Key Patterns

**Domain Validation**: Valibot schemas for runtime validation + inferred TypeScript types.

**Component Pattern**: View + useProps separation via `composeHooks(View)(useProps)`.

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
- ✅ Use `composeHooks` for View + useProps separation
- ✅ Use `TranslationText` for i18n, never hardcoded strings
- ✅ Dark theme is default (`defaultColorScheme="dark"`)
- ✅ Many types in component? Create `interfaces.ts` file
- ✅ Run `bun run lint`, `bun run typecheck`, `bun test`, `bun run test:e2e` explicitly when needed
- ✅ Keep architecture boundaries enforced by ESLint
- ✅ Use `data-testid` for critical interactive UI used in e2e

## Reference

- **Adding Features**: follow layer order **Domain → Use-Case ports/types → Outbound Adapter → Inbound Adapter (safe Server Action / route handler) → Server-State or feature-local action → UI**; full walkthrough in `@.claude/rules/architecture.md` and `@wiki/ARCHITECTURE/ARCHITECTURE.md` + `COMPONENT_PATTERNS.md`
- **Project Structure**: full annotated tree in `@wiki/ARCHITECTURE/FOLDER_STRUCTURE.md`
- **Naming Conventions**: see `.claude/rules/core.md` (File Naming Reference)
- **Demo Slice**: `work-items` + `labels` (+ optional `assistant-suggestions`) — reference vertical slice for new product features; replace or extend with your own domain
- **All commands**: `package.json` scripts or `wiki/TEMPLATE_GUIDE/GETTING_STARTED.md`

## Modular Documentation

Rules files loaded conditionally by file path:

| Document                         | Paths                                                                                                                | Purpose                                       |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `@.claude/rules/core.md`         | `src/**/*`, `next.config.ts`, `eslint.config.mjs`, `scripts/**/*`, `tests/**/*`                                      | Critical constraints, naming, common pitfalls |
| `@.claude/rules/architecture.md` | `src/domain/**/*`, `src/adapters/**/*`, `src/use-cases/**/*`, `src/app/**/*`, `src/ui/**/*`                          | Clean Architecture layers                     |
| `@.claude/rules/components.md`   | `src/ui/**/*`, `src/app/**/*`                                                                                        | composeHooks, i18n, Server/Client components  |
| `@.claude/rules/styling.md`      | `**/*.module.css`, `**/*Form*/**/*`, `**/*form*`, `src/ui/**/*`                                                      | CSS Modules, Form validation                  |
| `@.claude/rules/data-state.md`   | `src/use-cases/**/*`, `src/ui/server-state/**/*`, `src/ui/hooks/**/*`, `src/ui/stores/**/*`, `src/ui/providers/**/*` | State management decision tree                |
| `@.claude/rules/quality.md`      | `**/*.test.{ts,tsx}`, `**/*.spec.{ts,tsx}`                                                                           | Testing, Performance                          |

Detailed documentation:

| Document                                     | Purpose                                                                           |
| -------------------------------------------- | --------------------------------------------------------------------------------- |
| `nextjs-clean-skills@nextjs-clean-skills`    | Next.js 16 Hybrid Clean Architecture + Server/Client component skills marketplace |
| `@wiki/ARCHITECTURE/QUICK_REFERENCE.md`      | One-page cheatsheet                                                               |
| `@wiki/ARCHITECTURE/ARCHITECTURE.md`         | Complete architecture guide                                                       |
| `@wiki/ARCHITECTURE/COMPONENT_PATTERNS.md`   | composeHooks + Custom Hooks Library                                               |
| `@wiki/ARCHITECTURE/DATA_ACCESS.md`          | API adapters, Supabase                                                            |
| `@wiki/ARCHITECTURE/FOLDER_STRUCTURE.md`     | Project structure                                                                 |
| `@wiki/TEMPLATE_GUIDE/GETTING_STARTED.md`    | First-time setup                                                                  |
| `@wiki/TEMPLATE_GUIDE/CUSTOMIZE_TEMPLATE.md` | Adapting the template to a new product                                            |
| `@wiki/TEMPLATE_GUIDE/SKILLS_AND_PLUGINS.md` | Skill/plugin install & authoring                                                  |
| `@wiki/TESTING/TESTING_STRATEGY.md`          | Testing pyramid, patterns by layer, mocking rules                                 |
| `.agents/skills/project-onboarding/SKILL.md` | Project onboarding entry point                                                    |

## Environment Variables

Copy `.env.example` → `.env.local` and fill in Supabase + optional Sentry/AI-gateway values before first real project use. Env values are validated in `src/infrastructure/env/*`; never create `NEXT_PUBLIC_*` variants for secret/service-role keys. Full variable list and descriptions: `wiki/TEMPLATE_GUIDE/GETTING_STARTED.md` (optional integrations: `wiki/TEMPLATE_GUIDE/OPTIONAL_*`).

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
