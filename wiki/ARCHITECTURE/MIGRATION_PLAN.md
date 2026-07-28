# Migration Guide

This repository has migrated from layer-first folders to capability-first modules.

For downstream projects:

1. Inventory product capabilities and current cross-layer slices.
2. Move pure schemas/invariants to `modules/<capability>/domain`.
3. Move stores/providers to the owning capability's private `server/`.
4. Add a narrow `server.ts` with explicit identity/effects.
5. Route RSC reads through `rsc.ts`.
6. Route browser reads through GET/stream and `client.ts`.
7. Keep mutation-only Server Actions in `actions.ts`.
8. Move TanStack Query keys/hooks to capability `client/`.
9. Keep route-private UI in `app/**/_internal`; expose reusable capability UI via `ui.ts`.
10. Create `application/**` only for behavior that passes the deletion test.
11. Move shared code only after applying the admission gate.
12. Enable architecture ESLint and cycle checks.
13. Remove legacy roots after imports and tests are green.

Migrate one capability at a time and record before/after change radius, forwarding wrappers,
runtime violations, and user-visible regressions. Do not maintain both topologies indefinitely.
