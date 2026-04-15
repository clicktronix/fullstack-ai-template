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

## MCP References

The template includes `.mcp.json` with:

- Supabase MCP
- Playwright MCP
- Chrome DevTools MCP

Official references:

- MCP client/server concepts:
  https://modelcontextprotocol.io/docs/learn/client-concepts
- MCP tools specification:
  https://modelcontextprotocol.io/specification/2025-03-26/server/tools
- Supabase MCP:
  https://supabase.com/mcp
- Playwright MCP:
  https://github.com/microsoft/playwright-mcp
- Chrome DevTools MCP:
  https://github.com/ChromeDevTools/chrome-devtools-mcp

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
- `CLAUDE.md`
- landing page title/copy
- locale cookie key
- core template guide files

## Agent Tooling Setup Flow

Use this flow for local agent tooling:

1. `bun install`
2. `bun run bootstrap -- --name=my-new-app --title="My New App"`
3. `bun run setup:mcp`
4. `bun run setup:skills`
5. If needed, `bun run setup:mcp -- --install-browsers`

### Skills and plugin marketplaces

`bun run setup:skills` registers these upstream marketplaces and installs the corresponding plugins at project scope:

| Source                            | Plugin                                          | Provides                                     |
| --------------------------------- | ----------------------------------------------- | -------------------------------------------- |
| `supabase/agent-skills`           | `postgres-best-practices@supabase-agent-skills` | Supabase Postgres best practices             |
| `tanstack-skills/tanstack-skills` | `tanstack-query@tanstack-skills`                | TanStack Query guidance                      |
| `obra/superpowers-marketplace`    | `superpowers@superpowers-marketplace`           | Agent workflow and discipline skills         |
| `clicktronix/react-clean-skills`  | `react-clean-skills@react-clean-skills`         | Clean Architecture and Smart/Dumb components |

Vercel agent-skills (no public marketplace yet) are installed via `npx skills add vercel-labs/agent-skills` and tracked in `skills-lock.json`:

- `vercel-react-best-practices`
- `vercel-composition-patterns`
- `web-design-guidelines`

Update flow:

```bash
claude plugin update            # marketplace plugins
npx skills update --project     # Vercel skills
```

Project-local skills live in `.agents/skills/` (mirrored to `.claude/skills/` via symlinks): `e2e-testing`, `claude-md-writer`, `project-onboarding`.

What this gives you:

- local `@playwright/mcp`
- local `chrome-devtools-mcp`
- a readiness check for `.mcp.json`, Playwright browsers, and Chrome debugging

Expected manual steps:

1. start Chrome with `--remote-debugging-port=9222` for the Chrome DevTools MCP server
2. connect or authenticate Supabase MCP in your MCP client if your tool requires an explicit sign-in step

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

## First User Bootstrap

- the first signed-up user becomes `owner` automatically
- every next user is created with role `pending`
- use the first owner account to decide how your real product should approve or promote users

## Recommended Flow

1. Run the bootstrap command.
2. Fill `.env.local`.
3. Start the app with `bun run dev`.
4. Verify the baseline with `bun run check` and `bun run test:e2e`.
5. Explore Storybook with `bun run storybook`.
6. Replace the demo `work-items` slice with your own domain.
