import { spawnSync } from 'node:child_process'
import { access } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()

type SetupOptions = {
  checkOnly: boolean
  installBrowsers: boolean
}

function parseArgs(argv: string[]): SetupOptions {
  return {
    checkOnly: argv.includes('--check'),
    installBrowsers: argv.includes('--install-browsers'),
  }
}

async function pathExists(relativePath: string): Promise<boolean> {
  try {
    await access(path.join(ROOT, relativePath))
    return true
  } catch {
    return false
  }
}

function runCommand(command: string, args: string[]): boolean {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: 'ignore',
    shell: false,
  })

  return result.status === 0
}

async function checkChromeDebugEndpoint(): Promise<boolean> {
  try {
    const response = await fetch('http://127.0.0.1:9222/json/version')
    return response.ok
  } catch {
    return false
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))

  if (options.installBrowsers) {
    console.log('Installing Playwright Chromium browser for MCP...')
    runCommand('bunx', ['playwright', 'install', 'chromium'])
  }

  const checks = [
    {
      label: '`.mcp.json` exists',
      ok: await pathExists('.mcp.json'),
      manualStep: null,
    },
    {
      label: '`@playwright/mcp` installed locally',
      ok: await pathExists('node_modules/@playwright/mcp'),
      manualStep: 'Run `bun install` to install local MCP dependencies.',
    },
    {
      label: '`chrome-devtools-mcp` installed locally',
      ok: await pathExists('node_modules/chrome-devtools-mcp'),
      manualStep: 'Run `bun install` to install local MCP dependencies.',
    },
    {
      label: 'Playwright browsers available',
      ok: runCommand('bunx', ['playwright', 'install', '--dry-run', 'chromium']),
      manualStep:
        'Run `bun run setup:mcp -- --install-browsers` to install the Chromium browser used by Playwright MCP.',
    },
    {
      label: 'Chrome remote debugging available on :9222',
      ok: await checkChromeDebugEndpoint(),
      manualStep:
        'Start Chrome with `--remote-debugging-port=9222` before using the Chrome DevTools MCP server.',
    },
  ]

  console.log('MCP readiness check\n')

  let hasFailures = false

  for (const check of checks) {
    const icon = check.ok ? 'OK' : 'FAIL'
    console.log(`${icon.padEnd(4)} ${check.label}`)

    if (!check.ok) {
      hasFailures = true
      if (check.manualStep) {
        console.log(`     ${check.manualStep}`)
      }
    }
  }

  console.log('\nOfficial references:')
  console.log('- MCP basics: https://modelcontextprotocol.io/docs/learn/client-concepts')
  console.log(
    '- MCP tools spec: https://modelcontextprotocol.io/specification/2025-03-26/server/tools'
  )
  console.log('- Supabase MCP: https://supabase.com/mcp')
  console.log('- Playwright MCP: https://github.com/microsoft/playwright-mcp')
  console.log('- Chrome DevTools MCP: https://github.com/ChromeDevTools/chrome-devtools-mcp')

  if (hasFailures && options.checkOnly) {
    process.exitCode = 1
    return
  }

  if (hasFailures) {
    console.log('\nSome MCP prerequisites still need manual setup.')
    console.log('Common remaining steps:')
    console.log('1. Run `bun install` if local MCP binaries are missing.')
    console.log('2. Start Chrome with remote debugging on port 9222 for `chrome-devtools`.')
    console.log('3. Re-run `bun run mcp:doctor` after finishing manual steps.')
    return
  }

  console.log('\nAll MCP checks passed.')
}

await main()
