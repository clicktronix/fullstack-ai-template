#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const contract = JSON.parse(
  fs.readFileSync(path.join(projectRoot, 'rules/architecture-contract.json'), 'utf8')
)
const sourceRoot = path.join(projectRoot, 'src')
const moduleRoot = path.join(projectRoot, contract.moduleRoot)
const neutralSurfaces = new Set(contract.neutralSurfaces ?? [])
const clientSurfaces = new Set(contract.clientSurfaces)
const clientSegments = new Set(contract.segments.filter((segment) => clientSurfaces.has(segment)))
const sourcePattern = /\.[cm]?[jt]sx?$/

function listSourceFiles(directory) {
  if (!fs.existsSync(directory)) return []
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) return listSourceFiles(absolute)
    return sourcePattern.test(entry.name) ? [absolute] : []
  })
}

function stem(file) {
  return path.basename(file).replace(sourcePattern, '')
}

function moduleLocation(file) {
  const parts = path.relative(moduleRoot, file).split(path.sep)
  if (parts[0] === '..' || parts.length < 2) return null
  const tail = parts.slice(1)
  return {
    capability: parts[0],
    segment: tail.length > 1 ? tail[0] : null,
    surface: tail.length === 1 ? stem(tail[0]) : null,
  }
}

function hasUseClientDirective(file, source) {
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true)
  return parsed.statements.some(
    (statement) =>
      ts.isExpressionStatement(statement) &&
      ts.isStringLiteral(statement.expression) &&
      statement.expression.text === 'use client'
  )
}

function neutralConsumerSide(file, source) {
  const module = moduleLocation(file)
  if (
    hasUseClientDirective(file, source) ||
    clientSegments.has(module?.segment) ||
    clientSurfaces.has(module?.surface)
  ) {
    return 'client'
  }
  if (module?.surface === 'rsc') return 'server'

  const parts = path.relative(sourceRoot, file).split(path.sep)
  if (
    parts[0] === 'app' &&
    !['route.ts', 'route.tsx', 'actions.ts', 'actions.tsx'].includes(parts.at(-1))
  ) {
    return 'server'
  }
  return null
}

function importSpecifiers(file, source) {
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true)
  const specifiers = []

  function visit(node) {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      specifiers.push(node.moduleSpecifier.text)
    }
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length === 1 &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      specifiers.push(node.arguments[0].text)
    }
    ts.forEachChild(node, visit)
  }

  visit(parsed)
  return specifiers
}

function resolveImport(importer, specifier) {
  let unresolved
  if (specifier.startsWith('@/')) {
    unresolved = path.join(sourceRoot, specifier.slice(2))
  } else if (specifier.startsWith('.')) {
    unresolved = path.resolve(path.dirname(importer), specifier)
  } else {
    return null
  }

  const withoutJavaScriptExtension = unresolved.replace(/\.[cm]?jsx?$/, '')
  const candidates = [
    unresolved,
    ...['.ts', '.tsx', '.mts', '.cts', '.js', '.jsx', '.mjs', '.cjs'].map(
      (extension) => `${withoutJavaScriptExtension}${extension}`
    ),
  ]
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null
}

const files = listSourceFiles(sourceRoot)
const usage = new Map()

for (const file of files) {
  const location = moduleLocation(file)
  if (location?.surface && neutralSurfaces.has(location.surface)) {
    usage.set(file, new Set())
  }
}

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8')
  const side = neutralConsumerSide(file, source)
  if (!side) continue

  for (const specifier of importSpecifiers(file, source)) {
    const target = resolveImport(file, specifier)
    if (target && usage.has(target)) usage.get(target).add(side)
  }
}

const errors = []
for (const [file, consumers] of usage) {
  if (!consumers.has('server') || !consumers.has('client')) {
    errors.push(
      `${path.relative(projectRoot, file)} requires both server prefetch/hydration and client query consumers; found ${[...consumers].sort().join(', ') || 'none'}`
    )
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(error)
  process.exit(1)
}

console.log(`neutral surfaces ok (${usage.size} cross-runtime query caches)`)
