'use server'

import { parse } from 'valibot'
import { updateUserProfile } from '@/adapters/outbound/supabase/users.operations'
import { UpdateUserSchema, type UpdateUser } from '@/domain/user/user'
import { withAuthContext } from '@/infrastructure/auth/with-auth'
import { createActionError } from '@/lib/errors/action-error'
import { AUTHORIZATION_ERROR, VALIDATION_ERROR } from '@/lib/errors/codes'
import { isValidUuid } from '@/lib/uuid'

type ActionResult<T> = { success: true; data: T }

function assertValidUserId(userId: string, context: string): void {
  if (!isValidUuid(userId)) {
    throw createActionError(VALIDATION_ERROR, `${context}: invalid user ID`)
  }
}

/**
 * Update the authenticated user's own profile.
 */
export const updateCurrentUserProfileAction = withAuthContext(
  async (ctx, userId: string, input: UpdateUser) => {
    assertValidUserId(userId, 'updateCurrentUserProfileAction')

    if (ctx.userId !== userId) {
      throw createActionError(
        AUTHORIZATION_ERROR,
        'updateCurrentUserProfileAction: user can only update self'
      )
    }

    const validated = parse(UpdateUserSchema, input)
    const user = await updateUserProfile(ctx.supabase, ctx.userId, validated)
    return { success: true, data: user } satisfies ActionResult<typeof user>
  }
)
