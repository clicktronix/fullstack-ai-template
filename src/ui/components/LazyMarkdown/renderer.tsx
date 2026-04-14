'use client'

import type { ComponentProps } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type MarkdownRendererProps = ComponentProps<typeof Markdown>

/**
 * Internal renderer for LazyMarkdown.
 *
 * This file is dynamically imported so `react-markdown` and `remark-gfm`
 * land in a separate chunk and are not included in the main bundle.
 */
export function MarkdownRenderer({ remarkPlugins, ...props }: MarkdownRendererProps) {
  const plugins = remarkPlugins ? [remarkGfm, ...remarkPlugins] : [remarkGfm]

  return <Markdown remarkPlugins={plugins} {...props} />
}
