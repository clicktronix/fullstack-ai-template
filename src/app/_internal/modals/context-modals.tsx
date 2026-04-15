'use client'

import type { FC } from 'react'

const PlaceholderModal: FC = () => null

export const appContextModals = {
  placeholder: PlaceholderModal,
}

declare module '@mantine/modals' {
  // interface required by Mantine module augmentation
  export interface MantineModalsOverride {
    modals: typeof appContextModals
  }
}
