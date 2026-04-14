---
name: e2e-testing
description: Use when testing the full product stack in the template repo: auth, protected routes, baseline CRUD flows, SSR wiring, and browser-based E2E behavior.
---

# E2E Testing Skill

Use this skill for browser E2E work in the template repository.

## Scope

The starter kit ships with a **baseline E2E suite**, not product-specific scenarios.

Current baseline covers:

- login route behavior
- protected admin route access control
- authenticated redirect to `/admin/work-items`

Project-specific suites should be added only after the template is customized.

## Default Commands

```bash
bun run test:e2e
```

If auth credentials are not configured:

- access-control tests still run
- login-success tests are skipped intentionally

## Current E2E Structure

```text
e2e/
├── auth/
│   ├── access-control.spec.ts
│   ├── login.spec.ts
│   └── login-errors.spec.ts
├── global-setup.ts
├── global-teardown.ts
└── helpers/
    └── auth.ts
```

## Rules

- Keep the baseline suite small and deterministic
- Prefer `data-testid` selectors over text selectors
- Do not add product-domain seeds to the template unless they belong to the demo slice
- If a test needs service credentials, guard it with a clear skip condition
- Add new E2E coverage only for real template features, such as `work-items` or `labels`

## When Expanding the Suite

For a new feature:

1. add stable `data-testid`
2. add a minimal happy-path spec
3. add one access-control or auth-sensitive case if relevant
4. keep teardown explicit and safe

## References

- `e2e/playwright.config.ts`
- `docs/TEMPLATE_GUIDE/FIRST_FEATURE.md`
