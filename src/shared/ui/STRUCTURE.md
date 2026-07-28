# Shared UI

`src/shared/ui` contains presentation code that has multiple real consumers with identical
meaning. Capability-specific UI stays in `src/modules/<capability>/ui`; route-private UI stays in
`src/app/**/_internal`.

```text
src/shared/ui/
├── components/       # Cross-capability visual primitives
├── errors/           # Presentation error mapping
├── formatters/       # Pure display formatting
├── hooks/            # Generic UI hooks
├── i18n/             # Locale primitives and messages
├── providers/        # App-wide React providers
├── query/            # Generic TanStack Query timing policy only
└── themes/           # Mantine tokens and theme configuration
```

## Admission Gate

Move code here only when:

1. at least two capabilities use it;
2. the meaning and change cadence are the same;
3. the runtime is UI/browser-safe;
4. publishing the contract is cheaper than keeping local copies.

Assign an owner and move code back when those conditions stop holding.

## Component Rules

- Call named hooks directly in client components.
- Do not pass hooks as values or restore a generic hook composer.
- Split a pure view only for reuse, isolated testing, or server rendering.
- Keep TanStack Query hooks and keys with their owning capability, not in this directory.
