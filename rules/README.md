# Architecture Rules

These files enforce the machine-observable floor of the capability-first contract. They cannot
infer business meaning from path names.

| File                             | Purpose                                                     |
| -------------------------------- | ----------------------------------------------------------- |
| `architecture-contract.json`     | generated root, segments, public surfaces, and shared roots |
| `eslint-boundaries.mjs`          | capability ownership, purity, and server/client direction   |
| `eslint-boundaries-resolved.mjs` | unresolved-import and file-cycle canaries                   |
| `check-module-cycles.mjs`        | capability-level cycle detection                            |

## Enforced Invariants

1. `app/**` and other capabilities import a capability only through root public surfaces.
2. `domain/**` imports only its own domain and admitted `shared/kernel`.
3. domain and application code reject configured framework and provider packages.
4. browser code cannot import server surfaces; server capability code cannot import browser
   surfaces. `actions.ts` is the explicit browser-to-server command boundary.
5. module-root files use the admitted runtime vocabulary:
   `server`, `rsc`, `actions`, `client`, `ui`, `cache`, `stream`, or `job`.
6. shared code uses `shared/kernel`, `shared/server`, `shared/client`, or `shared/ui` and cannot
   depend on product capabilities.
7. unresolved imports, computed dynamic loads, file cycles, and capability cycles fail validation.
8. generated provider contracts are limited to private server/client adapters and shared
   server/client runtime code.
9. runtime-neutral `cache.ts` surfaces import only their own domain or `shared/kernel`.

## Review-Only Invariants

Static imports cannot prove:

- whether an application operation passes the deletion test;
- whether a public surface narrows enough to justify itself;
- authorization and validation at trust transitions;
- cache ownership, report-once behavior, or stream/job lifecycle;
- whether code admitted to `shared/**` still has identical meaning for every consumer.

Review these against `wiki/ARCHITECTURE/ARCHITECTURE.md` and test them at runtime.

## Project Profile

Keep `runtimePackages` in `architecture-contract.json` synchronized with framework, database,
queue, telemetry, and provider package roots used by the project. An npm package name does not
reveal its architectural role.

Run:

```bash
bun run lint .
bun run architecture:check
```
