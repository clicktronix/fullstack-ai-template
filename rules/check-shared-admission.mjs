#!/usr/bin/env node
/**
 * Enforces the shared-admission rule the architecture states but nothing checked:
 *
 *   "Admission to shared code requires at least two real consumers, identical meaning and
 *    lifecycle, no natural capability owner, and a narrower coordination cost than duplication.
 *    Delete or demote speculative helpers."
 *
 * Only the countable half is enforceable here — the number of real consumers. Identical meaning,
 * lifecycle and coordination cost stay a review judgement; this check never claims otherwise.
 *
 * A "consumer" is an OWNER, not a file: a capability, `app`, or another shared root. Two files of
 * one capability importing a helper is one consumer, and that capability is its natural owner.
 *
 * Verdicts per file under the shared root:
 *   unused        nothing imports it at all -> delete
 *   demote        its only owner is a capability -> that capability is the natural home
 *   speculative   one importing file, and no capability to demote into -> written for a second
 *                 consumer that never arrived
 *   private       imported only from inside its own shared root -> fine, it is that root's
 *                 implementation detail rather than an admitted surface
 *   ok            everything else
 *
 * `app` is deliberately NOT treated as a single consumer the way a capability is. Route composition
 * is not a place to demote infrastructure into, and a helper imported by five routes is not
 * speculative — so an app-only owner fails only when exactly one file imports it.
 *
 * Tests are not consumers: a helper kept alive only by its own test is dead code with a test.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import ts from 'typescript'

function findProjectRoot(start) {
  let current = start
  while (true) {
    if (fs.existsSync(path.join(current, 'package.json'))) return current
    const parent = path.dirname(current)
    if (parent === current)
      throw new Error('Cannot find package.json above check-shared-admission.mjs')
    current = parent
  }
}

const root = findProjectRoot(path.dirname(fileURLToPath(import.meta.url)))
const contract = JSON.parse(
  fs.readFileSync(new URL('./architecture-contract.json', import.meta.url), 'utf8')
)

const sourceRoot = path.join(root, path.dirname(contract.moduleRoot))
const moduleRoot = path.join(root, contract.moduleRoot)
const sharedRoot = path.join(sourceRoot, 'shared')
const appRoot = path.join(sourceRoot, 'app')

/**
 * Debt ledger. The rule is stated as an absolute, but the repository did not grow up under it, so
 * the check ships as a ratchet: these counts may fall and never rise. Lower a number with the
 * change that fixes the file; the check tells you when one is stale. Every entry is a file that
 * should eventually be deleted, demoted, or earn a second consumer — the target is 0/0/0.
 */
const BUDGET = {
  unused: 12,
  demote: 3,
  speculative: 19,
}

/**
 * Files exempt from the rule, each with the reason it cannot have two importers by nature.
 * Keep this list short: an entry is an admission that the rule does not apply, not a snooze.
 */
const EXEMPT = new Set([
  // Framework entry points: the runtime imports them, no source file does.
  'src/instrumentation.ts',
  'src/instrumentation-client.ts',
  'src/proxy.ts',
])

const isTest = (file) => /\.(test|spec)\.tsx?$/.test(file) || file.includes('__tests__')

function listSources(directory) {
  if (!fs.existsSync(directory)) return []
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) return listSources(absolute)
    return /\.tsx?$/.test(entry.name) ? [absolute] : []
  })
}

const CANDIDATE_SUFFIXES = ['.ts', '.tsx', '/index.ts', '/index.tsx']

/** Resolve an import specifier to a file on disk, or null when it leaves the source tree. */
function resolveSpecifier(specifier, fromFile) {
  let base
  if (specifier.startsWith('@/')) base = path.join(sourceRoot, specifier.slice(2))
  else if (specifier.startsWith('.')) base = path.resolve(path.dirname(fromFile), specifier)
  else return null

  if (fs.existsSync(base) && fs.statSync(base).isFile()) return base
  for (const suffix of CANDIDATE_SUFFIXES) {
    const candidate = `${base}${suffix}`
    if (fs.existsSync(candidate)) return candidate
  }
  return null
}

