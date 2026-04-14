import type { BaseIssue, BaseSchema } from 'valibot'
import { safeParse } from 'valibot'

/**
 * Creates a Mantine Form validator from a Valibot schema
 *
 * @example
 * ```ts
 * import { userUpdateSchema } from '@/domain/user'
 *
 * const form = useForm({
 *   validate: createMantineValidator(userUpdateSchema),
 * })
 * ```
 */
export function createMantineValidator<T extends BaseSchema<unknown, unknown, BaseIssue<unknown>>>(
  schema: T
) {
  return (values: unknown) => {
    const result = safeParse(schema, values)

    if (result.success) {
      return {}
    }

    // Convert Valibot issues to Mantine errors format
    const errors: Record<string, string> = {}

    for (const issue of result.issues) {
      if (issue.path) {
        const path = issue.path.map((p) => p.key).join('.')
        errors[path] = issue.message
      }
    }

    return errors
  }
}
