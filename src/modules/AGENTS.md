# Capability Modules

This directory owns product behavior. A folder is a capability, not a technical layer.

## Allowed Shape

Create only needed segments:

```text
<capability>/
├── domain/
├── application/
├── server/
├── client/
├── ui/
├── server.ts
├── rsc.ts
├── actions.ts
├── client.ts
├── cache.ts
└── ui.ts
```

## Boundaries

- Import another capability only through one of its root public surfaces.
- Keep the cross-capability graph acyclic.
- `domain/**` imports only its own domain and admitted `shared/kernel`.
- `application/**` imports its own domain/application and `shared/kernel`; inject effects through
  narrow capability-language ports.
- `server/**` owns private stores and provider adapters.
- `client/**` never imports server surfaces.
- `ui/**` imports its own client/domain values and exact action functions when required.
- Public root files must be narrow; never use `export *`.

## Behavior

- Simple CRUD does not need an application operation or repository port.
- An application operation must pass the deletion test.
- Cross-capability policy belongs to an orchestrator such as `assistant-suggestions`.
- Source capabilities remain unaware of orchestrators.
- `server.ts` receives explicit identity/effects and reports nothing.
- `actions.ts` is for commands, never browser reads.
- `rsc.ts` handles server-rendered reads and prefetch.
- `client.ts` exposes browser-safe query/subscription behavior.
- `cache.ts` exposes query keys and, only for actual server-cached reads, cache-tag identities.
- `cache.ts` is runtime-neutral and imports only its own domain or `shared/kernel`.
- Shared auth supplies provider `userId` only. Resolve role/profile through the `identity`
  capability, then enforce the target capability's own policy.

Run `bun run lint .`, `bun run architecture:check`, relevant tests, and `bun run typecheck`.
