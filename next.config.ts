import { withSentryConfig } from '@sentry/nextjs'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: [
      '@mantine/core',
      '@mantine/hooks',
      '@mantine/form',
      '@mantine/modals',
      '@mantine/charts',
      '@mantine/notifications',
      '@tabler/icons-react',
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      '@dnd-kit/utilities',
      'react-intl',
      'dayjs',
      'valibot',
      '@tanstack/react-query',
      'zustand',
    ],
  },
  trailingSlash: true,
  // Avoid Next.js automatically redirecting /api/* to add/remove trailing slashes.
  // This prevents redirect ping-pong when backend canonicalization differs.
  skipTrailingSlashRedirect: true,
  images: {
    /**
     * Enable image optimization for external avatars.
     * This proxies requests through /_next/image which:
     * - Caches images on the server (prevents rate limiting from Google)
     * - Optimizes format (WebP/AVIF)
     * - Resizes to requested dimensions
     */
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/**',
      },
    ],
    // Cache optimized images for 1 week (in seconds)
    minimumCacheTTL: 60 * 60 * 24 * 7,
  },
}

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: process.env.SENTRY_ORG ?? 'replace-me',

  project: process.env.SENTRY_PROJECT ?? 'replace-me',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
})
