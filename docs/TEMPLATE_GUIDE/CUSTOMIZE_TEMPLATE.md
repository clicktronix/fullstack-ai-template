# Customize Template

## What the bootstrap script does

`bun run bootstrap -- --name=<slug> --title="<Title>"`

It updates:

- `package.json`
- `README.md`
- `AGENTS.md`
- app metadata in `src/app/layout.tsx`
- landing page title/copy
- locale cookie key
- key template-guide references

## What you still change manually

Bootstrap does not replace product domain decisions. Review these areas yourself:

- `src/domain/`
- `src/use-cases/`
- `src/adapters/inbound/`
- `src/adapters/outbound/`
- `src/ui/server-state/`
- `src/app/(protected)/admin/work-items`
- locale strings that still mention the demo slice

## Replacing the demo slice

Current demo slice:

- `work-items`
- `labels`

Recommended sequence:

1. Add your new domain schemas.
2. Add use-cases and ports.
3. Implement outbound adapters.
4. Add inbound Server Actions or route handlers.
5. Add `ui/server-state/<feature>/`.
6. Replace the admin page entrypoints.
7. Remove `work-items` only after your own slice is green.

## Optional integrations

Prepared but optional:

- Storybook
- Sentry
- external AI suggestions endpoint

If you do not need them:

- remove related env vars from `.env.example`
- remove npm scripts
- delete setup files and docs references

Reference guides:

- `docs/TEMPLATE_GUIDE/OPTIONAL_STORYBOOK.md`
- `docs/TEMPLATE_GUIDE/OPTIONAL_SENTRY.md`
- `docs/TEMPLATE_GUIDE/OPTIONAL_AI_ENDPOINT.md`

## Skills and MCP

The template intentionally keeps:

- `.agents`
- `.claude`
- `.mcp.json`

Adapt them in two passes:

1. Replace project identity and vocabulary
2. Keep architecture/process guardrails unless your team has a deliberate alternative
