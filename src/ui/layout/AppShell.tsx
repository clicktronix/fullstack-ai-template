'use client'

import { AppShell as MantineAppShell } from '@mantine/core'
import type { ReactNode } from 'react'
import { Header } from '@/ui/components/Header'
import { TranslationText } from '@/ui/components/TranslationText'
import styles from './AppShell.module.css'
import messages from './messages.json'

const HEADER_CONFIG = { height: { base: 48, sm: 60 } }

type AppShellProps = {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <MantineAppShell id="app-shell" header={HEADER_CONFIG} padding={0} transitionDuration={200}>
      <a href="#main-content" className={styles.skipToContent}>
        <TranslationText {...messages.skipToContent} />
      </a>
      <MantineAppShell.Header className={styles.header}>
        <Header />
      </MantineAppShell.Header>
      <MantineAppShell.Main id="main-content" className={styles.main}>
        {children}
      </MantineAppShell.Main>
    </MantineAppShell>
  )
}
