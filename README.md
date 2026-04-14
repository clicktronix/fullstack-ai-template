# fullstack-ai-template

Opinionated full-stack template for AI products and B2B apps.

## Stack

- Next.js 16
- React 19
- TypeScript
- Bun
- Mantine
- Valibot
- TanStack Query
- Zustand
- Supabase

## Architecture

Hybrid Clean Architecture:

```text
app/ui -> ui/server-state | feature-local actions.ts -> inbound adapters -> use-cases -> outbound adapters -> domain
```

## What this template includes

- full-stack app shell
- auth baseline
- Supabase adapter setup
- `ui/server-state`
- import boundary lint rules
- CI baseline
- unit + e2e baseline
- Storybook baseline for the demo slice
- optional Sentry wiring
- a small AI-flavored assistant suggestions flow
- reusable agent tooling:
  - `AGENTS.md`
  - `.agents`
  - `.claude`
  - `.mcp.json`
- one demo vertical slice

## Documentation

- `AGENTS.md`
- `docs/ARCHITECTURE/*`
- `docs/TEMPLATE_GUIDE/*`

## Bootstrap

Create your project identity before changing the demo domain:

```bash
bun run bootstrap -- --name=my-new-app --title="My New App"
```

What it updates automatically:

- `package.json` package name
- app title and metadata
- `README.md`
- `AGENTS.md`
- landing page title/copy
- locale cookie key
- core template guide files

## Environment

Copy `.env.example` to `.env.local` and fill Supabase credentials.

Optional integrations:

- Storybook: `bun run storybook`
- Storybook guide: `docs/TEMPLATE_GUIDE/OPTIONAL_STORYBOOK.md`
- Sentry guide: `docs/TEMPLATE_GUIDE/OPTIONAL_SENTRY.md`
- AI suggestions endpoint:
  - if `AI_SUGGESTIONS_API_URL` is empty, the assistant panel uses deterministic local suggestions
  - if it is configured, the template calls your external AI service
  - endpoint contract: `docs/TEMPLATE_GUIDE/OPTIONAL_AI_ENDPOINT.md`

E2E auth credentials are optional in the baseline template:

- if `E2E_USER_EMAIL` and `E2E_USER_PASSWORD` are configured, login/logout auth flows run;
- if they are omitted, baseline E2E still verifies anonymous access control for protected routes.

## Recommended Flow

1. Run the bootstrap command.
2. Fill `.env.local`.
3. Start the app with `bun run dev`.
4. Verify the baseline with `bun run check` and `bun run test:e2e`.
5. Explore Storybook with `bun run storybook`.
6. Replace the demo `work-items` slice with your own domain.
