# Customize Template

## Bootstrap Product Identity

```bash
bun run bootstrap -- --name=<slug> --title="<Title>"
```

The script updates package metadata, app metadata, locale identity, and template references. It
does not choose product capabilities, authorization policy, or data ownership.

## Replace The Demo Capabilities

The starter includes:

- `identity`
- `work-items`
- `labels`
- `assistant-suggestions`

Realtime is not a product capability in the starter. Generic Supabase subscription transport lives
in `shared/client`; `app/_internal` maps provider table events to capability query keys.

Replace them capability by capability:

1. Add `src/modules/<capability>/`.
2. Move schemas and invariants into optional `domain/`.
3. Add private `server/` stores or providers.
4. Add the public runtime surfaces the feature actually needs.
5. Add client state under the same capability.
6. Point `app/**` routes at the public surfaces.
7. Delete the old capability only after tests and build are green.

Do not start by copying every segment. A CRUD-only capability may need only `server.ts`,
`server/store.ts`, and one route.

## Decide Authorization Early

The first signed-up user becomes `owner`; later users become `pending`. Replace this starter policy
before production:

- define who creates the first owner;
- choose invitation versus open signup;
- decide what `pending` users may see;
- test role and tenant checks at each trusted server entrypoint.

## Shared Code

Do not move product code to `src/shared/**` during the first extraction. Promote it only after two
real capabilities share the same meaning, runtime, and change cadence. Record an owner and move it
back when the abstraction diverges.

## Optional Integrations

Prepared but removable:

- [Storybook](OPTIONAL_STORYBOOK.md)
- [Sentry](OPTIONAL_SENTRY.md)
- [external AI suggestions](OPTIONAL_AI_ENDPOINT.md)

Remove their env variables, packages, setup files, and documentation together.

## Agent Configuration

Keep `.agents`, `.claude`, `.mcp.json`, and `AGENTS.md`. Change product vocabulary first; keep the
architecture and verification guardrails unless the team adopts a deliberate replacement.
