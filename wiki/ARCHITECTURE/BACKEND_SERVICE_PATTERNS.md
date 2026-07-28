# Server Patterns

## Trusted Capability Service

`server.ts` is the in-process service boundary:

```ts
export function createWorkItem(
  identity: WorkItemsIdentity,
  effects: WorkItemsEffects,
  input: CreateWorkItem
): Promise<WorkItem>
```

It enforces capability policy, calls private stores/application behavior, and remains silent.

## Route Handler

A Route Handler owns HTTP:

1. decode path/query/body;
2. establish provider `userId`;
3. resolve product identity through the `identity` capability;
4. call the target capability server surface;
5. map result/failure to status and envelope;
6. report one unexpected incident.

GET is browser read transport. POST/PATCH/DELETE commands should support idempotency where retries
or external callers make duplicates possible.

## Server Action

An action file begins with top-level `'use server'`. Its value exports are locally declared async
functions, not re-exports. Actions are UI commands:

1. parse input;
2. establish provider `userId`;
3. resolve product identity and effects;
4. call `server.ts`;
5. invalidate assigned server-cache tags after success, if this capability has any;
6. return a serializable result for client-side cache update/invalidation.

Do not export read actions.

## RSC Surface

`rsc.ts` creates request context, calls `server.ts`, and optionally prefetches into a QueryClient.
It does not call the application's own Route Handler.

Shared auth never loads product roles. Product profile/role belongs to `identity/server.ts`; the
target capability owns its authorization decision.

## Authoritative External Backend

When Next.js is a BFF for a Go, Python, NestJS, or other authoritative service, keep business
invariants and orchestration in that service. The local capability owns transport mapping,
presentation contracts, aggregation, cache, browser lifecycle, and genuinely frontend/BFF policy.
Do not mirror the remote domain or create forwarding application operations to fill optional
folders.

## Provider Store

Private stores:

- live under capability `server/`;
- select explicit columns;
- validate provider rows;
- map provider errors;
- return domain/capability values;
- never report telemetry.

## Jobs and Streams

Jobs use `job.ts` and reconstruct identity/effects from durable input. Streams use `stream.ts`;
before response commit they can choose status, after commit failures must be in-band events.

## Security

- Proxy is not authorization.
- Capability policy is rechecked in `server.ts`.
- Service-role clients stay under `shared/server` or a capability server adapter.
- User-scoped and service-role clients use different factories and context types.
- Secrets never use `NEXT_PUBLIC_`.
- Logs and Sentry events pass through redaction.
