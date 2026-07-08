# Data Access

## Outbound Adapters

All persistence and external I/O belongs in `src/adapters/outbound/`.

Typical structure:

```text
src/adapters/outbound/
├── supabase/
│   ├── work-items.operations.ts
│   ├── work-items.repository.ts
│   ├── labels.operations.ts
│   └── labels.repository.ts
├── api/
└── transport/
```

## Pattern

- `*.operations.ts` -> low-level queries, RPC calls, row mapping
- `*.repository.ts` -> factories that satisfy use-case ports

Example:

```ts
export function createSupabaseWorkItemRepository(
  supabase: SupabaseServerClient
): WorkItemRepository {
  return {
    list: (filters) => listWorkItemsOperation(supabase, filters),
    create: (input) => createWorkItemOperation(supabase, input),
  }
}
```

## Boundary Validation

Validate data at the domain boundary where it matters:

- parse DB rows or RPC payloads into domain types
- do not leak raw database shapes into UI

## DAL and Authorization

Every server-side path that reads user-scoped data must verify auth/authz in server-only code. `src/proxy.ts` can refresh sessions and redirect obvious anonymous requests, but it is not the authorization boundary.

Use these rules:

- modules that read cookies, headers, Supabase server clients, service-role keys, or secrets start with `import 'server-only'`
- layouts and Server Components use `verifySession()` from `src/infrastructure/auth/verify-session.ts`
- Server Actions and Route Handlers use `createAuthenticatedContext()` or `authActionClient` / `adminActionClient`
- DTOs returned to UI are parsed through domain schemas; raw DB rows stay inside outbound adapters

`verifySession()` is wrapped in React `cache()`, so repeated checks during the same server render are deduplicated.

## Inbound Wiring

Server Actions compose dependencies through safe-action clients:

```ts
const safeListWorkItemsAction = adminActionClient
  .inputSchema(WorkItemFiltersSchema)
  .action(async ({ ctx, parsedInput }) => {
    const workItems = createSupabaseWorkItemRepository(ctx.supabase)
    return listWorkItems({ workItems }, parsedInput)
  })

export async function listWorkItemsAction(filters: WorkItemFilters) {
  return unwrapSafeActionResult(await safeListWorkItemsAction(filters))
}
```

Use `createAuthenticatedContext()` or the `authActionClient` / `adminActionClient` middleware inside every server-side data path that depends on the current user. `src/proxy.ts` is only a request-time redirect/session-refresh layer, not the final authorization boundary.

Route Handlers are the service API boundary for external HTTP clients. Use
`createApiHandlerContext()` to attach the authenticated context and request id, then return
stable JSON envelopes from `src/infrastructure/api/response.ts`. POST/PUT/PATCH commands that
can be retried by clients should require `Idempotency-Key` and use
`runIdempotentCommand()`.

Webhook Route Handlers do not use browser session auth. Verify the provider signature over
the raw request body before parsing or executing side effects.

For Supabase SSR auth, use `auth.getUser()` or DAL helpers built on it for server-side authorization. Do not trust `auth.getSession()` by itself on the server; it can read unverified cookie state and is only acceptable after a `getUser()` verification or in browser-only refresh flows.

Read env through `src/infrastructure/env/public.ts`, `client.ts`, `server.ts`, or `runtime.ts`. Runtime modules must not read `process.env` directly; this keeps service-role and backend-only values out of accidental public paths.

`src/proxy.ts` is the active Next.js Proxy file because this project uses `src/app`. It sets security headers for every matched request. CSP intentionally keeps `script-src 'unsafe-inline'` and `style-src 'unsafe-inline'` while Cache Components/PPR are enabled: Next.js nonces require fully dynamic rendering, but PPR shells contain build-time scripts/styles that cannot receive a request-time nonce. If a route is moved out of PPR and made fully dynamic, nonce CSP can be enabled for that route and verified in HTML.

## Error Handling

`src/adapters/supabase/throw-supabase-error.ts` (`throwIfError()`) is the single conversion point
for every Supabase/PostgREST failure in the outbound layer: it throws a typed `ApiError` subclass
(`NotFoundError` for `PGRST116`, `ClientError`/409 for a unique-violation, `ServerError`/500
otherwise) instead of a generic `Error`. `src/adapters/outbound/api/assistant-suggestions.ts` does
the same for non-ok `fetch` responses. Outbound adapters never call Sentry themselves — they only
convert the failure to a typed error; the boundary that first catches it (below) captures once.

Each error origin is captured at exactly one boundary — see
[`QUICK_REFERENCE.md`](./QUICK_REFERENCE.md#error-handling) for the compact map and
[`diagrams/security.html`](./diagrams/security.html) for the full error-capture diagram. In short:

- Server Action business logic is captured in `infrastructure/actions/safe-action.ts`'s
  `handleServerError` (unexpected/`HTTP_ERROR`-mapped failures only).
- Route Handlers are captured once by `withRouteErrorHandling`
  (`src/infrastructure/api/with-route-error-handling.ts`).
- TanStack Query/Mutation failures (client fetch or SSR `prefetchQuery`) are captured once by the
  `QueryCache.onError` hook in `src/ui/providers/query-client.ts`.
- `withServerReadErrorHandling` (`src/infrastructure/errors/with-server-read-error-handling.ts`) is
  the pattern to use when a Server Component reads a use-case/repository directly without going
  through TanStack Query. It has no live call site today — every current RSC read goes through
  `prefetchQuery`, which is already covered by `QueryCache.onError`.

All three Sentry entry points (`sentry.server.config.ts`, `sentry.edge.config.ts`,
`src/instrumentation-client.ts`) set `beforeSend: redactSentryEvent`, so captured events are
redacted before they leave the process/browser regardless of which boundary captured them.

## Cache Invalidation

Server and client invalidation target different caches:

- Server Actions update the RSC/Data Cache with `updateTag()` for same-request read-your-writes and `revalidateTag(tag, profile)` for stale-while-revalidate refresh.
- Route Handlers can invalidate tag/path caches after service API or webhook mutations with `revalidateTag(tag, profile)` / `revalidatePath(path)`.
- `updateTag()` and `refresh()` are Server Action-only. Do not call them from Route Handlers.
- Client TanStack mutations update the browser query cache with `queryClient.invalidateQueries()` or optimistic writes.

Do not add ad-hoc `revalidatePath()` beside tag invalidation in this template unless the route tree itself is the intentional invalidation unit. Prefer tags from `src/infrastructure/cache/tags.ts`.

In Server Actions, invalidate by tag:

```ts
updateTag(cacheTags.workItems.lists(ctx.userId))
revalidateTag(cacheTags.workItems.all, 'minutes')
```

In Route Handlers, use `revalidateTag()` only:

```ts
revalidateTag(cacheTags.workItems.lists(ctx.userId), 'minutes')
revalidateTag(cacheTags.workItems.all, 'minutes')
```
