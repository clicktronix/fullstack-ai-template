/**
 * Login form state, kept out of `actions.ts` on purpose.
 *
 * A top-level `'use server'` module may only export async functions. Exporting the initial-state
 * object from there makes Next reject the whole route at module evaluation with
 * "A 'use server' file can only export async functions, found object", which typecheck, lint and
 * the unit suite all pass — the failure only appears when the route is requested.
 */
export type LoginFormState = {
  error: string | null
}

export const initialLoginFormState: LoginFormState = {
  error: null,
}
