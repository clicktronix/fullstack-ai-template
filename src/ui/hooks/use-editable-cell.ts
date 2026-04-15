import { useDisclosure } from '@mantine/hooks'
import { useEffect, useRef, useState } from 'react'

type UseEditableCellOptions<T> = {
  initializer: () => T
  dependencies: unknown[]
}

/**
 * Shallow-сравнение двух массивов зависимостей.
 * Сравнивает по длине и по строгому равенству каждого элемента.
 */
function areDepsEqual(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) return false
  for (const [i, element] of a.entries()) {
    if (element !== b[i]) return false
  }
  return true
}

/**
 * Hook for managing editable cell state in data tables.
 *
 * Automatically syncs local state with source data when popover opens.
 * Uses Mantine's useDisclosure for open/close state management.
 *
 * @example
 * ```tsx
 * const { opened, value, setValue, open, close } = useEditableCell({
 *   initializer: () => workItem.labels?.map((l) => l.id) ?? [],
 *   dependencies: [workItem.labels],
 * })
 * ```
 */
export function useEditableCell<T>({ initializer, dependencies }: UseEditableCellOptions<T>) {
  const [opened, { open, close }] = useDisclosure(false)
  const [value, setValue] = useState<T>(initializer())

  // Store initializer in ref for stable reference (updated in effect, not during render)
  const initializerFnRef = useRef(initializer)
  useEffect(() => {
    initializerFnRef.current = initializer
  }, [initializer])

  // State-based dependency tracking: increment counter when deps change shallowly.
  // Uses useEffect to avoid reading/writing refs during render (react-hooks/refs).
  const [depsVersion, setDepsVersion] = useState(0)
  const prevDepsRef = useRef(dependencies)

  // Intentionally no deps: runs every render to detect shallow changes in dynamic dependency array.
  // setDepsVersion only fires when deps actually change (guarded by areDepsEqual).
  // NOTE: This is the correct pattern for tracking a dynamic-length dependency array that
  // cannot be statically listed in useEffect deps. Alternative approaches (JSON.stringify,
  // custom hook) add overhead without benefit here.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!areDepsEqual(prevDepsRef.current, dependencies)) {
      prevDepsRef.current = dependencies
      setDepsVersion((v) => v + 1)
    }
  })

  // Reinitialize when opened or dependencies change
  useEffect(() => {
    if (opened) {
      setValue(initializerFnRef.current())
    }
  }, [opened, depsVersion])

  return { opened, value, setValue, open, close }
}
