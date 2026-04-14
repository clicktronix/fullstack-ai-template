/**
 * API configuration for external API calls (e.g., AI services).
 * Not used for Supabase - use adapters/supabase/client.ts or server.ts instead.
 *
 * Currently unused - reserved for future external API integrations.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

/**
 * Check if running in production environment.
 */
export const isProduction = process.env.NODE_ENV === 'production'

/**
 * Check if running in development environment.
 */
export const isDevelopment = process.env.NODE_ENV === 'development'
