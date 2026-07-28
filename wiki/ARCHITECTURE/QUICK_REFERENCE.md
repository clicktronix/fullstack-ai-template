# Architecture Quick Reference

## Place the Code

| Question                                        | Location                    |
| ----------------------------------------------- | --------------------------- |
| One route only?                                 | `app/<route>/_internal`     |
| Product concept or behavior?                    | `modules/<capability>`      |
| Pure invariant?                                 | capability `domain/`        |
| Real orchestration/policy?                      | capability `application/`   |
| DB/provider implementation?                     | capability `server/`        |
| Generated provider type?                        | `generated/<provider>`      |
| Browser query/cache/subscription?               | capability `client/`        |
| Reusable capability UI?                         | capability `ui/`            |
| Two capabilities, identical contract, no owner? | admitted `shared/<runtime>` |

## Pick the Channel

| Need                         | Channel                        |
| ---------------------------- | ------------------------------ |
| Initial/server-rendered read | `rsc.ts`                       |
| Browser-owned read lifecycle | GET/stream through `client.ts` |
| UI command                   | `actions.ts`                   |
| External API/webhook         | Route Handler                  |
| Background work              | `job.ts`                       |

Never use Server Actions for browser queries.

## Public Surfaces

```text
server.ts  trusted server composition
rsc.ts     Server Component reads/prefetch
actions.ts UI commands
client.ts  browser-safe lifecycle
ui.ts      reusable capability UI
query-cache.ts shared serializable query-key identity
stream.ts  streaming boundary
job.ts     background boundary
```

Import another capability only through these files.

## Decision Gates

Application operation:

- Would deletion move policy, branching, projection, transaction intent, or orchestration into
  callers?
- If no, keep the direct store path.

Port:

- Is there a technology-independent capability contract in application language?
- Does inversion protect a real current boundary?
- Is there a production consumer?

Shared:

- Two real consumers?
- Same meaning and lifecycle?
- No natural owner?
- Narrow maintained contract?
- Coordination cheaper than copying?

## Runtime Safety

- `server-only` on DB, secrets, cookies, headers, and provider modules.
- Client/UI never imports `server.ts`, `rsc.ts`, or `server/**`.
- Trusted `server.ts` gets explicit identity and effects.
- Generated provider types stay inside private server/client adapters.
- Shared auth establishes provider `userId`; `identity/server.ts` resolves product profile/role.
- The target capability owns its role, tenant, and resource policy.
- Outer boundary validates input, maps results, applies real channel cache effects, and reports once.
- Proxy redirects are not authorization.

## Components

```tsx
export function Component(props: ComponentProps) {
  const viewProps = useComponentProps(props)
  return <ComponentView {...viewProps} />
}
```

Call hooks directly. A View split is optional. Do not pass hooks as values or restore
`composeHooks`.

## Gates

```bash
bun run lint .
bun run architecture:check
bun run typecheck
bun test
bun run build
```
