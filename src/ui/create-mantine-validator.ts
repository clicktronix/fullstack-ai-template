import type { StandardSchemaV1 } from '@standard-schema/spec'

type MantineValidationErrors = Record<string, string>

/**
 * Creates a Mantine Form validator from any Standard Schema-compatible schema.
 *
 * @example
 * ```ts
 * import { UserUpdateSchema } from '@/domain/user'
 *
 * const form = useForm({
 *   validate: createMantineValidator(UserUpdateSchema),
 * })
 * ```
 */
export function createMantineValidator<T>(schema: StandardSchemaV1<unknown, T>) {
  return (values: unknown): MantineValidationErrors => {
    const result = schema['~standard'].validate(values)

    if (result instanceof Promise) {
      throw new TypeError('createMantineValidator expects a synchronous schema')
    }

    if (!result.issues) {
      return {}
    }

    const errors: MantineValidationErrors = {}

    for (const issue of result.issues) {
      if (issue.path) {
        const path = issue.path
          .map((segment) =>
            typeof segment === 'object' && segment !== null ? segment.key : segment
          )
          .join('.')
        errors[path] = issue.message
      }
    }

    return errors
  }
}
