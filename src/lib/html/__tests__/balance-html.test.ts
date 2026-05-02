import { describe, expect, test } from 'bun:test'
import { balanceHtml } from '../balance-html'

describe('balanceHtml', () => {
  describe('unclosed tags', () => {
    test('closes single unclosed tag', () => {
      expect(balanceHtml('<h2>Hello')).toBe('<h2>Hello</h2>')
    })

    test('closes multiple unclosed tags in reverse order', () => {
      expect(balanceHtml('<p>Text <strong>bold')).toBe('<p>Text <strong>bold</strong></p>')
    })

    test('closes deeply nested unclosed tags', () => {
      expect(balanceHtml('<div><p><span>text')).toBe('<div><p><span>text</span></p></div>')
    })

    test('handles partial tag content (streaming scenario)', () => {
      expect(balanceHtml('<h2>Part 2 - Ramp')).toBe('<h2>Part 2 - Ramp</h2>')
    })
  })

  describe('already balanced HTML', () => {
    test('returns unchanged if all tags are closed', () => {
      expect(balanceHtml('<p>Hello</p>')).toBe('<p>Hello</p>')
    })

    test('returns unchanged for nested balanced tags', () => {
      expect(balanceHtml('<div><p>Text</p></div>')).toBe('<div><p>Text</p></div>')
    })

    test('returns unchanged for empty string', () => {
      expect(balanceHtml('')).toBe('')
    })

    test('returns unchanged for plain text', () => {
      expect(balanceHtml('Hello world')).toBe('Hello world')
    })
  })

  describe('void tags', () => {
    test('ignores br tags', () => {
      expect(balanceHtml('<p>Line 1<br>Line 2')).toBe('<p>Line 1<br>Line 2</p>')
    })

    test('ignores hr tags', () => {
      expect(balanceHtml('<div><hr>Content')).toBe('<div><hr>Content</div>')
    })

    test('ignores img tags', () => {
      expect(balanceHtml('<p>Text <img src="x"> more')).toBe('<p>Text <img src="x"> more</p>')
    })

    test('ignores input tags', () => {
      expect(balanceHtml('<form><input type="text">')).toBe('<form><input type="text"></form>')
    })
  })

  describe('self-closing tags', () => {
    test('ignores self-closing syntax', () => {
      expect(balanceHtml('<div><br/><span>text')).toBe('<div><br/><span>text</span></div>')
    })

    test('ignores self-closing with space', () => {
      expect(balanceHtml('<p><img src="x" />')).toBe('<p><img src="x" /></p>')
    })
  })

  describe('closing tags handling', () => {
    test('handles orphan closing tag gracefully', () => {
      // Orphan closing tag doesn't break anything
      expect(balanceHtml('</p>text')).toBe('</p>text')
    })

    test('handles extra closing tags', () => {
      expect(balanceHtml('<p>text</p></p>')).toBe('<p>text</p></p>')
    })

    test('closes tags opened after a closing tag', () => {
      expect(balanceHtml('<p>first</p><p>second')).toBe('<p>first</p><p>second</p>')
    })
  })

  describe('tags with attributes', () => {
    test('handles tags with class attribute', () => {
      expect(balanceHtml('<div class="container"><p>text')).toBe(
        '<div class="container"><p>text</p></div>'
      )
    })

    test('handles tags with multiple attributes', () => {
      expect(balanceHtml('<a href="/link" target="_blank">click')).toBe(
        '<a href="/link" target="_blank">click</a>'
      )
    })

    test('handles tags with data attributes', () => {
      expect(balanceHtml('<div data-id="123"><span>text')).toBe(
        '<div data-id="123"><span>text</span></div>'
      )
    })
  })

  describe('mixed content', () => {
    test('handles text before and after tags', () => {
      expect(balanceHtml('Before <strong>bold')).toBe('Before <strong>bold</strong>')
    })

    test('handles complex mixed content', () => {
      expect(balanceHtml('<p>Hello <em>world</em> and <strong>more')).toBe(
        '<p>Hello <em>world</em> and <strong>more</strong></p>'
      )
    })

    test('handles list items', () => {
      expect(balanceHtml('<ul><li>Item 1<li>Item 2')).toBe(
        '<ul><li>Item 1<li>Item 2</li></li></ul>'
      )
    })
  })

  describe('case insensitivity', () => {
    test('handles uppercase tags', () => {
      expect(balanceHtml('<DIV><P>text')).toBe('<DIV><P>text</p></div>')
    })

    test('handles mixed case tags', () => {
      expect(balanceHtml('<Div><SPAN>text')).toBe('<Div><SPAN>text</span></div>')
    })
  })

  describe('edge cases', () => {
    test('handles angle brackets in text', () => {
      expect(balanceHtml('<p>5 > 3 and 2 < 4')).toBe('<p>5 > 3 and 2 < 4</p>')
    })

    test('handles multiple calls (regex state reset)', () => {
      expect(balanceHtml('<p>first')).toBe('<p>first</p>')
      expect(balanceHtml('<div>second')).toBe('<div>second</div>')
      expect(balanceHtml('<span>third')).toBe('<span>third</span>')
    })
  })
})
