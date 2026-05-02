'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export type WorkItemDetailModalProps = {
  id: string
}

export type WorkItemDetailModalViewProps = {
  id: string
  opened: boolean
  onClose: () => void
}

export function useWorkItemDetailModalProps({
  id,
}: WorkItemDetailModalProps): WorkItemDetailModalViewProps {
  const router = useRouter()

  const onClose = useCallback(() => {
    router.back()
  }, [router])

  return {
    id,
    opened: true,
    onClose,
  }
}
