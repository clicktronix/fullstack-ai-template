# Fullstack AI Template

Next.js 16 template for full-stack B2B and AI products. The shipped example uses React 19,
TypeScript, Mantine, Valibot, TanStack Query, Supabase, Sentry, and Bun.

`CLAUDE.md` imports this file. Keep cross-agent rules here; use `.claude/rules/*.md` only for
Claude Code path-scoped detail.

## Setup

```bash
bun install
cp .env.example .env.local
bun run setup:mcp
bun run setup:skills
bun run bootstrap # optional template rename
```

## Commands

| Command                      | Purpose                                                |
| ---------------------------- | ------------------------------------------------------ |
| `bun run dev`                | Next.js dev server                                     |
| `bun run typecheck`          | Next route types plus strict TypeScript                |
| `bun run lint .`             | ESLint, import resolution, and architecture boundaries |
| `bun run architecture:check` | Cross-capability cycle check                           |
| `bun test`                   | Unit and component tests                               |
| `bun run build`              | Production build and server/client poisoning check     |
| `bun run check`              | Required static quality gate                           |
| `bun run test:e2e`           | Playwright end-to-end tests                            |
| `bun run knip`               | Dead-code and unused-export audit                      |

Run the narrowest relevant tests while editing, then run the full gates appropriate to the
change. Do not describe a check as passed unless you ran it in the current worktree.

## Architecture

The repository is capability-first:

```text
src/
├── app/                  # Next.js routes and route-private composition
├── generated/            # Mechanical provider contracts; never domain language
├── modules/<capability>/ # Product ownership
└── shared/               # Admitted cross-capability contracts by runtime
```

Current product capabilities are `identity`, `work-items`, `labels`, and
`assistant-suggestions`. Provider realtime transport is shared client infrastructure; the
table-to-capability invalidation map is app-level composition under `app/_internal`.

A capability creates only the segments it needs:

| Segment        | Responsibility                                                |
| -------------- | ------------------------------------------------------------- |
| `domain/`      | Pure schemas, values, and invariants                          |
| `application/` | Real policy or orchestration that passes the deletion test    |
| `server/`      | Private server adapters, stores, and provider implementations |
| `client/`      | Browser fetch, cache, subscriptions, and client orchestration |
| `ui/`          | Reusable capability-owned presentation                        |

Other capabilities and `app/**` import root surfaces, never another capability's internals:

| Surface                | Consumer                                                      |
| ---------------------- | ------------------------------------------------------------- |
| `server.ts`            | Trusted server composition with explicit identity and effects |
| `rsc.ts`               | Server Components and server-rendered prefetch                |
| `actions.ts`           | UI commands only                                              |
| `client.ts`            | Browser-safe reads, mutations, and subscriptions              |
| `ui.ts`                | Reusable capability UI                                        |
| `query-cache.ts`       | Query-key identity shared by RSC prefetch and browser queries |
| `stream.ts` / `job.ts` | Streaming or background channels when present                 |

A module follows a coherent product goal, vocabulary, policy, and lifecycle. Do not create one
module per table, CRUD screen, route, provider, or role check. Keep related reference entities in
their owning taxonomy/workflow capability; split only when actor goals, policy, lifecycle, change
authority, or a stable public contract diverge.

Runtime flow is channel-specific:

```text
RSC read       -> module/rsc.ts     -> module/server.ts -> private store/provider
Browser read   -> GET route         -> module/server.ts -> private store/provider
UI command     -> module/actions.ts -> module/server.ts -> private store/provider
External HTTP  -> route handler     -> module/server.ts -> private store/provider
```

Private `server/**` never imports its own root public surfaces. Channel files depend inward on
private implementation; shared failure and policy contracts live in domain/application code.

Do not use Server Actions as browser query transport. Server Components call `rsc.ts` or a trusted
server surface directly. Browser-owned query lifecycles use GET or a stream.

`shared/**` is split by runtime:

- `shared/kernel`: pure cross-capability contracts only.
- `shared/server`: server-only framework and provider support.
- `shared/client`: browser-only environment, transport, and observability support.
- `shared/ui`: reusable presentation, providers, formatting, and neutral i18n mechanics.

Generated provider schemas live under `src/generated/**`. Only private capability `server`/`client`
adapters and `shared/server`/`shared/client` runtime code may import them.
The product locale catalog lives in `app/_internal/i18n`; shared providers receive it as input.
Runtime-neutral `query-cache.ts` exists only when both RSC prefetch and browser queries consume the
same serializable TanStack Query keys. It imports only its capability domain or `shared/kernel`.

