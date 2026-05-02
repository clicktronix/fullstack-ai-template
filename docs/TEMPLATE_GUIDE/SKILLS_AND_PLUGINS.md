# Skills & Plugins

How this template wires Claude Code skills and plugin marketplaces, and how to add your own.

## Install mechanisms

| Mechanism                 | Source                                 | Where it lives                                       | Declared in                        |
| ------------------------- | -------------------------------------- | ---------------------------------------------------- | ---------------------------------- |
| **Native Claude plugins** | Marketplaces on GitHub                 | `~/.claude/plugins/cache/` (per-user, not committed) | `.claude/settings.json`            |
| **Codex plugins**         | Repo-local marketplace                 | Codex plugin cache / runtime                         | `.agents/plugins/marketplace.json` |
| **Vercel `agent-skills`** | `vercel-labs/agent-skills` npm package | `.claude/skills/<name>/` (gitignored, per-user)      | `skills-lock.json` (committed)     |
| **Project-only skills**   | This repo                              | `.agents/skills/<name>/`                             | Source-controlled                  |

Reusable skills belong in plugins. Do not copy plugin-owned `skills/` folders into `.agents/skills/`; that creates a fork that drifts from the plugin release.

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

Claude Code installs that plugin from the GitHub marketplace declared in `.claude/settings.json`. Codex consumes the same plugin through `.agents/plugins/marketplace.json`, backed by the `plugins/nextjs-clean-skills` git submodule. Update the plugin repository first, then update the submodule pointer; do not vendor-copy its skill files.

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

4. For Codex, add the plugin to `.agents/plugins/marketplace.json`. If Codex needs a local plugin source, add it as a git submodule under `plugins/`.
5. Update `scripts/setup-skills.ts` → `MARKETPLACE_PLUGINS` to match (so the CLI fallback covers it too).
6. Commit the settings, marketplace manifest, and any submodule pointer.
7. Next session, Claude prompts to install. Or run `bun run setup:skills`.

## Adding a new Vercel agent-skill

1. Append the skill name to `VERCEL_SKILLS` in `scripts/setup-skills.ts`.
2. Add the output directory to `.gitignore` (pattern: `.claude/skills/<name>/`).
3. Run `bun run setup:skills`. Commit the resulting `skills-lock.json` update.

## Adding a project-only skill

Use this only for repository-specific instructions that are not reusable. If the behavior should travel to other projects, create or update a plugin instead.

1. Create `.agents/skills/<skill-name>/SKILL.md` with frontmatter + instructions.
2. Keep it project-local; do not mirror plugin content into `.agents/skills/`.
3. Promote it to a versioned plugin once it becomes reusable.

See `.claude/agents/code-reviewer.md` for a bespoke agent example.

## Updating upstream

```bash
claude plugin update              # native marketplace plugins
npx skills update --project       # Vercel skills (regenerates skills-lock.json)
```

Commit `skills-lock.json` changes.

## Where things go on disk

| Path                          | Committed?     | Purpose                                                            |
| ----------------------------- | -------------- | ------------------------------------------------------------------ |
| `.claude/settings.json`       | ✅             | Marketplaces, enabled plugins, hooks, MCP approval list            |
| `.claude/rules/*.md`          | ✅             | Path-scoped rules auto-loaded by Claude                            |
| `.claude/agents/*.md`         | ✅             | Bespoke subagents (e.g. code-reviewer)                             |
| `.agents/plugins/`            | ✅             | Codex plugin marketplace declarations                              |
| `.agents/skills/<name>/`      | ✅             | Project-only Codex skills                                          |
| `.claude/skills/<vercel>/`    | ❌             | Installed by `npx skills add`; regenerated from `skills-lock.json` |
| `plugins/nextjs-clean-skills` | ✅ (submodule) | Version-pinned architecture skills plugin                          |
| `.claude/projects/`           | ❌             | Claude Code session memory (gitignored)                            |
| `~/.claude/plugins/cache/`    | n/a            | Per-user native plugin cache outside the repo                      |
| `skills-lock.json`            | ✅             | Vercel skill version pins                                          |

## References

- [Discover and install plugins](https://code.claude.com/docs/en/discover-plugins)
- [Create plugins](https://code.claude.com/docs/en/plugins)
- [Claude Code settings](https://code.claude.com/docs/en/settings)
