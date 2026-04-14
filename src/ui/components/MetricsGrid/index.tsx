import { SimpleGrid } from '@mantine/core'
import type { MantineBreakpoint } from '@mantine/core'
import type { ReactNode } from 'react'

type ResponsiveCols = Partial<Record<MantineBreakpoint, number>>

type MetricsGridProps = {
  children: ReactNode
  columns?: number | ResponsiveCols
}

export function MetricsGrid({ children, columns = { base: 2, sm: 3 } }: MetricsGridProps) {
  return (
    <SimpleGrid cols={columns} spacing="sm">
      {children}
    </SimpleGrid>
  )
}
