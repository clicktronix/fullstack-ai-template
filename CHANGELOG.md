# Changelog

All notable changes to this template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Note: this template is meant to be forked. The "version" applies to the template baseline. Once you bootstrap a product from it, you own the changelog.

## [Unreleased]

## [1.0.0] - 2026-05-03

First public release of the template.

### Added

- Next.js 16 App Router baseline with React 19, TypeScript, Bun, Mantine 8, CSS Modules, and Valibot domain schemas.
- Hybrid Clean Architecture layout: `domain/` → `use-cases/` → `adapters/inbound/next/` (Server Actions + Route Handlers) → `adapters/outbound/` → `infrastructure/`.
- Auth baseline on Supabase SSR with role-based access, `verifySession()` DAL, AuthContext + `onAuthStateChange`, and a Postgres trigger that promotes the first signed-up user to `owner` under `pg_advisory_xact_lock`.
- Demo vertical slice (`work-items` + `labels` + optional AI suggestions) covering the full request flow: form → safe Server Action → use-case → port → Supabase repository.
- Service API vertical (`GET/POST /api/work-items`) with `Idempotency-Key` durable storage, JSON `{data | error, requestId}` envelopes, and tagged cache invalidation.
- Webhook example (`POST /api/webhooks/example`) with timing-safe HMAC signature verification on the raw body and 401 on signature failure.
- Cache Components (`cacheComponents: true`) with `cacheTag`, `cacheLife`, `updateTag` (read-your-writes from Server Actions), and `revalidateTag(tag, profile)` (SWR from Route Handlers).
- Parallel + intercepting routes (`/admin/@modal`, `(.)work-items/[id]`) with `default.tsx` slots and a hard-navigation page fallback.
- Progressive-enhancement forms via `useActionState`; signup form returns typed `errorKey` values that the client localizes through `intl.formatMessage`.
- Locale detection at the request boundary in `src/proxy.ts`: RFC 7231 `Accept-Language` parser with q-values, region normalization, and idempotent cookie persistence (`sameSite: 'lax'`, `secure` outside dev).
- Centralized environment access through `src/infrastructure/env/{server,public,client,runtime}.ts` with Valibot schemas and `assertNoPublicSecrets()` guard against `NEXT_PUBLIC_` secret leakage.
- Centralized cache tag taxonomy (`workItems.user(userId)`, `workItems.lists(userId)`, etc.) for user-scoped invalidation.
- Centralized `next-safe-action` action client with `actionClient`, `authActionClient`, and `adminActionClient` — input parsing, role checks, and unified error→action-code mapping.
- Centralized API response helpers (`apiJson`, `apiError`, `apiErrorWithCode`) and `createApiHandlerContext()` for Route Handler boundaries.
- Pino server logger with `pinoRedactPaths` (authorization, cookie, password, access_token, secret, service_role) and a Sentry `beforeSend` hook that runs the same redactor.
- OpenTelemetry instrumentation hook via `@vercel/otel`.
- Supabase migrations: users + RLS with `(select auth.uid())` and `with check` identity column pin; idempotency keys; admin DELETE policies; first-user-owner trigger.
- ESLint boundary rules enforcing layer dependency direction (`no-restricted-imports` per layer).
- Unit tests (893 across 47 files) and Playwright E2E (auth, CSP, progressive forms, access control, login errors).
- Storybook with theme palette stories and selected component stories.
- Docker baseline.
- CI workflow (lint, typecheck, knip, unit, e2e).
- Bootstrap script (`bun run bootstrap -- --name=my-app`) to rename the template into a product slug.
- Setup scripts for MCP servers (`setup:mcp`) and Claude/Codex skill marketplaces (`setup:skills`), with idempotent doctor modes.
- Native Claude Code marketplace plugins auto-installed on repo trust: `clicktronix/nextjs-clean-skills@v1.1.0`, `supabase/agent-skills`, `tanstack-skills/tanstack-skills`, `obra/superpowers-marketplace`.
- Codex plugin marketplace declared in `.agents/plugins/marketplace.json` pinned to `nextjs-clean-skills@v1.1.0` for reproducible installs.
- Vercel `agent-skills` (`vercel-react-best-practices`, `vercel-composition-patterns`, `web-design-guidelines`) installed via `npx skills add`.
- MCP servers: Supabase, Playwright, Chrome DevTools.
- Documentation:
  - Architecture: `docs/ARCHITECTURE/{ARCHITECTURE,ARCHITECTURAL_RATIONALE,BACKEND_SERVICE_PATTERNS,COMPONENT_PATTERNS,DATA_ACCESS,FOLDER_STRUCTURE,MIGRATION_PLAN,QUICK_REFERENCE,THEMING,USE_CASES}.md`.
  - Template guide: `docs/TEMPLATE_GUIDE/{GETTING_STARTED,CUSTOMIZE_TEMPLATE,FIRST_FEATURE,SKILLS_AND_PLUGINS,OPTIONAL_SENTRY,OPTIONAL_AI_ENDPOINT,OPTIONAL_STORYBOOK}.md`.
  - Testing: `docs/TESTING/TESTING_STRATEGY.md`.
  - Agent context: `CLAUDE.md`, `AGENTS.md`.

### Security

- `src/proxy.ts` is documented as a routing/session-refresh layer, NOT the authorization boundary (CVE-2025-29927). Authority is re-checked in DAL, Server Actions, and Route Handlers.
- `getUser()` (not `getSession()`/`getClaims()`) is used in proxy and DAL to ensure Supabase token refresh runs.
- Service role keys are confined to server-only modules; ESLint blocks direct `process.env` access outside `src/infrastructure/env/`.
- OAuth provider input is a Valibot picklist, never a free string.
- RLS policies pin authority columns (`role`, `email`, `created_at`) via `with check` so users cannot self-promote.
- Webhook verification reads the raw body before JSON parsing and uses `timingSafeEqual`.
- Idempotency state is durable (Postgres) and scoped by user/method/path; never an in-memory map.
