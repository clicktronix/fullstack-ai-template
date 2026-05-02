import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

/**
 * Installs Claude Code skills this template depends on.
 *
 * Primary mechanism: `.claude/settings.json` declares `extraKnownMarketplaces`
 * and `enabledPlugins`. When a teammate trusts the repo folder, Claude Code
 * prompts them to install those marketplaces and plugins automatically.
 *
 * This script is a CLI fallback for headless setups and CI, and also handles
 * the Vercel `agent-skills` install which is not a native Claude Code plugin.
 *
 * Usage:
 *   bun scripts/setup-skills.ts           # install everything
 *   bun scripts/setup-skills.ts --check   # doctor mode; verify without changing state
 *
 * Idempotent: safe to re-run. Run again after upstream releases to pull updates.
 */

type MarketplacePlugin = {
  marketplace: string
  plugin: string
}

const MARKETPLACE_PLUGINS: MarketplacePlugin[] = [
  { marketplace: 'supabase/agent-skills', plugin: 'postgres-best-practices@supabase-agent-skills' },
  { marketplace: 'tanstack-skills/tanstack-skills', plugin: 'tanstack-query@tanstack-skills' },
  { marketplace: 'obra/superpowers-marketplace', plugin: 'superpowers@superpowers-marketplace' },
  {
    marketplace: 'clicktronix/nextjs-clean-skills',
    plugin: 'nextjs-clean-skills@nextjs-clean-skills',
  },
]

const VERCEL_SKILLS = [
  'vercel-react-best-practices',
  'vercel-composition-patterns',
  'web-design-guidelines',
] as const

const checkMode = process.argv.includes('--check')

function run(command: string, args: string[], opts: { stdio?: 'inherit' | 'pipe' } = {}) {
  const result = spawnSync(command, args, {
    stdio: opts.stdio ?? 'inherit',
    encoding: 'utf8',
  })
  if (result.error) throw result.error
  return result
}

function listMarketplacesOutput() {
  const list = run('claude', ['plugin', 'marketplace', 'list'], { stdio: 'pipe' })
  return `${list.stdout ?? ''}${list.stderr ?? ''}`
}

function listInstalledPluginsOutput() {
  const list = run('claude', ['plugin', 'list'], { stdio: 'pipe' })
  return `${list.stdout ?? ''}${list.stderr ?? ''}`
}

function ensureMarketplace(source: string) {
  const output = listMarketplacesOutput()
  const alreadyAdded = output.includes(source) || output.includes(path.basename(source))
  if (alreadyAdded) {
    console.log(`  ✓ marketplace already registered: ${source}`)
    return
  }
  if (checkMode) {
    console.log(`  ✗ marketplace missing: ${source}`)
    return
  }
  console.log(`  + adding marketplace: ${source}`)
  run('claude', ['plugin', 'marketplace', 'add', source])
}

function installPlugin(plugin: string) {
  const installed = listInstalledPluginsOutput()
  if (installed.includes(plugin)) {
    console.log(`  ✓ plugin already installed: ${plugin}`)
    return
  }
  if (checkMode) {
    console.log(`  ✗ plugin missing: ${plugin}`)
    return
  }
  console.log(`  + installing plugin: ${plugin}`)
  run('claude', ['plugin', 'install', plugin, '--scope', 'project'])
}

function installVercelSkills() {
  const installedLocally = VERCEL_SKILLS.every((name) =>
    existsSync(path.join(process.cwd(), '.claude', 'skills', name))
  )

  if (checkMode) {
    if (installedLocally) {
      console.log('  ✓ Vercel skills present in .claude/skills/')
    } else {
      console.log('  ✗ Vercel skills missing — run without --check')
    }
    return
  }

  const args = ['--yes', 'skills', 'add', 'vercel-labs/agent-skills', '-a', 'claude-code', '--yes']
  for (const skill of VERCEL_SKILLS) {
    args.push('--skill', skill)
  }
  console.log('\n[3/3] Installing Vercel agent-skills via npx skills add')
  run('npx', args)
}

function reportLockfile() {
  const lock = path.join(process.cwd(), 'skills-lock.json')
  if (!existsSync(lock)) return
  const parsed = JSON.parse(readFileSync(lock, 'utf8')) as { skills?: unknown }
  const count =
    parsed.skills && typeof parsed.skills === 'object'
      ? Object.keys(parsed.skills as Record<string, unknown>).length
      : 0
  console.log(`  ↳ skills-lock.json present (${count} entries). Commit it.`)
}

function main() {
  const header = checkMode ? 'Checking Claude Code plugin state' : 'Installing Claude Code plugins'
  console.log(header)
  console.log('\n[1/3] Marketplaces')
  for (const { marketplace } of MARKETPLACE_PLUGINS) {
    ensureMarketplace(marketplace)
  }

  console.log('\n[2/3] Plugins (project scope)')
  for (const { plugin } of MARKETPLACE_PLUGINS) {
    installPlugin(plugin)
  }

  installVercelSkills()
  reportLockfile()

  if (!checkMode) {
    console.log('\nDone. To pull newer versions later:')
    console.log('  claude plugin update            # marketplace plugins')
    console.log('  npx skills update --project     # Vercel skills')
  }
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  throw error
}
