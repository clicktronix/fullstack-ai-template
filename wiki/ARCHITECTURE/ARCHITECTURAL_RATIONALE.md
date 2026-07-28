# Architectural Rationale

## Why Capability-First

Layer-first placement made every product change touch parallel top-level trees and did not prevent
same-layer coupling between capabilities. Capability-first makes ownership physical: work-items,
labels, identity, and assistant behavior each have a visible boundary.

The trade-off is explicit. Optional segments reduce scaffolding, but placement requires judgement.
Reserved segment names and executable import rules preserve a minimum dependency direction when a
segment exists.

## Why Runtime Root Surfaces

Next.js has materially different channels: RSC, actions, HTTP, streams, and jobs. A universal
boundary hides their cache, serialization, and failure semantics. Narrow root surfaces keep a
stable capability API while allowing each channel to adapt honestly.

## Why `server.ts` Is Silent

Cross-capability workflows need trusted in-process composition. If every inner capability reports,
one incident is captured repeatedly. `server.ts` enforces capability policy but propagates
failures; the outer channel reports once.

## Why Simple CRUD Skips Application

The previous model produced forwarding operations and mirrored repository ports. The deletion test
keeps only application behavior that concentrates policy, branching, projection, transaction
intent, or orchestration.

## Why Local Stores Need No Port

A port is an application-language contract, not a test seam for every table. A capability-private
Supabase store can change internally without changing callers. Add a port when application behavior
must name a volatile capability independent of the provider.

## Why Browser Reads Use GET

Server Actions are serialized command transport. Browser reads need cacheable, observable GET or
stream semantics. Server-rendered reads bypass HTTP and call `rsc.ts` directly.

## Why Shared Is Gated

Capability-first systems often fail by growing a new `shared` monolith. Admission requires real
consumers, identical semantics, no natural owner, and a positive coordination trade-off. Demotion
is part of the lifecycle.

## Why Hooks Are Direct

Passing hooks through a generic composer violates React's current guidance, hides the hook call
from static analysis, and added unused generic complexity. Direct named calls preserve local
reasoning and keep View separation optional.

## What Tooling Proves

ESLint and the cycle checker prove import shape, runtime direction, and acyclicity. They do not
prove semantic depth, correct authorization, cache behavior, transaction boundaries, shared
admission, or report-once behavior. Those require tests and review.
