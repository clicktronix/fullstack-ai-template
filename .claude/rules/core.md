---
paths:
  ['src/**/*', 'next.config.ts', 'eslint.config.mjs', 'rules/**/*', 'scripts/**/*', 'tests/**/*']
---

# Core Rules

- Use `type`, not `interface`, except required module augmentation.
- Prefer functions and plain objects. Error subclasses are the idiomatic exception.
- Do not add `any`, `import * as v`, `export *`, or direct runtime `process.env` reads.
- Read environment through `shared/client/env` or `shared/server/env`.
- Mark secret, cookie, database, and provider modules with `server-only`.
- Keep user-facing text in `messages.json`.
- Use Mantine props/CSS Modules; do not add inline style objects or hardcoded palette values.
- Call named hooks directly; there is no hook-composition helper.
- Keep route-private code under its route's `_internal` directory.
- Run current-worktree gates before claiming success.

Required architecture commands:

```bash
bun run lint .
bun run architecture:check
bun run typecheck
```
