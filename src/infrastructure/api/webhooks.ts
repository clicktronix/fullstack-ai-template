import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'

function normalizeSignature(signature: string): string {
  return signature.startsWith('sha256=') ? signature.slice('sha256='.length) : signature
}

function isHexSignature(value: string): boolean {
  return /^[\da-f]+$/i.test(value)
}

export function verifyWebhookSignature(payload: string, signature: string | null, secret: string) {
  if (!signature) return false

  const expected = createHmac('sha256', secret).update(payload).digest('hex')
  const received = normalizeSignature(signature)

  if (received.length !== expected.length || !isHexSignature(received)) return false

  return timingSafeEqual(Buffer.from(received, 'hex'), Buffer.from(expected, 'hex'))
}
