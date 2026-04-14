/**
 * Stream headers utilities for SSE (Server-Sent Events).
 * Shared between client-side fetch and server-side proxy.
 */

/**
 * SSE Response headers for Next.js API routes.
 * These headers ensure proper streaming without buffering.
 */
export const SSE_RESPONSE_HEADERS = {
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Cache-Control': 'no-cache, no-transform',
  Connection: 'keep-alive',
  'X-Accel-Buffering': 'no', // Disable nginx buffering
} as const

/**
 * Base headers for SSE requests.
 * Used by both client-side fetch and server-side proxy.
 */
export function buildBaseStreamHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    Accept: 'text/event-stream; charset=utf-8',
  }
}

/**
 * Build headers for client-side stream requests.
 */
export function buildClientStreamHeaders(): HeadersInit {
  return buildBaseStreamHeaders()
}
