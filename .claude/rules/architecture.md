---
paths: ['src/app/**/*', 'src/modules/**/*', 'src/shared/**/*', 'rules/**/*']
---

# Capability Architecture

## Physical Model

```text
app/**                  Next.js routes and route-private composition
generated/**            mechanical provider contracts for adapters only
modules/<capability>/** product ownership
shared/{kernel,server,client,ui}/** admitted cross-capability code
```

Within a capability, create only needed `domain`, `application`, `server`, `client`, or `ui`
segments. Import another capability through its root `server.ts`, `rsc.ts`, `actions.ts`,
`client.ts`, `ui.ts`, `query-cache.ts`, `stream.ts`, or `job.ts` surface.

## Direction

- `domain`: own domain plus `shared/kernel`.
- `application`: own domain/application plus `shared/kernel`; effects are explicit ports.
- `server`: private stores/providers; may implement application ports.
- `client`: browser reads/cache/subscriptions; never imports server code.
- `ui`: own client/domain and exact actions; never imports server code.
- `shared`: never imports a product capability.
- `generated`: may be imported only by private capability server/client adapters and shared
  server/client runtime code.

## Runtime Channels

```text
RSC read      -> rsc.ts     -> server.ts -> private adapter
Browser read  -> GET/stream -> server.ts -> private adapter
UI command    -> actions.ts -> server.ts -> private adapter
External HTTP -> route      -> server.ts -> private adapter
```

Server Actions are commands, not browser query transport. The trusted `server.ts` surface accepts
explicit identity and effects, enforces capability policy, and does not report failures. The outer
channel owns validation, result/status mapping, relevant cache effects, and one unexpected-error
report.
Shared auth establishes provider `userId` only; product profile/role belongs to the `identity`
capability, and target capabilities enforce their own policy.

## Depth

Create an application operation only when deleting it moves policy, branching, orchestration,
projection, or transaction intent into callers. Simple store CRUD needs no operation or repository
port. Ports use application language and protect real volatility or ownership.

Cross-capability policy belongs to an orchestrating capability. Source capabilities expose narrow
server surfaces and do not import the orchestrator.

## Shared Admission

Require two real consumers, identical meaning/lifecycle, no natural capability owner, a narrow
contract, and a lower coordination cost than duplication. `shared/kernel` also requires identical
invariants and change cadence.

## Verification

`bun run lint .` enforces ownership and runtime direction.
`bun run architecture:check` rejects capability cycles.
Review and tests must still prove auth, reporting, cache, transaction, and semantic depth.
