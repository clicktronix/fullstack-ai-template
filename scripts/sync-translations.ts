import { readFileSync } from 'fs'
import { join, relative, resolve } from 'path'
import { pathToFileURL } from 'url'
import { Glob } from 'bun'

/**
 * Единая строгая i18n-проверка для репозитория.
 *
 * Проверяет только реальные проблемы синхронизации:
 * - дубликаты message IDs
 * - ключи из messages.json, которых нет в locale files
 * - расхождение наборов ключей между en.ts и ru.ts
 *
 * Orphaned locale keys показывает как warnings, но не валит CI:
 * это полезный технический долг, но не блокирующая ошибка синхронизации.
 */

type MessageEntry = {
  id: string
  file: string
}

type DuplicateEntry = {
  id: string
  files: string[]
}

type LocaleName = 'en' | 'ru'

const ROOT = resolve(import.meta.dir, '..')
const SRC = join(ROOT, 'src')
const INLINE_ID_FILE_PATTERNS = ['**/*.ts', '**/*.tsx']
const INLINE_ID_FILE_EXCLUDES = [
  '/__tests__/',
  '.test.ts',
  '.test.tsx',
  '.stories.ts',
  '.stories.tsx',
  '/infrastructure/i18n/locales/',
] as const
const INLINE_ID_REGEX = /\bid\s*:\s*['"]([a-z][a-zA-Z0-9-]*(?:\.[a-zA-Z0-9-]+)+)['"]/g
const DYNAMIC_MESSAGE_IDS = [] as const

function shouldSkipInlineIdFile(filePath: string): boolean {
  return INLINE_ID_FILE_EXCLUDES.some((segment) => filePath.includes(segment))
}

function stripComments(source: string): string {
  const lines = source.split('\n')
  const cleanedLines: string[] = []
  let isInsideBlockComment = false

  for (const line of lines) {
    let currentLine = line

    if (isInsideBlockComment) {
      const blockEndIndex = currentLine.indexOf('*/')
      if (blockEndIndex === -1) {
        continue
      }

      currentLine = currentLine.slice(blockEndIndex + 2)
      isInsideBlockComment = false
    }

    while (currentLine.includes('/*')) {
      const blockStartIndex = currentLine.indexOf('/*')
      const blockEndIndex = currentLine.indexOf('*/', blockStartIndex + 2)

      if (blockEndIndex === -1) {
        currentLine = currentLine.slice(0, blockStartIndex)
        isInsideBlockComment = true
        break
      }

      currentLine = currentLine.slice(0, blockStartIndex) + currentLine.slice(blockEndIndex + 2)
    }

    const trimmed = currentLine.trimStart()
    if (trimmed.startsWith('//')) {
      continue
    }

    cleanedLines.push(currentLine)
  }

  return cleanedLines.join('\n')
}

function extractMessages(value: unknown, file: string): MessageEntry[] {
  if (!value || typeof value !== 'object') {
    return []
  }

  const entry = value as Record<string, unknown>
  if (typeof entry.id === 'string' && typeof entry.defaultMessage === 'string') {
    return [
      {
        id: entry.id,
        file,
      },
    ]
  }

  return Object.entries(entry).flatMap(([, nestedValue]) =>
    typeof nestedValue === 'object' && nestedValue !== null
      ? extractMessages(nestedValue, file)
      : []
  )
}

async function loadAllMessages(): Promise<MessageEntry[]> {
  const patterns = ['**/messages.json', '**/*.messages.json']
  const entries: MessageEntry[] = []

  for (const pattern of patterns) {
    const glob = new Glob(pattern)
    for await (const filePath of glob.scan({ cwd: SRC, absolute: true })) {
      const content = JSON.parse(readFileSync(filePath, 'utf8'))
      const relativePath = relative(ROOT, filePath)
      entries.push(...extractMessages(content, relativePath))
    }
  }

  return entries
}

async function loadInlineDescriptorIds(): Promise<MessageEntry[]> {
  const found = new Map<string, Set<string>>()

  for (const pattern of INLINE_ID_FILE_PATTERNS) {
    const glob = new Glob(pattern)
    for await (const filePath of glob.scan({ cwd: SRC, absolute: true })) {
      const relativePath = relative(ROOT, filePath)
      if (shouldSkipInlineIdFile(relativePath)) {
        continue
      }

      const source = stripComments(readFileSync(filePath, 'utf8'))
      for (const match of source.matchAll(INLINE_ID_REGEX)) {
        const id = match[1]
        const files = found.get(id) ?? new Set<string>()
        files.add(relativePath)
        found.set(id, files)
      }
    }
  }

  return [...found.entries()]
    .flatMap(([id, files]) => [...files].map((file) => ({ id, file })))
    .sort((left, right) => left.id.localeCompare(right.id) || left.file.localeCompare(right.file))
}

function loadDynamicMessageIds(): MessageEntry[] {
  return DYNAMIC_MESSAGE_IDS.map((id) => ({
    id,
    file: 'src/infrastructure/i18n/locales/en.ts',
  }))
}

function findDuplicateMessageIds(messages: MessageEntry[]): DuplicateEntry[] {
  const grouped = new Map<string, Set<string>>()

  for (const entry of messages) {
    const files = grouped.get(entry.id) ?? new Set<string>()
    files.add(entry.file)
    grouped.set(entry.id, files)
  }

  return [...grouped.entries()]
    .filter(([, files]) => files.size > 1)
    .map(([id, files]) => ({ id, files: [...files].sort() }))
    .sort((left, right) => left.id.localeCompare(right.id))
}

async function loadLocaleEntries(locale: LocaleName): Promise<Map<string, string>> {
  const localePath = join(SRC, `infrastructure/i18n/locales/${locale}.ts`)
  const moduleUrl = pathToFileURL(localePath).href
  const localeModule = await import(moduleUrl)
  const exportName = locale === 'en' ? 'enMessages' : 'ruMessages'
  const messages = localeModule[exportName] as Record<string, string>

  return new Map(Object.entries(messages))
}

function summarizeMissingTranslations(
  messages: MessageEntry[],
  localeEntries: Map<string, string>
): MessageEntry[] {
  return messages
    .filter((entry) => !localeEntries.has(entry.id))
    .sort((left, right) => left.id.localeCompare(right.id))
}

function summarizeLocaleParity(source: Map<string, string>, target: Map<string, string>): string[] {
  return [...source.keys()].filter((key) => !target.has(key)).sort()
}

function summarizeOrphans(
  localeEntries: Map<string, string>,
  usedIds: Set<string>
): Array<{ id: string; value: string }> {
  return [...localeEntries.entries()]
    .filter(([id]) => !usedIds.has(id))
    .map(([id, value]) => ({ id, value }))
    .sort((left, right) => left.id.localeCompare(right.id))
}

const messageDescriptorEntries = await loadAllMessages()
const inlineDescriptorEntries = await loadInlineDescriptorIds()
const dynamicMessageEntries = loadDynamicMessageIds()
const messages = [...messageDescriptorEntries, ...inlineDescriptorEntries, ...dynamicMessageEntries]
const enEntries = await loadLocaleEntries('en')
const ruEntries = await loadLocaleEntries('ru')

const duplicates = findDuplicateMessageIds(messageDescriptorEntries)
const missingFromEn = summarizeMissingTranslations(messages, enEntries)
const missingFromRu = summarizeMissingTranslations(messages, ruEntries)
const onlyInEn = summarizeLocaleParity(enEntries, ruEntries)
const onlyInRu = summarizeLocaleParity(ruEntries, enEntries)
const usedIds = new Set(messages.map((entry) => entry.id))
const orphanedEn = summarizeOrphans(enEntries, usedIds)
const orphanedRu = summarizeOrphans(ruEntries, usedIds)
const missingFromRuIds = new Set(missingFromRu.map((entry) => entry.id))
const missingFromEnIds = new Set(missingFromEn.map((entry) => entry.id))
const missingFromBothLocales = missingFromEn.filter((entry) => missingFromRuIds.has(entry.id))
const missingOnlyFromEn = missingFromEn.filter((entry) => ruEntries.has(entry.id))
const missingOnlyFromRu = missingFromRu.filter((entry) => missingFromEnIds.has(entry.id) === false)

let errorCount = 0
let warningCount = 0

function logSection(title: string) {
  console.log(`\n${title}`)
}

function logError(message: string) {
  console.log(`  ❌ ${message}`)
  errorCount += 1
}

function logWarning(message: string) {
  console.log(`  ⚠️  ${message}`)
  warningCount += 1
}

console.log('=== Translation Sync Check ===')
console.log(`messages.json entries: ${messageDescriptorEntries.length}`)
console.log(
  `inline descriptor ids: ${new Set(inlineDescriptorEntries.map((entry) => entry.id)).size}`
)
console.log(`dynamic helper ids: ${new Set(dynamicMessageEntries.map((entry) => entry.id)).size}`)
console.log(`en.ts keys: ${enEntries.size}`)
console.log(`ru.ts keys: ${ruEntries.size}`)

logSection('Duplicates')
if (duplicates.length === 0) {
  console.log('  ✅ No duplicate IDs')
} else {
  for (const duplicate of duplicates) {
    logError(`"${duplicate.id}"`)
    for (const file of duplicate.files) {
      console.log(`     ${file}`)
    }
  }
}

logSection('Missing From Locales')
if (missingFromEn.length === 0 && missingFromRu.length === 0) {
  console.log('  ✅ All messages.json IDs exist in both locale files')
} else {
  if (missingFromBothLocales.length > 0) {
    console.log(`  Missing from both en.ts and ru.ts: ${missingFromBothLocales.length}`)
    for (const entry of missingFromBothLocales) {
      logError(`"${entry.id}" — ${entry.file}`)
    }
  }

  if (missingOnlyFromEn.length > 0) {
    console.log(`  Missing only from en.ts: ${missingOnlyFromEn.length}`)
    for (const entry of missingOnlyFromEn) {
      logError(`"${entry.id}" — ${entry.file}`)
    }
  }

  if (missingOnlyFromRu.length > 0) {
    console.log(`  Missing only from ru.ts: ${missingOnlyFromRu.length}`)
    for (const entry of missingOnlyFromRu) {
      logError(`"${entry.id}" — ${entry.file}`)
    }
  }
}

logSection('Locale Parity')
if (onlyInEn.length === 0 && onlyInRu.length === 0) {
  console.log('  ✅ en.ts and ru.ts have matching key sets')
} else {
  for (const key of onlyInEn) {
    logError(`Only in en.ts: "${key}"`)
  }
  for (const key of onlyInRu) {
    logError(`Only in ru.ts: "${key}"`)
  }
}

logSection('Orphaned Locale Keys')
if (orphanedEn.length === 0 && orphanedRu.length === 0) {
  console.log('  ✅ No orphaned locale keys')
} else {
  console.log(`  Orphaned in en.ts: ${orphanedEn.length}`)
  for (const entry of orphanedEn.slice(0, 25)) {
    logWarning(`en.ts "${entry.id}" = "${entry.value}"`)
  }
  if (orphanedEn.length > 25) {
    console.log(`     … and ${orphanedEn.length - 25} more`)
  }

  console.log(`  Orphaned in ru.ts: ${orphanedRu.length}`)
  for (const entry of orphanedRu.slice(0, 25)) {
    logWarning(`ru.ts "${entry.id}" = "${entry.value}"`)
  }
  if (orphanedRu.length > 25) {
    console.log(`     … and ${orphanedRu.length - 25} more`)
  }
}

console.log('\n' + '─'.repeat(60))
console.log(`Errors: ${errorCount}`)
console.log(`Warnings: ${warningCount}`)

if (errorCount > 0) {
  console.log('\n💥 Translation sync check FAILED')
  throw new Error('Translation sync check failed')
}

console.log(
  warningCount > 0
    ? '\n⚠️  Translation sync check passed with warnings'
    : '\n✅ Translation sync check PASSED'
)
