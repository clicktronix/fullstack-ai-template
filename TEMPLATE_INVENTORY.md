# Template Inventory

Этот документ фиксирует, как текущий проект будет преобразован в `fullstack-ai-template`.

## Keep 1:1 or close to 1:1

### Tooling and config

- `package.json`
- `bunfig.toml`
- `tsconfig.json`
- `eslint.config.mjs`
- `next.config.ts`
- `.mcp.json`
- `.github/workflows/ci.yml`

### Agent tooling

- `.agents/skills/*` as baseline
- `.claude/skills/*` as baseline
- `.claude/rules/*`

### Architecture baseline

- `src/adapters/inbound/**`
- `src/adapters/outbound/**`
- `src/adapters/supabase/**` low-level support
- `src/infrastructure/**`
- `src/ui/server-state/**` patterns and baseline infra
- `src/ui/components/**` reusable primitives
- `src/ui/hooks/**` reusable UI hooks
- `src/ui/providers/**`
- `src/ui/layout/**`
- `src/ui/themes/**`
- `src/lib/**` generic helpers

### Generic domain and cross-cutting code

- `src/domain/auth`
- `src/domain/shared`
- `src/domain/user` as a starting point for auth/access patterns

### Testing baseline

- `bun:test` setup
- Playwright config
- auth e2e flow
- test helpers that are generic enough to keep

## Rewrite / generalize

### Docs

- `AGENTS.md`
- `docs/ARCHITECTURE/*`
- `docs/PLANS/*` that will survive into template

### Skills

- `architector`
- `component-creator`
- `e2e-testing`

### Agent configs

- `.mcp.json` env placeholders and assumptions

### App shell

- `src/app/**` route tree should be rebuilt around demo domain
- protected/public structure can stay
- route content and labels must be generalized

## Remove completely

### Current business domain

- `src/domain/analyzer`
- `src/domain/blog`
- `src/domain/campaign`
- `src/domain/category`
- `src/domain/city`
- `src/domain/customer`
- `src/domain/platform`
- `src/domain/price-type`
- `src/domain/price-type-category`
- `src/domain/tag`
- most of `src/domain/chat` business semantics if they remain tied to current agent

### Current business use-cases

- `src/use-cases/analyzer`
- `src/use-cases/blogs`
- `src/use-cases/customer`
- `src/use-cases/chat` current business flows

### Current app features and e2e

- `e2e/blogs`
- `e2e/campaigns`
- `e2e/customer`
- current `e2e/chat` business scenarios
- project-specific seed helpers in `e2e/helpers/seed.ts`

### Project-specific docs and assumptions

- influencer/blogger/campaign/customer/analyzer examples
- Telegram bug docs
- LangSmith project names
- project env names like analyzer-specific endpoints

## Replace with new demo vertical slice

Planned neutral slice:

- `records` or `workspace-items`
- `labels` as reference data
- small AI-assisted flow:
  - generated summary
  - assistant suggestions
  - or semantic search

The slice must exercise:

- domain schema
- use-case orchestration
- outbound repository
- inbound server action
- `ui/server-state`
- page UI
- unit tests
- e2e

## Immediate next implementation steps

1. prune project-specific domain and use-case folders from staging copy
2. keep reusable infra and shell
3. decide final demo slice naming
4. rebuild docs and skills around template vocabulary
