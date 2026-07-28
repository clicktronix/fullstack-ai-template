# Application Operations

`application/**` is optional. It exists for behavior that is deeper than a runtime boundary or
store call.

## Deletion Test

Delete the proposed operation mentally. Keep it only if meaningful complexity moves into callers:

- policy or branching;
- projection across sources;
- transaction intent;
- behavior shared by channels;
- orchestration across capabilities/providers.

Validation, row mapping, cache invalidation, telemetry, and direct CRUD do not independently pass
the test.

## Simple CRUD

```text
Action / Route / RSC
  -> capability server.ts
    -> private store
```

`work-items` and `labels` use this shape.

## Real Application Behavior

```text
outer channel
  -> capability server.ts
    -> application operation
      -> capability-language ports
        -> private adapters
```

`assistant-suggestions` combines work-item and label summaries, applies suggestion workflow policy,
and calls a provider. Deleting the operation would move orchestration into the action or adapter,
so it earns `application/**`.

## Operation Contract

- framework-neutral;
- explicit input and narrow dependencies;
- no Sentry reporting;
- no direct provider/database import;
- no dependency on another capability's internals;
- typed result or meaningful typed/coded failure.

## Ports

A port belongs beside the operation that needs it. Name the needed capability, not the provider:

```ts
type SuggestionSources = {
  listWorkItems: () => Promise<WorkItemSummary[]>
  listLabels: () => Promise<LabelSummary[]>
}
```

Do not create `WorkItemsRepository` merely to mirror table CRUD. The orchestrator's private server
adapter calls `work-items/server.ts` and maps the public result into its own summary type.

## Testing

Application tests pass explicit fake ports and assert policy/orchestration. They do not load Next,
React, Supabase, Sentry, or network clients.
