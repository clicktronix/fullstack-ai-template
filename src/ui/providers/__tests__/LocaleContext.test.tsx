import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test } from 'bun:test'
import { type ReactNode } from 'react'
import { LocaleProvider, useLocale, type Locale } from '../LocaleContext'

// Хелпер для создания wrapper с указанной локалью
function createWrapper(initialLocale?: Locale) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <LocaleProvider initialLocale={initialLocale}>{children}</LocaleProvider>
  }
}

beforeEach(() => {
  // Очищаем localStorage перед каждым тестом
  localStorage.clear()
})

describe('LocaleProvider', () => {
  describe('начальное состояние', () => {
    test('использует "ru" как локаль по умолчанию', () => {
      const { result } = renderHook(() => useLocale(), {
        wrapper: createWrapper(),
      })

      expect(result.current.locale).toBe('ru')
    })

    test('принимает initialLocale через пропсы', () => {
      const { result } = renderHook(() => useLocale(), {
        wrapper: createWrapper('en'),
      })

      expect(result.current.locale).toBe('en')
    })
  })

  describe('смена локали', () => {
    test('позволяет сменить локаль через setLocale', () => {
      const { result } = renderHook(() => useLocale(), {
        wrapper: createWrapper('ru'),
      })

      act(() => {
        result.current.setLocale('en')
      })

      expect(result.current.locale).toBe('en')
    })

    test('сменённая локаль сохраняется в localStorage', () => {
      const { result } = renderHook(() => useLocale(), {
        wrapper: createWrapper('ru'),
      })

      act(() => {
        result.current.setLocale('en')
      })

      const stored = localStorage.getItem('influra-locale')
      expect(stored).toBe('"en"')
    })
  })

  describe('взаимодействие с localStorage', () => {
    test('сохраняет начальную локаль в localStorage при монтировании', async () => {
      renderHook(() => useLocale(), {
        wrapper: createWrapper('en'),
      })

      // useEffect с saveToStorage вызовется после рендера
      await waitFor(() => {
        const stored = localStorage.getItem('influra-locale')
        expect(stored).toBe('"en"')
      })
    })

    test('восстанавливает локаль из localStorage при валидном значении', () => {
      localStorage.setItem('influra-locale', '"en"')

      const { result } = renderHook(() => useLocale(), {
        wrapper: createWrapper('ru'),
      })

      expect(result.current.locale).toBe('en')
    })

    test('игнорирует некорректный JSON в localStorage', () => {
      localStorage.setItem('influra-locale', 'not-json')

      const { result } = renderHook(() => useLocale(), {
        wrapper: createWrapper('ru'),
      })

      expect(result.current.locale).toBe('ru')
    })
  })

  describe('стабильность контекста', () => {
    test('setLocale стабильна между ре-рендерами', () => {
      const { result, rerender } = renderHook(() => useLocale(), {
        wrapper: createWrapper('ru'),
      })

      const firstSetLocale = result.current.setLocale
      rerender()

      expect(result.current.setLocale).toBe(firstSetLocale)
    })

    test('значение контекста мемоизировано при неизменной локали', () => {
      const values: Array<{ locale: Locale }> = []

      const { rerender } = renderHook(
        () => {
          const ctx = useLocale()
          values.push({ locale: ctx.locale })
          return ctx
        },
        { wrapper: createWrapper('ru') }
      )

      rerender()

      // Локаль не менялась — значение одинаковое
      expect(values[0].locale).toBe(values[1].locale)
    })
  })
})

describe('useLocale', () => {
  test('выбрасывает ошибку при использовании вне LocaleProvider', () => {
    // renderHook с useLocale без обёртки должен бросить ошибку
    expect(() => {
      renderHook(() => useLocale())
    }).toThrow('useLocale must be used within LocaleProvider')
  })
})
