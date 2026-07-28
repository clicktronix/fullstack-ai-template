/**
 * Converts an empty-string env value to `undefined`.
 *
 * `.env.example` ships blank placeholder entries (e.g. `SUPABASE_SECRET_KEY=`) as a template
 * for users to fill in. When such a line exists but is left blank, `process.env.KEY` reads as
 * `''` — a defined, non-undefined string — rather than `undefined`. Schemas built with
 * `optional()` only treat `undefined` as "not provided": an empty string is validated as an
 * explicit value, which both fails `minLength(1)` checks and, for keys with a legacy fallback
 * (e.g. `newKey ?? legacyKey`), wins over `??` before the fallback ever runs. Normalizing at
 * the point `process.env` is read keeps blank placeholders behaving the same as unset vars.
 */
export function emptyStringToUndefined(value: string | undefined): string | undefined {
  return value === '' ? undefined : value
}
