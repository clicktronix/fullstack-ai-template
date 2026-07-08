// Self-closing tags that don't need closing (module-level for performance)
const VOID_TAGS = new Set(['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col'])

// Match opening and closing tags
// Using non-capturing group with specific character class to avoid regex backtracking
const TAG_PATTERN = /<\/?([a-zA-Z][a-zA-Z0-9]*)(?:\s[^>]*)?\/?>/g

/**
 * Balance HTML by closing unclosed tags.
 * Used during SSE streaming to prevent broken rendering.
 *
 * Problem: When streaming "<h2>Part 2", the browser auto-closes it.
 * Then the remaining text arrives as an orphan closing tag.
 *
 * Solution: Detect unclosed tags and add closing tags before rendering.
 *
 * @param html - Partial HTML string from streaming
 * @returns HTML with unclosed tags properly closed
 *
 * @example
 * ```ts
 * balanceHtml('<h2>Hello')
 * // Returns: '<h2>Hello</h2>'
 *
 * balanceHtml('<p>Text <strong>bold')
 * // Returns: '<p>Text <strong>bold</strong></p>'
 * ```
 */
export function balanceHtml(html: string): string {
  // Track open tags stack
  const openTags: string[] = []

  // Reset regex state for each call (global regex keeps lastIndex)
  TAG_PATTERN.lastIndex = 0

  let match: RegExpExecArray | null
  while ((match = TAG_PATTERN.exec(html)) !== null) {
    const fullMatch = match[0]
    const tagName = match[1].toLowerCase()

    // Skip void tags and self-closing tags
    if (VOID_TAGS.has(tagName) || fullMatch.endsWith('/>')) {
      continue
    }

    if (fullMatch.startsWith('</')) {
      // Closing tag - pop from stack if it matches
      const lastOpenIndex = openTags.lastIndexOf(tagName)
      if (lastOpenIndex !== -1) {
        // Remove this tag and all tags opened after it (implicit closing)
        openTags.splice(lastOpenIndex)
      }
    } else {
      // Opening tag - push to stack
      openTags.push(tagName)
    }
  }

  // Generate closing tags in reverse order (LIFO)
  if (openTags.length === 0) {
    return html
  }

  const closingTags = [...openTags]
    .toReversed()
    .map((tag) => `</${tag}>`)
    .join('')

  return html + closingTags
}
