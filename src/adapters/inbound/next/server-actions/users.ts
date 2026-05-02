'use server'

import { object, pipe, string, uuid } from 'valibot'
import { createSupabaseUsersRepository } from '@/adapters/outbound/supabase/users.repository'
import { type UpdateUser, UpdateUserSchema, type User } from '@/domain/user/user'
import { authActionClient, unwrapSafeActionResult } from '@/infrastructure/actions/safe-action'
import { createActionError } from '@/lib/errors/action-error'
import { AUTHORIZATION_ERROR } from '@/lib/errors/codes'
import { updateUserProfile } from '@/use-cases/users/users'

type ActionResult<T> = { success: true; data: T }

const UpdateCurrentUserProfileInputSchema = object({
  userId: pipe(string(), uuid()),
  input: UpdateUserSchema,
})

/**
 * Update the authenticated user's own profile.
 */
const safeUpdateCurrentUserProfileAction = authActionClient
  .inputSchema(UpdateCurrentUserProfileInputSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResult<User>> => {
    if (ctx.userId !== parsedInput.userId) {
      throw createActionError(
        AUTHORIZATION_ERROR,
        'updateCurrentUserProfileAction: user can only update self'
      )
    }

    const user = await updateUserProfile(
      { users: createSupabaseUsersRepository(ctx.supabase) },
      ctx.userId,
      parsedInput.input
    )
    return { success: true, data: user } satisfies ActionResult<typeof user>
  })

export async function updateCurrentUserProfileAction(
  userId: string,
  input: UpdateUser
): Promise<ActionResult<User>> {
  return unwrapSafeActionResult(await safeUpdateCurrentUserProfileAction({ userId, input }))
}
