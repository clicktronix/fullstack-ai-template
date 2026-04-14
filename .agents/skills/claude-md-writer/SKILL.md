---
name: Codex-md-writer
description: Use when creating or refactoring AGENTS.md files. Enforces Anthropic best practices for size (<200 lines), modular structure (.Codex/rules/), and conditional loading with paths frontmatter.
---

# AGENTS.md Writer

Creates and refactors AGENTS.md files following official Anthropic best practices (2025).

## Golden Rules

| Rule                                 | Why                                  |
| ------------------------------------ | ------------------------------------ |
| **AGENTS.md < 200 lines**            | Loads on EVERY request, costs tokens |
| **Rules files < 500 lines**          | Official recommendation per file     |
| **Critical rules FIRST**             | Top = highest priority               |
| **Modular rules -> `.Codex/rules/`** | Conditional loading, organized       |
| **Use `paths:` frontmatter**         | Load rules only for matching files   |
| **No linting rules**                 | Use ESLint/Prettier/Biome instead    |
| **Pointers over copies**             | Files change, references stay valid  |

## Memory Hierarchy

| Priority | Type       | Location                                       |
| -------- | ---------- | ---------------------------------------------- |
| Highest  | Enterprise | `/Library/Application Support/Codex/AGENTS.md` |
| High     | Project    | `./AGENTS.md` or `./.Codex/AGENTS.md`          |
| Medium   | Rules      | `./.Codex/rules/*.md` (conditional)            |
| Low      | User       | `~/.Codex/AGENTS.md`                           |
| Lowest   | Local      | `./Codex.local.md` (gitignored)                |

## Structure Template

```markdown
# Project Name

One-line description.

## Commands

| Command         | Purpose     |
| --------------- | ----------- |
| `npm run dev`   | Development |
| `npm run build` | Production  |

## Architecture

| Path       | Purpose    |
| ---------- | ---------- |
| `lib/`     | Core logic |
| `app/api/` | API routes |

## Key Patterns

**Pattern Name**: One-line explanation.

## Modular Docs

See `.Codex/rules/` for detailed guidance.
```

## Conditional Rules (Path-Specific)

```yaml
---
paths: 'src/api/**/*.ts'
---
# API Rules

- All endpoints must validate input
- Use standard error format
```

### Glob Patterns

| Pattern             | Matches                |
| ------------------- | ---------------------- |
| `**/*.ts`           | All .ts files anywhere |
| `src/**/*`          | All files under src/   |
| `src/**/*.{ts,tsx}` | Multiple extensions    |

## Workflow: New Project

1. Run `/init` for base AGENTS.md
2. Review and trim generated content
3. Identify critical rules
4. Create `.Codex/rules/` for domain-specific docs
5. Keep main file < 100 lines

## Workflow: Refactor Existing

1. **Count lines** - if > 300, must split
2. **Find task-specific content** - SQL, debugging, deploy -> extract
3. **Create `.Codex/rules/`** for domain docs
4. **Use `@file` references** - don't duplicate
5. **Keep in AGENTS.md** - only what applies to EVERY task

## What Goes Where

| Content               | Location                   |
| --------------------- | -------------------------- |
| Project description   | AGENTS.md                  |
| Critical constraints  | AGENTS.md (top!)           |
| Quick start commands  | AGENTS.md                  |
| Architecture overview | AGENTS.md                  |
| SQL queries/schema    | `.Codex/rules/database.md` |
| Deployment steps      | `.Codex/rules/deploy.md`   |
| API documentation     | `.Codex/rules/api.md`      |
| Personal preferences  | `Codex.local.md`           |
| Code style rules      | Tool configs (NOT docs)    |

## Import Syntax

```markdown
@README.md
@docs/architecture.md
@~/.Codex/snippets/common.md
```

Max depth: 5 hops. Keep references one level deep.

## Quality Checklist

- [ ] AGENTS.md < 200 lines?
- [ ] Each rules file < 500 lines?
- [ ] Critical rules at top?
- [ ] No task-specific content in main file?
- [ ] `.Codex/rules/` for domain-specific docs?
- [ ] `paths:` frontmatter for conditional loading?
- [ ] `@` references instead of duplication?

For detailed reference, see [reference.md](reference.md) in this skill folder.
