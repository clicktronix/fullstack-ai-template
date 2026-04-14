'use client'

/**
 * Hook for handling CRUD modal save operations.
 *
 * Provides unified logic for create/update mutations based on selected item.
 */

import type { UseMutationResult } from '@tanstack/react-query'
import { useCallback } from 'react'

type UseCrudModalHandlerOptions<
  TItem extends { id: string },
  TFormData,
  TCreateData,
  TUpdateData,
  TError = Error,
> = {
  selectedItem: TItem | null
  createMutation: UseMutationResult<unknown, TError, TCreateData>
  updateMutation: UseMutationResult<unknown, TError, { id: string; data: TUpdateData }>
  onSuccess: () => void
  onCreateSuccess?: () => void
  onUpdateSuccess?: () => void
  onError?: (error: TError) => void
}

/**
 * Hook that provides unified save handler for CRUD modals.
 *
 * @param options.selectedItem - Currently selected item for editing, null for creation
 * @param options.createMutation - TanStack Query mutation for creating new items
 * @param options.updateMutation - TanStack Query mutation for updating existing items
 * @param options.onSuccess - Callback called on successful mutation (e.g. close modal)
 * @param options.onCreateSuccess - Optional callback called on successful create (e.g. show notification)
 * @param options.onUpdateSuccess - Optional callback called on successful update (e.g. show notification)
 * @param options.onError - Optional callback called on mutation error
 * @returns Callback function to handle save operation
 *
 * @example
 * ```ts
 * const onSave = useCrudModalHandler<Category, CategoryFormData, CreateCategory, UpdateCategory>({
 *   selectedItem: selectedCategory,
 *   createMutation: createCategory,
 *   updateMutation: updateCategory,
 *   onSuccess: onModalClose,
 *   onCreateSuccess: showCreateSuccess,
 *   onUpdateSuccess: showUpdateSuccess,
 * })
 * ```
 */
export function useCrudModalHandler<
  TItem extends { id: string },
  TFormData extends TCreateData & TUpdateData,
  TCreateData,
  TUpdateData,
  TError = Error,
>({
  selectedItem,
  createMutation,
  updateMutation,
  onSuccess,
  onCreateSuccess,
  onUpdateSuccess,
  onError,
}: UseCrudModalHandlerOptions<TItem, TFormData, TCreateData, TUpdateData, TError>) {
  return useCallback(
    (data: TFormData) => {
      if (selectedItem) {
        updateMutation.mutate(
          { id: selectedItem.id, data },
          {
            onSuccess: () => {
              onUpdateSuccess?.()
              onSuccess()
            },
            onError,
          }
        )
      } else {
        createMutation.mutate(data, {
          onSuccess: () => {
            onCreateSuccess?.()
            onSuccess()
          },
          onError,
        })
      }
    },
    [
      selectedItem,
      createMutation,
      updateMutation,
      onSuccess,
      onCreateSuccess,
      onUpdateSuccess,
      onError,
    ]
  )
}
