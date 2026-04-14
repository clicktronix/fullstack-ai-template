# Architecture

## Purpose

This template provides a reusable baseline for full-stack B2B and AI products built with:

- Next.js App Router
- React
- Supabase
- TanStack Query
- Hybrid Clean Architecture

It is not a domain-specific starter. The business vocabulary is intentionally minimal.

## Why This Hybrid Model

Pure frontend clean architecture is usually too abstract for a real Next.js app, and framework-first codebases often blur business logic with transport and UI wiring.

This template keeps the useful separation:

- business core in `domain`
- application orchestration in `use-cases`
- framework entrypoints in inbound adapters
- infrastructure and persistence in outbound adapters
- server data concerns in `ui/server-state`

## Layers

### Domain

`src/domain/`

Contains runtime schemas, inferred types, invariants, and pure helpers.

### Use-Cases

`src/use-cases/`

Contains application scenarios and ports. These files coordinate work but stay independent from Next.js.

### Server-State

`src/ui/server-state/`

Contains React Query hooks, query keys, prefetch helpers, and cache invalidation logic. This is an integration layer between UI and inbound adapters.

### Inbound Adapters

`src/adapters/inbound/next/`

Contains Server Actions and route-handler logic. This is where auth/session context, request mapping, and cache invalidation belong.

### Outbound Adapters

`src/adapters/outbound/`

Contains Supabase repositories, HTTP clients, and transport helpers.

### UI

`src/app/`, `src/ui/`

Contains App Router entrypoints, components, view hooks, providers, themes, and layout code.

### Infrastructure

`src/infrastructure/`

Contains cross-cutting technical support such as auth helpers, locale wiring, and config access.

## Reference Slice

The `work-items` and `labels` features form the template's reference slice.

Use them as the model for new features:

1. add a domain schema
2. add use-cases and ports
3. implement Supabase operations/repositories
4. expose Server Actions
5. add `ui/server-state`
6. build page-specific UI

## Allowed Dependency Directions

- `domain` -> nothing
- `use-cases` -> `domain`, `infrastructure`, outbound ports/types
- `adapters/outbound` -> `domain`, `use-cases`
- `adapters/inbound` -> `use-cases`, `adapters/outbound`, `infrastructure`
- `ui/server-state` -> `adapters/inbound`, `use-cases`, client-safe helpers
- `ui/app` -> `ui/server-state`, feature-local `actions.ts`, `domain`, local UI helpers

## Intentional Exceptions

- feature-local `actions.ts` are allowed for thin direct Server Action calls without TanStack Query
- `ui/server-state` is allowed to depend on inbound adapters

Those exceptions are deliberate and enforced through ESLint boundaries.
