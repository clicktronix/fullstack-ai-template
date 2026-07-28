---
name: project-onboarding
description: Guide a contributor through the template repository structure, architecture, commands, and first feature workflow.
---

# Project Onboarding

Use this skill when a user asks:

- how this template is structured
- where to start in the repository
- how the architecture works
- how to add the first feature

## Workflow

1. Start with `AGENTS.md`
2. Continue with `wiki/ARCHITECTURE/QUICK_REFERENCE.md`
3. Explain capability ownership and runtime-specific public surfaces
4. Point to `src/modules/work-items` as the reference capability
5. Show the commands for validation
6. Explain the safest path for adding a new feature
7. Show the MCP setup flow:
   - `bun install`
   - `bun run bootstrap -- --name=... --title="..."`
   - `bun run setup:mcp`
   - `bun run mcp:doctor`

## Architecture Summary

- Product code belongs to `src/modules/<capability>/`.
- `domain/`, `application/`, `server/`, `client/`, and `ui/` are optional implementation
  segments inside a capability.
- Other capabilities and `app/**` use only root public surfaces such as `server.ts`, `rsc.ts`,
  `actions.ts`, `client.ts`, `ui.ts`, and runtime-neutral `cache.ts`.
- Browser reads use GET or streaming endpoints. Server Actions are commands.
- Shared auth resolves provider identity only; the `identity` capability owns product role/profile.
- Code moves to `src/shared/**` only after two real consumers share the same meaning and runtime.
- Application operations must pass the deletion test; direct CRUD does not need a wrapper.

## MCP References

When onboarding someone into the template's agent tooling, point them to:

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

Use these links when explaining:

- what `.mcp.json` configures
- which MCP servers are enabled in the template
- where to look before changing MCP auth, runtime flags, or browser integration
- why Chrome DevTools MCP still needs a manual remote-debugging Chrome session
