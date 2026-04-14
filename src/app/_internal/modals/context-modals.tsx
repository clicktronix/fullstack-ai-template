'use client'

import type { FC } from 'react'

/**
 * Template-level modal registry.
 *
 * Keep only stub entries required for compile-time compatibility with the
 * legacy example surface that still exists in the repository. The stubs avoid
 * importing old modal implementations into the active template runtime.
 */
const UnsupportedTemplateModal: FC = () => null

export const appContextModals = {
  createCampaign: UnsupportedTemplateModal,
  editCampaign: UnsupportedTemplateModal,
  addBlogToCampaign: UnsupportedTemplateModal,
  addToCampaign: UnsupportedTemplateModal,
}

declare module '@mantine/modals' {
  // interface required by Mantine module augmentation
  export interface MantineModalsOverride {
    modals: typeof appContextModals
  }
}
