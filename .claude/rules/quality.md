---
paths: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}']
---

# Test Rules

- Domain tests cover schema and invariant behavior.
- Application tests use explicit fake ports and no framework runtime.
- Server adapter tests cover mapping and provider failures.
- Route/Action tests cover decoding, auth policy, status/result mapping, idempotency, cache, and
  report-once behavior.
- Client tests mock the capability public transport, not private stores.
- Component tests use `tests/utils/render.tsx` for Query/Intl providers.
- E2E uses `e2e/playwright.config.ts`.
- Architecture claims need a mutation that fails when the invariant is removed.

Run the focused test while editing, then `bun test` for shared behavior changes.