Admission to shared code requires at least two real consumers, identical meaning and lifecycle, no
natural capability owner, and a narrower coordination cost than duplication. Delete or demote
speculative helpers.

The executable floor lives in `rules/architecture-contract.json` and
`rules/eslint-boundaries*.mjs`. It enforces ownership, public surfaces, runtime direction, and
cycles. It does not prove authorization, reporting, cache policy, transaction scope, or semantic
depth; cover those with tests and review.

## Application Rules

- Create an application operation only if deleting it moves meaningful policy, branching,
  projection, transaction intent, or orchestration into callers.
- Simple store-backed CRUD goes from a channel boundary to `server.ts` to a private store.
- A port belongs to the application behavior that names it. Do not mirror every table with a
  repository interface.
- Cross-capability behavior belongs to an orchestrating capability. Its private adapters call
  source capabilities through root public surfaces.
- Trusted `server.ts` functions accept explicit identity and effects, enforce capability policy,
  and remain silent. The outer runtime channel reports an unexpected failure once.
- Shared auth verifies provider identity only. The `identity` capability resolves product profile
  and role; each target capability enforces its own authorization policy.
- Validate untrusted input at the runtime boundary. Validate provider rows before returning domain
  values. Keep framework redirects/navigation outside broad catches.
- Cache ownership follows data ownership. Shared query-key identity lives in `query-cache.ts`;
  Next cache tags and invalidation stay private under `server/**`. Invalidate only caches that the
  read path actually populates.

## Frontend Rules

- Route-private UI stays under the owning `app/**/_internal` segment.
- Reusable product UI belongs to `modules/<capability>/ui` and is exported through `ui.ts`.
- Cross-capability primitives belong to admitted `shared/ui`.
- Call named hooks directly inside components. Do not pass hooks as values or recreate a generic
  hook-composition helper.
- Separate a View only when it improves testing or readability; it is not a mandatory extra file.
- Use Mantine props and CSS Modules. Do not add inline style objects or hardcoded palette values.
- Use `TranslationText`/`TranslationTitle` and `messages.json` for user-facing strings.
- Keep TanStack Query in the owning capability's `client/` segment. Query keys come from the
  capability's runtime-neutral `query-cache.ts`, not app-local literals.

## Code Style

- Use `type`, not `interface`.
- Prefer functions and plain objects; classes are allowed only for idiomatic `Error` hierarchies.
- Import Valibot functions directly; do not use `import * as v`.
- Do not add `any`, unsafe casts, barrel `export *`, or direct runtime `process.env` reads.
- Mark secret, cookie, header, database, and provider modules with `server-only`.
- Keep edits scoped. Do not refactor unrelated code or remove user changes.

## Tests

- Domain: schema and invariant tests.
- Application: pure tests with explicit fake ports.
- Server adapters: mapping, provider failure, auth policy, and integration tests.
- Route/Action boundaries: decoding, status/result mapping, idempotency, invalidation of any
  server cache they actually populate, and report-once behavior.
- Client: query transport, cache updates, auth lifecycle, and user-visible failure states.
- Architecture: at least one failing mutation per claimed invariant.

## Documentation

- `wiki/ARCHITECTURE/ARCHITECTURE.md`: complete project contract.
- `wiki/ARCHITECTURE/QUICK_REFERENCE.md`: daily decision table.
- `wiki/ARCHITECTURE/FOLDER_STRUCTURE.md`: annotated physical tree.
- `wiki/ARCHITECTURE/DATA_ACCESS.md`: channels, auth, failures, and cache.
- `wiki/ARCHITECTURE/COMPONENT_PATTERNS.md`: RSC/client composition and direct-hook pattern.
- `rules/README.md`: executable enforcement and its limits.

Update code, agent instructions, human documentation, and diagrams together when the architecture
changes.

## Pull Requests

Use short imperative commit subjects. PRs must state scope, architecture decisions, verification
commands, and any gates not run. Include screenshots only for visual changes.

<!-- cc-tuner:karpathy-guidelines -->

## Coding Guidelines

Think before coding, prefer the smallest sufficient change, touch only task-relevant lines, and
define verifiable success criteria. Surface uncertainty instead of silently inventing behavior.
