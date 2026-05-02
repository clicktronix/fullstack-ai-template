# Skills & Plugins

How this template wires Claude Code skills and plugin marketplaces, and how to add your own.

## Two install mechanisms

| Mechanism                 | Source                                 | Where it lives                                               | Declared in                    |
| ------------------------- | -------------------------------------- | ------------------------------------------------------------ | ------------------------------ |
| **Native Claude plugins** | Marketplaces on GitHub                 | `~/.claude/plugins/cache/` (per-user, not committed)         | `.claude/settings.json`        |
| **Vercel `agent-skills`** | `vercel-labs/agent-skills` npm package | `.claude/skills/<name>/` (gitignored, per-user)              | `skills-lock.json` (committed) |
| **Project-pinned skills** | This repo                              | `.agents/skills/<name>/` with symlink into `.claude/skills/` | Source-controlled              |

Committed local skills (`.agents/skills/*`) are used by Codex and symlinked into `.claude/skills/*` for Claude Code. They coexist with marketplace plugins and give the template a pinned baseline even when per-user plugin caches are stale.

## Native plugins: auto-install on trust

`.claude/settings.json` declares both the marketplaces and the plugins to enable:

```json
{
  "extraKnownMarketplaces": {
    "nextjs-clean-skills": {
      "source": { "source": "github", "repo": "clicktronix/nextjs-clean-skills" }
    },
    "supabase-agent-skills": {
      "source": { "source": "github", "repo": "supabase/agent-skills" }
    },
    "tanstack-skills": {
      "source": { "source": "github", "repo": "tanstack-skills/tanstack-skills" }
    },
    "superpowers-marketplace": {
      "source": { "source": "github", "repo": "obra/superpowers-marketplace" }
    }
  },
  "enabledPlugins": {
    "nextjs-clean-skills@nextjs-clean-skills": true,
    "postgres-best-practices@supabase-agent-skills": true,
    "superpowers@superpowers-marketplace": true,
    "tanstack-query@tanstack-skills": true
  }
}
```

`nextjs-architecture` and `react-component-creator` live inside the `nextjs-clean-skills@nextjs-clean-skills` plugin from [`clicktronix/nextjs-clean-skills`](https://github.com/clicktronix/nextjs-clean-skills) — reusable across projects, versioned independently from the template.

This repository also vendors pinned copies in `.agents/skills/nextjs-architecture` and `.agents/skills/react-component-creator`, with `.claude/skills/*` symlinks for Claude Code. Compatibility aliases `.agents/skills/architector` and `.agents/skills/component-creator` point old prompts to the new skill names.

When a teammate clones the repo and trusts the folder, Claude Code **prompts them** to install declared marketplaces and plugins. This is the canonical Anthropic flow — no setup script required for the happy path.

## CLI fallback: `bun run setup:skills`

For headless setups, CI, or users who skip the trust prompt, the script registers marketplaces and installs plugins explicitly:

```bash
bun run setup:skills       # install everything (idempotent)
bun run skills:doctor      # verify installed state without modifying anything
```

The script also installs Vercel `agent-skills` via `npx skills add`, which is not a native Claude plugin and must be fetched separately.

## Adding a new plugin

1. Find the marketplace GitHub repo (e.g. `acme/agent-skills`).
2. Add the marketplace to `.claude/settings.json`:

   ```json
   "extraKnownMarketplaces": {
     "acme-tools": {
       "source": { "source": "github", "repo": "acme/agent-skills" }
     }
   }
   ```

3. Enable the plugin in the same file:

   ```json
   "enabledPlugins": {
     "linter@acme-tools": true
   }
   ```

4. Update `scripts/setup-skills.ts` → `MARKETPLACE_PLUGINS` to match (so the CLI fallback covers it too).
5. Commit `.claude/settings.json` and `scripts/setup-skills.ts`.
6. Next session, Claude prompts to install. Or run `bun run setup:skills`.

## Adding a new Vercel agent-skill

1. Append the skill name to `VERCEL_SKILLS` in `scripts/setup-skills.ts`.
2. Add the output directory to `.gitignore` (pattern: `.claude/skills/<name>/`).
3. Run `bun run setup:skills`. Commit the resulting `skills-lock.json` update.

## Adding a project-pinned skill

1. Create `.agents/skills/<skill-name>/SKILL.md` with frontmatter + instructions.
2. Symlink into `.claude/skills/`: `ln -s ../../.agents/skills/<skill-name> .claude/skills/<skill-name>`.
3. Commit both (the symlink works on macOS/Linux; on Windows use the plugin path instead).

See `.claude/agents/code-reviewer.md` for a bespoke agent example.

## Updating upstream

```bash
claude plugin update              # native marketplace plugins
npx skills update --project       # Vercel skills (regenerates skills-lock.json)
```

Commit `skills-lock.json` changes.

## Where things go on disk

| Path                        | Committed?   | Purpose                                                            |
| --------------------------- | ------------ | ------------------------------------------------------------------ |
| `.claude/settings.json`     | ✅           | Marketplaces, enabled plugins, hooks, MCP approval list            |
| `.claude/rules/*.md`        | ✅           | Path-scoped rules auto-loaded by Claude                            |
| `.claude/agents/*.md`       | ✅           | Bespoke subagents (e.g. code-reviewer)                             |
| `.agents/skills/<name>/`    | ✅           | Project-pinned Codex skills                                        |
| `.claude/skills/<project>/` | ✅ (symlink) | Claude Code view of project-pinned skills                          |
| `.claude/skills/<vercel>/`  | ❌           | Installed by `npx skills add`; regenerated from `skills-lock.json` |
| `.claude/projects/`         | ❌           | Claude Code session memory (gitignored)                            |
| `~/.claude/plugins/cache/`  | n/a          | Per-user native plugin cache outside the repo                      |
| `skills-lock.json`          | ✅           | Vercel skill version pins                                          |

## References

- [Discover and install plugins](https://code.claude.com/docs/en/discover-plugins)
- [Create plugins](https://code.claude.com/docs/en/plugins)
- [Claude Code settings](https://code.claude.com/docs/en/settings)