function specifiersOf(file) {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true
  )
  const found = []
  const visit = (node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      found.push(node.moduleSpecifier.text)
    }
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      const [argument] = node.arguments
      if (argument && ts.isStringLiteral(argument)) found.push(argument.text)
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return found
}

const capabilities = new Set(
  fs.existsSync(moduleRoot)
    ? fs
        .readdirSync(moduleRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
    : []
)

const isCapability = (owner) => capabilities.has(owner)

/** Which owner does an importing file belong to? */
function ownerOf(file) {
  if (file.startsWith(`${moduleRoot}${path.sep}`)) {
    return path.relative(moduleRoot, file).split(path.sep)[0]
  }
  if (file.startsWith(`${appRoot}${path.sep}`)) return 'app'
  if (file.startsWith(`${sharedRoot}${path.sep}`)) {
    return `shared/${path.relative(sharedRoot, file).split(path.sep)[0]}`
  }
  return 'app'
}

const allSources = listSources(sourceRoot)
const importers = new Map() // target file -> Set of importing files

for (const file of allSources) {
  if (isTest(file)) continue
  for (const specifier of specifiersOf(file)) {
    const target = resolveSpecifier(specifier, file)
    if (!target) continue
    if (!importers.has(target)) importers.set(target, new Set())
    importers.get(target).add(file)
  }
}

const unused = []
const demote = []
const speculative = []
let privateCount = 0
let okCount = 0

for (const file of listSources(sharedRoot)) {
  if (isTest(file)) continue
  const relative = path.relative(root, file)
  if (EXEMPT.has(relative)) continue

  const own = importers.get(file) ?? new Set()
  if (own.size === 0) {
    unused.push(relative)
    continue
  }

  const ownSharedRoot = ownerOf(file)
  const owners = new Set()
  for (const importer of own) {
    const owner = ownerOf(importer)
    if (owner !== ownSharedRoot) owners.add(owner)
  }

  const external = [...own].filter((importer) => ownerOf(importer) !== ownSharedRoot)

  if (owners.size === 0) privateCount += 1
  else if (owners.size === 1 && isCapability([...owners][0])) {
    demote.push({ file: relative, owner: [...owners][0] })
  } else if (external.length === 1) {
    speculative.push({ file: relative, importer: path.relative(root, external[0]) })
  } else okCount += 1
}

const counts = {
  unused: unused.length,
  demote: demote.length,
  speculative: speculative.length,
}

const over = Object.keys(BUDGET).filter((kind) => counts[kind] > BUDGET[kind])
const under = Object.keys(BUDGET).filter((kind) => counts[kind] < BUDGET[kind])

if (over.length > 0) {
  for (const file of unused) {
    console.error(`shared admission: ${file} has no importer at all — delete it`)
  }
  for (const { file, owner } of demote) {
    console.error(
      `shared admission: ${file} is used only by the "${owner}" capability — that is its natural owner, move it there`
    )
  }
  for (const { file, importer } of speculative) {
    console.error(
      `shared admission: ${file} has exactly one importer (${importer}) — not shared yet, keep it with its caller`
    )
  }
  console.error(
    `\nover budget: ${over
      .map((kind) => `${kind} ${counts[kind]} > ${BUDGET[kind]}`)
      .join(', ')}.\nShared code needs two real consumers with identical meaning and lifecycle. ` +
      'Delete it, demote it into its consumer, or — if the file genuinely cannot have importers — ' +
      'add it to EXEMPT in rules/check-shared-admission.mjs with the reason. Do not raise the budget.'
  )
  process.exitCode = 1
} else if (under.length > 0) {
  console.error(
    `shared admission improved: ${under
      .map((kind) => `${kind} ${counts[kind]} < ${BUDGET[kind]}`)
      .join(
        ', '
      )}.\nLower BUDGET in rules/check-shared-admission.mjs so the improvement cannot regress.`
  )
  process.exitCode = 1
} else {
  console.log(
    `shared admission ok (${okCount} admitted, ${privateCount} private; at budget: ` +
      `${counts.unused} unused, ${counts.demote} to demote, ${counts.speculative} speculative)`
  )
}
