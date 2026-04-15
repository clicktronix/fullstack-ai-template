/**
 * Helper types for CRUD operations on domain entities.
 *
 * Removes duplication of the pattern:
 * type CreateEntity = Omit<Entity, 'id' | 'created_at' | 'updated_at'>
 * type UpdateEntity = Partial<CreateEntity>
 */

/**
 * Base fields that every entity with timestamps carries.
 */
type BaseEntityFields = 'id' | 'created_at' | 'updated_at'

/**
 * Input type for creating an entity — without id and timestamps.
 *
 * @example
 * type CreateWorkItem = CreateInput<WorkItem>
 * // Result: Omit<WorkItem, 'id' | 'created_at' | 'updated_at'>
 */
export type CreateInput<T> = Omit<T, BaseEntityFields>

/**
 * Input type for updating an entity — partial, without id and timestamps.
 *
 * @example
 * type UpdateWorkItem = UpdateInput<WorkItem>
 * // Result: Partial<Omit<WorkItem, 'id' | 'created_at' | 'updated_at'>>
 */
export type UpdateInput<T> = Partial<CreateInput<T>>
