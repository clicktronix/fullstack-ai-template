# CLAUDE.md Writer - Detailed Reference

Extended documentation for the claude-md-writer skill.

## 3-Tier Documentation System

Official recommendation for large projects:

| Tier              | Location                     | Loads                     | Target      |
| ----------------- | ---------------------------- | ------------------------- | ----------- |
| **1. Foundation** | `CLAUDE.md`                  | Always                    | < 200 lines |
| **2. Component**  | `.claude/rules/{component}/` | When working in component | < 500 lines |
| **3. Feature**    | Co-located with code         | When working on feature   | As needed   |

### Example Structure

```
.claude/
├── CLAUDE.md                 # Tier 1: always loaded
└── rules/
    ├── database.md           # Tier 2: SQL, migrations
    ├── api.md                # Tier 2: API patterns
    └── frontend/             # Tier 2: subdirectory
        ├── components.md     # paths: src/**/*.tsx
        ├── layout.md         # paths: src/pages/**/*.tsx
        └── tokens.md         # paths: **/*.tsx
```

## Common Mistakes

| Mistake                 | Fix                                        |
| ----------------------- | ------------------------------------------ |
| 500+ lines              | Split into `.claude/rules/`                |
| SQL examples inline     | -> `rules/database.md`                     |
| "Run prettier" rules    | Use tool config files                      |
| Full API docs           | -> `rules/api.md`                          |
| Deployment instructions | -> `rules/deploy.md`                       |
| Code in CLAUDE.md       | Use `@file:line` references                |
| Negative rules only     | Add alternatives: "Don't X; use Y instead" |

## CLAUDE.local.md

Personal project settings (auto-gitignored):

```markdown
# My Local Settings

- Prefer verbose output
- Run tests after every change
- My worktree location: .trees/
```

## Useful Commands

| Command   | Purpose                    |
| --------- | -------------------------- |
| `/init`   | Generate initial CLAUDE.md |
| `/memory` | View loaded memory files   |

## Sources

**Official:**

- [Memory management](https://code.claude.com/docs/en/memory)
- [Best practices](https://anthropic.com/engineering/claude-code-best-practices)
- [Using CLAUDE.md files](https://claude.com/blog/using-claude-md-files)

**Community:**

- [Claude Code Development Kit](https://thedocumentation.org/claude-code-development-kit) (3-Tier System)
- [Rules directory guide](https://claudefa.st/blog/guide/mechanics/rules-directory)
- [Writing a good CLAUDE.md](https://humanlayer.dev/blog/writing-a-good-claude-md)
