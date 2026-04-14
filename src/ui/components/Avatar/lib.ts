import { useCallback, useState } from 'react'
import type { AvatarViewProps, OptimizedAvatarProps } from './index'

const SIZE_MAP: Record<string, number> = {
  xs: 16,
  sm: 26,
  md: 38,
  lg: 56,
  xl: 84,
}

export function useAvatarProps({
  src,
  alt,
  size = 'md',
  radius = 'xl',
  color = 'blue',
  children,
  ...props
}: OptimizedAvatarProps): AvatarViewProps {
  const [hasError, setHasError] = useState(false)

  const pixelSize = typeof size === 'number' ? size : (SIZE_MAP[size] ?? 38)

  const handleError = useCallback(() => {
    setHasError(true)
  }, [])

  return {
    src,
    alt,
    size,
    radius,
    color,
    children,
    hasError,
    pixelSize,
    onError: handleError,
    ...props,
  }
}
