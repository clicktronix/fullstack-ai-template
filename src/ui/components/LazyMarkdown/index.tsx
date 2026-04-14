'use client'

import { Skeleton } from '@mantine/core'
import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import type ReactMarkdownType from 'react-markdown'

/**
 * Lazy-loaded Markdown renderer.
 *
 * Dynamically imports `react-markdown` and `remark-gfm` to reduce initial bundle size.
 * Renders a skeleton placeholder while the chunk is loading.
 */

export type LazyMarkdownProps = ComponentProps<typeof ReactMarkdownType>

function MarkdownSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }, (_, i) => (
        <Skeleton key={i} height={12} radius="sm" mb={8} width={i === 2 ? '60%' : '100%'} />
      ))}
    </>
  )
}

const MarkdownRenderer = dynamic(
  () => import('./renderer').then((m) => ({ default: m.MarkdownRenderer })),
  {
    ssr: false,
    loading: () => <MarkdownSkeleton />,
  }
)

export function LazyMarkdown(props: LazyMarkdownProps) {
  return <MarkdownRenderer {...props} />
}
