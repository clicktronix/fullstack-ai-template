import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

type BootstrapOptions = {
  name: string
  title: string
}

const ROOT = process.cwd()
const TEMPLATE_SLUG = 'fullstack-ai-template'
const TEMPLATE_TITLE = 'Fullstack AI Template'
const TEMPLATE_COOKIE = 'template-locale'

const TEXT_FILES = [
  'README.md',
  'AGENTS.md',
  'src/app/layout.tsx',
  'src/app/(public)/page.tsx',
  'src/app/(public)/_internal/ui/LandingView/messages.json',
  'src/infrastructure/i18n/locales/en.ts',
  'src/infrastructure/i18n/locales/ru.ts',
  'src/app/(protected)/admin/team/page.tsx',
  'src/app/(protected)/admin/settings/page.tsx',
  'docs/TEMPLATE_GUIDE/GETTING_STARTED.md',
  'docs/TEMPLATE_GUIDE/CUSTOMIZE_TEMPLATE.md',
  'docs/TEMPLATE_GUIDE/FIRST_FEATURE.md',
]

function parseArgs(argv: string[]): BootstrapOptions {
  const nameFlag = argv.find((arg) => arg.startsWith('--name='))
  const titleFlag = argv.find((arg) => arg.startsWith('--title='))

  const name = nameFlag?.slice('--name='.length).trim()
  const title = titleFlag?.slice('--title='.length).trim()

  if (!name) {
    throw new Error('Missing required --name=<project-slug> argument')
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
    throw new Error('Project slug must be kebab-case, for example: acme-ai-portal')
  }

  return {
    name,
    title: title && title.length > 0 ? title : toTitleCase(name),
  }
}

function toTitleCase(value: string): string {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

async function replaceInFile(relativePath: string, replacements: Array<[string, string]>) {
  const filePath = path.join(ROOT, relativePath)
  const original = await readFile(filePath, 'utf8')

  let next = original
  for (const [from, to] of replacements) {
    next = next.replaceAll(from, to)
  }

  if (next !== original) {
    await writeFile(filePath, next)
  }
}

async function updatePackageJson(name: string) {
  const filePath = path.join(ROOT, 'package.json')
  const raw = await readFile(filePath, 'utf8')
  const parsed = JSON.parse(raw) as { name: string }
  parsed.name = name
  await writeFile(filePath, `${JSON.stringify(parsed, null, 2)}\n`)
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const cookieKey = `${options.name}-locale`

  for (const relativePath of TEXT_FILES) {
    await replaceInFile(relativePath, [
      [TEMPLATE_SLUG, options.name],
      [TEMPLATE_TITLE, options.title],
      [TEMPLATE_COOKIE, cookieKey],
    ])
  }

  await updatePackageJson(options.name)

  await replaceInFile('docs/TEMPLATE_GUIDE/GETTING_STARTED.md', [
    [
      'bun run bootstrap -- --name=my-new-app --title="My New App"',
      `bun run bootstrap -- --name=${options.name} --title="${options.title}"`,
    ],
  ])

  console.log(`Bootstrapped template as "${options.title}" (${options.name})`)
  console.log(`Updated cookie key: ${cookieKey}`)
  console.log('Next steps:')
  console.log('1. Copy .env.example to .env.local and fill credentials')
  console.log('2. Review README.md and AGENTS.md')
  console.log('3. Replace the demo work-items slice with your domain')
}

try {
  await main()
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  throw error
}
