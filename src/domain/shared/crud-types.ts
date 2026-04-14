/**
 * Вспомогательные типы для CRUD операций с domain сущностями.
 *
 * Устраняет дублирование паттерна:
 * type CreateEntity = Omit<Entity, 'id' | 'created_at' | 'updated_at'>
 * type UpdateEntity = Partial<CreateEntity>
 */

/**
 * Базовые поля, которые есть у всех сущностей с timestamps.
 */
type BaseEntityFields = 'id' | 'created_at' | 'updated_at'

/**
 * Тип для создания сущности - без id и timestamps.
 *
 * @example
 * type CreateBlogger = CreateInput<Blogger>
 * // Результат: Omit<Blogger, 'id' | 'created_at' | 'updated_at'>
 */
export type CreateInput<T> = Omit<T, BaseEntityFields>

/**
 * Тип для обновления сущности - частичный, без id и timestamps.
 *
 * @example
 * type UpdateBlogger = UpdateInput<Blogger>
 * // Результат: Partial<Omit<Blogger, 'id' | 'created_at' | 'updated_at'>>
 */
export type UpdateInput<T> = Partial<CreateInput<T>>
