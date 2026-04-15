# Getting Started

## 1. Bootstrap project identity

Run this from the repository root:

```bash
bun run bootstrap -- --name=my-new-app --title="My New App"
```

Required:

- `--name`
  Use kebab-case. This becomes the package name and the locale cookie prefix.

Optional:

- `--title`
  Human-readable product title. If omitted, it is derived from `--name`.

## 2. Configure environment

Copy:

```bash
cp .env.example .env.local
```

Fill at least:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional:

- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`
- `NEXT_PUBLIC_SENTRY_SEND_DEFAULT_PII`
- `AI_SUGGESTIONS_API_URL`
- `AI_SUGGESTIONS_API_KEY`
- `E2E_USER_EMAIL`
- `E2E_USER_PASSWORD`

If E2E credentials are omitted, the template still runs anonymous access-control smoke tests.

## 2.5 First user role bootstrap

The baseline template promotes the first signed-up user to `owner` automatically.

- first user: `owner`
- every next user: `pending`

This keeps the starter usable without a manual SQL bootstrap step, but you should still replace this behavior with your own team onboarding flow as soon as your product rules are clear.

## 3. Install and run

```bash
bun install
bun run setup:mcp
bun run setup:skills
bun run dev
bun run storybook
```

If Playwright MCP browsers are missing, run:

```bash
bun run setup:mcp -- --install-browsers
```

`bun run setup:skills` registers four plugin marketplaces (`supabase/agent-skills`, `tanstack-skills/tanstack-skills`, `obra/superpowers-marketplace`, `clicktronix/react-clean-skills`) and installs three Vercel agent-skills via `npx skills add vercel-labs/agent-skills`. Re-run anytime to refresh. Update later with:

```bash
claude plugin update            # marketplace plugins
npx skills update --project     # Vercel skills
```

## 4. Verify baseline health

Run sequentially:

```bash
bun run check
bun run test
bun run knip
bun run test:e2e
```

## 5. Read these next

- `AGENTS.md`
- `docs/ARCHITECTURE/QUICK_REFERENCE.md`
- `docs/ARCHITECTURE/ARCHITECTURE.md`
- `docs/TEMPLATE_GUIDE/CUSTOMIZE_TEMPLATE.md`
- `docs/TEMPLATE_GUIDE/OPTIONAL_STORYBOOK.md`
- `docs/TEMPLATE_GUIDE/OPTIONAL_SENTRY.md`
- `docs/TEMPLATE_GUIDE/OPTIONAL_AI_ENDPOINT.md`
- `.agents/skills/project-onboarding/SKILL.md`

## 6. MCP references

The template ships with three MCP servers in `.mcp.json`.

- MCP basics and architecture:
  https://modelcontextprotocol.io/docs/learn/client-concepts
- MCP tools specification:
  https://modelcontextprotocol.io/specification/2025-03-26/server/tools
- Supabase MCP official docs:
  https://supabase.com/mcp
- Playwright MCP official repository and setup:
  https://github.com/microsoft/playwright-mcp
- Chrome DevTools MCP official repository and setup:
  https://github.com/ChromeDevTools/chrome-devtools-mcp

Use these references when you need to:

- understand how MCP clients and servers are wired
- adjust `.mcp.json`
- change authentication or permissions for Supabase MCP
- tune Playwright or Chrome DevTools MCP runtime options

Expected manual steps after `setup:mcp`:

1. start Chrome with `--remote-debugging-port=9222` for the Chrome DevTools MCP server
2. authenticate Supabase MCP in your client if your MCP host requires an explicit login flow
