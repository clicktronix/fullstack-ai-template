---
paths: ['src/modules/**/client/**/*', 'src/modules/**/rsc.ts', 'src/shared/ui/providers/**/*']
---

# Data and State

| State                    | Owner                                    |
| ------------------------ | ---------------------------------------- |
| Server data lifecycle    | capability `client/` with TanStack Query |
| Server-rendered prefetch | capability `rsc.ts`                      |
| Form state               | component-local Mantine form             |
| Local UI state           | owning component or route-private hook   |
| App-wide UI context      | admitted `shared/ui/provider`            |
| Capability context       | capability `ui/`                         |

Browser query functions use GET or streaming endpoints and validate response envelopes. Server
Actions are mutation transport only.

Keep query keys in the owning capability's runtime-neutral `query-cache.ts` only when RSC prefetch
and browser hooks share the same key shape. Keep Next cache tags and invalidation private under
`server/**`. Invalidate each populated cache after successful commands and update query caches when
an immediate local result is available.

Do not add a global store for server data or a page-local interaction. Promote state only after two
real consumers share the same lifecycle.
