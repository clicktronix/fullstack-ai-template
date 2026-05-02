import type { MetadataRoute } from 'next'
import { getPublicEnv } from '@/infrastructure/env/public'

const BASE_URL = getPublicEnv().NEXT_PUBLIC_SITE_URL ?? 'https://example.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/profile/', '/auth/'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
