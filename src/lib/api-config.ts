import { getPublicEnv } from '@/infrastructure/env/public'
import { isDevelopmentEnvironment, isProductionEnvironment } from '@/infrastructure/env/runtime'

/**
 * API configuration for external API calls (e.g., AI services).
 * Not used for Supabase - use adapters/supabase/client.ts or server.ts instead.
 *
 * Currently unused - reserved for future external API integrations.
 */
export const API_BASE_URL = getPublicEnv().NEXT_PUBLIC_API_URL ?? ''

/**
 * Check if running in production environment.
 */
export const isProduction = isProductionEnvironment()

/**
 * Check if running in development environment.
 */
export const isDevelopment = isDevelopmentEnvironment()
