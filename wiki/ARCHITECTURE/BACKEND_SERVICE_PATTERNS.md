# Backend Service Patterns

This template is a Next.js full-stack application, not a separate backend framework. Backend
boundaries still matter. Use the smallest boundary that matches the caller.

## Boundary Decision

| Caller / workload                       | Boundary                                    | Example                         |
| --------------------------------------- | ------------------------------------------- | ------------------------------- |
| UI form or button command               | Server Action                               | login, signup, profile update   |
| Read-heavy UI page                      | Server Component + server-only DAL/read API | dashboard listing               |
| Browser client cache with realtime/poll | `ui/server-state` -> Server Action/API      | interactive work item grid      |
| External HTTP client, SDK, mobile app   | Route Handler                               | `GET/POST /api/work-items`      |
| Third-party callback                    | Webhook Route Handler                       | `/api/webhooks/example`         |
| Work that can exceed request timeouts   | Durable queue/workflow provider             | AI analysis, scrape, enrichment |
| Cross-row or multi-table consistency    | Database RPC/function                       | create entity + audit event     |

`src/proxy.ts` is request middleware. It can refresh sessions, redirect, set locale cookies,
and apply headers. It is not the authorization boundary.

## Service API Route Handlers

Route Handlers are the service API boundary. They should:

- create an API context with `createApiHandlerContext(request, { allowedRoles })`
- return a stable JSON envelope: `{ data, requestId }` or `{ error, requestId }`
- set `x-request-id` on every response
- map validation/auth/conflict failures to public error codes
- delegate business work to use-cases through ports and outbound adapters

The canonical example is `src/app/api/work-items/route.ts`.

## Idempotent Commands

External clients retry. POST handlers must tolerate retry safely when duplicate execution would
create duplicate data or side effects.

Use `Idempotency-Key` for service commands:

```http
POST /api/work-items
Idempotency-Key: create-work-item-20260502-1
```

The template stores the request hash and successful response in `public.idempotency_keys`.
If the same key is retried with the same body, the cached response is returned. If the body
differs, the route returns a conflict.

Do not use an in-memory map for this. Serverless scale-out requires durable storage.

## Webhooks

Webhook routes use a different trust boundary from user-facing API routes:

- do not use browser session auth
- read the raw request body
- verify provider signature before parsing or acting
- make side effects idempotent
- log with request id, but do not log raw secrets or full payloads by default

The canonical example is `src/app/api/webhooks/example/route.ts`.

## Durable Jobs

Do not run long AI analysis, scraping, enrichment, or bulk processing inside a Server Action or
Route Handler request. Use a queue/workflow provider when work can exceed function timeouts,
needs retries, or must survive deploys.

Keep provider choice behind a port such as:

```ts
export type TaskQueuePort = {
  enqueue: (task: { type: string; payload: unknown; idempotencyKey: string }) => Promise<string>
}
```

Good provider-specific adapters include Vercel Queues/Workflow, Inngest, Trigger.dev, or a
Postgres-backed queue. Pick one per product; the template intentionally does not ship a fake
runtime queue.

## Distributed Rate Limits

Rate limits must be shared across instances. Use a provider-backed limiter such as Vercel
Firewall/Bot protection, Upstash Redis, or another durable store. Do not add an in-memory
limiter to a serverless template and call it production-safe.

## Transactions

Supabase client code does not provide a general application-level transaction wrapper. For
multi-write consistency, prefer a Postgres function/RPC that performs the full operation in
one database transaction, then call that RPC from an outbound adapter implementing a use-case
port.

Use audit/event tables as append-only backend records when the product needs traceability.
