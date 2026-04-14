'use client'

import { createContext, use } from 'react'

type CellEditingContextValue = {
  onCellEditStart: () => void
  onCellEditEnd: () => void
}

export const CellEditingContext = createContext<CellEditingContextValue>({
  onCellEditStart: () => {},
  onCellEditEnd: () => {},
})

export function useCellEditing() {
  return use(CellEditingContext)
}
