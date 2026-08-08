import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, test } from 'bun:test'

/**
 * A top-level `'use server'` module may only export async functions. Exporting anything else —
 * an object, a plain constant, a class — makes Next reject the whole route at module evaluation
 * ("A 'use server' file can only export async functions, found object").
 *
 * Nothing else in the gate catches it: typecheck, lint, the unit suite and even `next build` all
 * pass, and the route only fails when a user actually submits the form. Both auth forms shipped
 * broken this way, so the invariant is enforced here instead of by review.
 *
 * Type-only exports are fine — they are erased before the directive is evaluated.
 */

const SRC = join(import.meta.dir, '..')

function collectSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) return collectSourceFiles(path)
    return /\.tsx?$/.test(entry) ? [path] : []
  })
}

function isUseServerModule(source: string): boolean {
  const firstStatement = source.trimStart().slice(0, 20)
  return firstStatement.startsWith("'use server'") || firstStatement.startsWith('"use server"')
}

/** Exported bindings that are neither `async function` nor `type`/`interface`. */
function findNonAsyncExports(source: string): string[] {
  const offenders: string[] = []

  for (const line of source.split('\n')) {
    const match = /^export\s+(?<kind>const|let|var|class|function)\s+(?<name>[A-Za-z0-9_$]+)/.exec(
      line
    )
    if (!match?.groups) continue
    if (match.groups.kind === 'function') continue // `export function` is caught below only if sync
    offenders.push(`${match.groups.kind} ${match.groups.name}`)
  }

  for (const line of source.split('\n')) {
    const match = /^export\s+function\s+(?<name>[A-Za-z0-9_$]+)/.exec(line)
    if (match?.groups) offenders.push(`function ${match.groups.name} (not async)`)
  }

  return offenders
}

describe("'use server' modules", () => {
  const useServerFiles = collectSourceFiles(SRC).filter((path) =>
    isUseServerModule(readFileSync(path, 'utf8'))
  )

  test('the repository actually has some, so this suite is not vacuous', () => {
    expect(useServerFiles.length).toBeGreaterThan(0)
  })

  test('export only async functions', () => {
    const violations = useServerFiles.flatMap((path) => {
      const offenders = findNonAsyncExports(readFileSync(path, 'utf8'))
      return offenders.map((offender) => `${path.replace(SRC, 'src')}: export ${offender}`)
    })

    expect(violations).toEqual([])
  })
})
