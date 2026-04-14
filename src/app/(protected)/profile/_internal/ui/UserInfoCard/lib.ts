import { useState } from 'react'
import { getUserDisplayName, getUserInitials, type User } from '@/domain/user/user'

export type UseUserInfoCardPropsInput = {
  user: User | null
}

export function useUserInfoCardProps({ user }: UseUserInfoCardPropsInput) {
  const [isEditing, setIsEditing] = useState(false)

  return {
    user,
    isLoading: false,
    error: null,
    displayName: user ? getUserDisplayName(user) : 'Unknown User',
    fullName: user ? getUserDisplayName(user) : '',
    initials: user ? getUserInitials(user) : '??',
    email: user?.email ?? null,
    isEditing,
    onEditClick: () => setIsEditing(true),
    onCancelEdit: () => setIsEditing(false),
    onEditSuccess: () => setIsEditing(false),
  }
}
