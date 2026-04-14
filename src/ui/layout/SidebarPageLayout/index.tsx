import { Box } from '@mantine/core'
import type { ReactNode } from 'react'
import styles from './styles.module.css'

type SidebarPageLayoutWidth = 'compact' | 'default' | 'wide'

type SidebarPageLayoutProps = {
  sidebar: ReactNode
  children: ReactNode
  sidebarAriaLabel?: string
  sidebarWidth?: SidebarPageLayoutWidth
}

export function SidebarPageLayout({
  sidebar,
  children,
  sidebarAriaLabel,
  sidebarWidth = 'compact',
}: SidebarPageLayoutProps) {
  return (
    <Box className={styles.container}>
      <Box
        component={sidebarAriaLabel ? 'nav' : 'aside'}
        className={styles.sidebar}
        data-width={sidebarWidth}
        aria-label={sidebarAriaLabel}
      >
        {sidebar}
      </Box>

      <Box component="section" className={styles.content}>
        {children}
      </Box>
    </Box>
  )
}
