# Architectural Rationale

## Why This Template Exists

The goal is to start new products on a disciplined baseline without dragging over domain-specific code from an existing app.

This template keeps:

- the stack
- the layer boundaries
- the tooling
- the testing baseline

and replaces project-specific business logic with one neutral vertical slice.

## Why `ui/server-state` Exists

React Query logic is not application logic, but it also should not live inside random components. A dedicated server-state layer keeps:

- query keys
- query hooks
- mutation hooks
- SSR prefetch helpers

out of `use-cases` and out of presentation code.

## Why feature-local `actions.ts` Exist

Sometimes UI needs a direct Server Action call with no query semantics. That does not belong in `ui/server-state`, but it also should not make components import inbound adapters directly. A local `actions.ts` is the narrowest safe escape hatch.

## Why the Demo Slice Uses `work-items`

The example domain needs to be:

- easy to understand
- relevant to B2B apps
- neutral enough to customize

`work-items` and `labels` are enough to demonstrate a full vertical slice without pushing a specific business domain into every new project.
