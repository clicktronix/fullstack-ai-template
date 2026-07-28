# Capability Migration Evidence

This file preregisters migration metrics and records the same measurements before and after the
capability-first change. It is evidence about this template, not a universal architecture claim.

## Anchors

| Snapshot                   | Git anchor                                 | Graph mode |
| -------------------------- | ------------------------------------------ | ---------- |
| Layer-first baseline       | `0bae9739e5d688f55ebe971658ce4b533a24daf3` | full       |
| Capability-first candidate | `dba9c33e5dcd99f85d6c7fcac065cbaae85e8418` | full       |

Both snapshots were indexed with `codebase-memory-mcp 0.9.0`. The baseline graph contains 2,889
nodes and 6,042 edges. The detached candidate snapshot contains 2,763 nodes and 6,177 edges. Graph
size is diagnostic only; fewer nodes or edges is not a success criterion.

This evidence file is committed after the candidate snapshot. Its commit changes documentation
only; all candidate measurements point to the preceding immutable code-and-documentation tree.

## Definitions

### Change Radius

For “add a field to `WorkItem`”, count distinct non-test source files with a type/import dependency
on `WorkItem` within three graph hops. Count distinct top-level source ownership roots separately.

```bash
codebase-memory-mcp cli query_graph \
  --project <project> \
  --query "MATCH (n)-[:USAGE|IMPORTS*1..3]->(t:Type {name:'WorkItem'})
           WHERE n.is_test = false
           RETURN DISTINCT n.file_path AS file ORDER BY file"
```

An ownership root is the first directory below `src/`. This is a placement metric, not a claim that
every graph-dependent file must be edited for every field change.

### Browser Reads Through Server Actions

Count distinct call-graph edges from query or prefetch files to a Server Action module. Mutations
do not count. This handles multiline imports and calls that line-oriented grep misses.

```bash
codebase-memory-mcp cli query_graph \
  --project <project> \
  --query "MATCH (a)-[:CALLS]->(b)
           RETURN a.file_path AS source, b.file_path AS target,
                  a.name AS caller, b.name AS callee"
```

Filter sources ending in `queries.ts[x]` or `prefetch.ts[x]` and targets under
`server-actions/` or ending in `/actions.ts`.

### Authentication Wiring

Count production files that call `createAuthenticatedContext`. Classify each by channel family;
repeated calls within one cached request are not treated as repeated provider sessions.

```bash
rg -l "createAuthenticatedContext" src --glob '*.ts' --glob '*.tsx' --glob '!*.test.*'
```

### Provider-Type Leakage

Count product/app files that import generated database types. A private capability store is
expected; domain, application, UI, and route composition are leaks.

```bash
rg -l "@/generated/supabase/types" src/modules src/app --glob '*.ts' --glob '*.tsx'
```

### Runtime Direction

Run architecture lint and require one failing mutation for each claimed invariant. A clean lint is
not evidence for authorization, semantic depth, or cache correctness.

## Recorded Results

| Metric                                   |                           Layer-first baseline |                           Capability-first candidate | Interpretation                                                          |
| ---------------------------------------- | ---------------------------------------------: | ---------------------------------------------------: | ----------------------------------------------------------------------- |
| `WorkItem` change radius                 |                  9 files, 4 architecture roots |                           9 files, 2 ownership roots | File count is unchanged; ownership is contained in `app` + `work-items` |
| browser reads through Server Actions     |                        7 calls in 5 read files |                                                    0 | Browser queries now use GET routes                                      |
| direct auth-context callers              | 3 files: action, API, and generic RSC wrappers |         4 files: 2 channel wrappers + 2 RSC surfaces | RSC wiring is more explicit; cached per request, not an automatic win   |
| generated DB type imports in product/app |                          not recorded reliably |              1, private `work-items/server/store.ts` | No row type reaches domain, application, client, UI, or app             |
| client-to-server/private imports         | layer allowlist contained 2 browser transports |                                    0 forbidden edges | Browser transports now live under client-safe ownership                 |
| capability cycles                        |                                not represented | 0 across 4 capabilities and 5 cross-capability edges | The ownership graph is explicit and acyclic                             |

## Qualitative Findings

- Query keys initially duplicated between RSC prefetch and browser query code. The migration added
  runtime-neutral `cache.ts` surfaces so both runtimes use the same key factory.
- Authentication wiring did not become smaller. `safe-action` and API context remain shared
  channel wrappers; `work-items/rsc.ts` and `labels/rsc.ts` resolve cached context explicitly.
- Shared auth proves only provider identity. The identity capability resolves product profile and
  role; each target capability owns its authorization policy.
- Browser Supabase auth belongs to the identity capability. Generic realtime transport belongs to
  `shared/client`; `app/_internal/live-updates` maps provider events to public capability keys.
- Generated Supabase schema types live under `src/generated` and are admitted only to private
  server/client adapters or runtime-specific shared code.
- The product locale catalog belongs to app composition; `shared/ui` owns only locale mechanics.
- Inert Next tag invalidation was removed from work-items and labels. Tags remain only for reads
  that actually opt into the Next server cache; TanStack Query owns browser invalidation.

## Release Gate

The measured candidate is ready for review when:

1. every command above has been rerun against the detached candidate snapshot;
2. deviations are recorded rather than normalized away;
3. tests, production build, Storybook build, dead-code analysis, and architecture checks pass;
4. every Mermaid fence renders, and HTML diagrams pass desktop/mobile browser inspection.
