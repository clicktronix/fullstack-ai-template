# Folder Structure

```text
src/
├── app/
│   ├── (public)/
│   ├── (protected)/
│   ├── api/
│   └── _internal/                 route-private composition
├── generated/
│   └── supabase/                  generated provider contracts
├── modules/
│   ├── identity/
│   │   ├── domain/
│   │   ├── server/
│   │   ├── client/
│   │   ├── ui/
│   │   ├── server.ts
│   │   ├── rsc.ts
│   │   ├── actions.ts
│   │   ├── client.ts
│   │   └── ui.ts
│   ├── work-items/
│   │   ├── domain/
│   │   ├── server/
│   │   ├── client/
│   │   ├── server.ts
│   │   ├── rsc.ts
│   │   ├── actions.ts
│   │   └── client.ts
│   ├── labels/
│   └── assistant-suggestions/
│       ├── domain/
│       ├── application/
│       ├── server/
│       ├── client/
│       ├── server.ts
│       ├── actions.ts
│       └── client.ts
└── shared/
    ├── kernel/
    ├── server/
    ├── client/
    └── ui/
```

The tree is descriptive, not a scaffold. Empty segments are invalid.

## Route Ownership

`app/**` owns Next.js files (`page`, `layout`, `route`, `loading`, `error`, metadata) and
route-private presentation. It composes module root surfaces and app-wide runtime mappings, such
as the product locale catalog or provider realtime events to capability query keys.

## Capability Ownership

A capability is independently nameable product behavior. It may use:

- `domain`: pure language and invariants;
- `application`: policy/orchestration that passes the deletion test;
- `server`: private server adapters;
- `client`: browser lifecycle;
- `ui`: reusable capability presentation.

Runtime root files are the public API. Other modules and app routes never import internal
directories.

## Shared Ownership

Shared roots are runtime-specific. There is no `utils`, `lib`, `services`, or generic migration
bucket. New shared code must pass the admission gate in [Architecture](./ARCHITECTURE.md).

## Generated Contracts

`src/generated/**` is mechanical provider output, not product language. Import it only from private
capability `server/`/`client/` adapters or `shared/server`/`shared/client` runtime code. Domain,
application, UI, public module surfaces, and `app/**` do not depend on generated provider shapes.

## Adding a Capability

1. Name the product capability.
2. Add the minimum domain/server path.
3. Choose runtime channels.
4. Add application policy only if deletion moves complexity.
5. Add client/UI segments only for actual browser/reuse needs.
6. Export narrow root surfaces.
7. Add tests and run architecture gates.
