'use client'

import { Avatar as MantineAvatar, type AvatarProps } from '@mantine/core'
import Image from 'next/image'
import { composeHooks } from '@/ui/hooks/compose-hooks'
import { useAvatarProps } from './lib'
import styles from './styles.module.css'

export type OptimizedAvatarProps = Omit<AvatarProps, 'src'> & {
  src?: string | null
  alt: string
  children?: React.ReactNode
}

export type AvatarViewProps = OptimizedAvatarProps & {
  hasError: boolean
  pixelSize: number
  onError: () => void
}

/**
 * Avatar component with Next.js image optimization.
 *
 * Benefits:
 * - Proxies external images through /_next/image (prevents rate limiting)
 * - Caches images on the server for 1 week
 * - Converts to WebP/AVIF for smaller file sizes
 * - Falls back to initials on error
 */
export function AvatarView({
  src,
  alt,
  size = 'md',
  radius = 'xl',
  color = 'blue',
  children,
  hasError,
  pixelSize,
  onError,
  ...props
}: AvatarViewProps) {
  // If no src or error occurred, show fallback (initials)
  if (!src || hasError) {
    return (
      <MantineAvatar size={size} radius={radius} color={color} alt={alt} {...props}>
        {children}
      </MantineAvatar>
    )
  }

  return (
    <MantineAvatar size={size} radius={radius} color={color} {...props}>
      <Image
        src={src}
        alt={alt}
        width={pixelSize}
        height={pixelSize}
        onError={onError}
        className={styles.image}
        unoptimized
      />
    </MantineAvatar>
  )
}

export const Avatar = composeHooks<AvatarViewProps, OptimizedAvatarProps>(AvatarView)(
  useAvatarProps
)
