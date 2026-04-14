import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'
import { NetworkError, ValidationError } from '@/lib/errors/api-error'
import {
  executeFetch,
  parseErrorBody,
  parseSuccessResponse,
  createRefreshManager,
  DEFAULT_TIMEOUT,
  DEFAULT_MAX_RETRIES,
} from '../shared'

// Mock fetch globally
const mockFetch = mock(() => Promise.resolve(new Response()))
const originalFetch = globalThis.fetch

beforeEach(() => {
  globalThis.fetch = mockFetch as unknown as typeof fetch
  mockFetch.mockClear()
})

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe('executeFetch', () => {
  describe('successful requests', () => {
    test('returns response on successful fetch', async () => {
      const mockResponse = new Response('{"data": "test"}', { status: 200 })
      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await executeFetch('https://api.example.com/test', {}, '/test')

      expect(result).toBe(mockResponse)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    test('passes init options to fetch', async () => {
      const mockResponse = new Response('{}', { status: 200 })
      mockFetch.mockResolvedValueOnce(mockResponse)

      const init: RequestInit = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'value' }),
      }

      await executeFetch('https://api.example.com/test', init, '/test')

      expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/test', init)
    })
  })

  describe('retry logic', () => {
    test('retries GET requests on network error with exponential backoff', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(new Response('{}', { status: 200 }))

      const result = await executeFetch(
        'https://api.example.com/test',
        { method: 'GET' },
        '/test',
        { maxRetries: 2 }
      )

      expect(result.status).toBe(200)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    test('throws NetworkError after all retries exhausted for GET', async () => {
      mockFetch.mockRejectedValue(new Error('Connection refused'))

      await expect(
        executeFetch('https://api.example.com/test', { method: 'GET' }, '/test', { maxRetries: 2 })
      ).rejects.toBeInstanceOf(NetworkError)

      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    test('does not retry when request is aborted', async () => {
      const controller = new AbortController()
      controller.abort()

      mockFetch.mockRejectedValueOnce(new Error('Aborted'))

      await expect(
        executeFetch('https://api.example.com/test', { signal: controller.signal }, '/test', {
          maxRetries: 3,
        })
      ).rejects.toThrow('Aborted')

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    test('does not retry POST requests on network error by default', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(
        executeFetch('https://api.example.com/test', { method: 'POST', body: '{}' }, '/test', {
          maxRetries: 3,
        })
      ).rejects.toBeInstanceOf(NetworkError)

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    test('does not retry PATCH requests on network error by default', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(
        executeFetch('https://api.example.com/test', { method: 'PATCH', body: '{}' }, '/test', {
          maxRetries: 3,
        })
      ).rejects.toBeInstanceOf(NetworkError)

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    test('does not retry DELETE requests on network error by default', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(
        executeFetch('https://api.example.com/test', { method: 'DELETE' }, '/test', {
          maxRetries: 3,
        })
      ).rejects.toBeInstanceOf(NetworkError)

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    test('does not retry PUT requests on network error by default', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(
        executeFetch('https://api.example.com/test', { method: 'PUT', body: '{}' }, '/test', {
          maxRetries: 3,
        })
      ).rejects.toBeInstanceOf(NetworkError)

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    test('retries HEAD requests on network error', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(new Response(null, { status: 200 }))

      const result = await executeFetch(
        'https://api.example.com/test',
        { method: 'HEAD' },
        '/test',
        { maxRetries: 2 }
      )

      expect(result.status).toBe(200)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    test('retries OPTIONS requests on network error', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(new Response(null, { status: 200 }))

      const result = await executeFetch(
        'https://api.example.com/test',
        { method: 'OPTIONS' },
        '/test',
        { maxRetries: 2 }
      )

      expect(result.status).toBe(200)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    test('retries POST requests when retryable option is explicitly set', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(new Response('{}', { status: 200 }))

      const result = await executeFetch(
        'https://api.example.com/test',
        { method: 'POST', body: '{}' },
        '/test',
        { maxRetries: 2, retryable: true }
      )

      expect(result.status).toBe(200)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    test('does not retry GET requests when retryable is explicitly false', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(
        executeFetch('https://api.example.com/test', { method: 'GET' }, '/test', {
          maxRetries: 3,
          retryable: false,
        })
      ).rejects.toBeInstanceOf(NetworkError)

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    test('handles case-insensitive method names', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(new Response('{}', { status: 200 }))

      const result = await executeFetch(
        'https://api.example.com/test',
        { method: 'get' },
        '/test',
        { maxRetries: 2 }
      )

      expect(result.status).toBe(200)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    test('defaults to GET method when method is undefined', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(new Response('{}', { status: 200 }))

      const result = await executeFetch('https://api.example.com/test', {}, '/test', {
        maxRetries: 2,
      })

      expect(result.status).toBe(200)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('default values', () => {
    test('uses default max retries', async () => {
      expect(DEFAULT_MAX_RETRIES).toBe(2)
    })

    test('uses default timeout', async () => {
      expect(DEFAULT_TIMEOUT).toBe(30_000)
    })
  })
})

describe('parseErrorBody', () => {
  test('parses JSON error body', async () => {
    const response = new Response('{"error": "Bad Request", "code": "INVALID"}', { status: 400 })

    const result = await parseErrorBody(response)

    expect(result).toEqual({ error: 'Bad Request', code: 'INVALID' })
  })

  test('returns text for non-JSON body', async () => {
    const response = new Response('Internal Server Error', { status: 500 })

    const result = await parseErrorBody(response)

    expect(result).toBe('Internal Server Error')
  })

  test('returns null for empty body', async () => {
    const response = new Response('', { status: 404 })

    const result = await parseErrorBody(response)

    expect(result).toBeNull()
  })

  test('handles malformed JSON gracefully', async () => {
    const response = new Response('{invalid json}', { status: 400 })

    const result = await parseErrorBody(response)

    expect(result).toBe('{invalid json}')
  })
})

describe('parseSuccessResponse', () => {
  test('returns undefined for 204 No Content', async () => {
    const response = new Response(null, { status: 204 })

    const result = await parseSuccessResponse<void>(response, '/test', 'DELETE')

    expect(result).toBeUndefined()
  })

  test('parses JSON response', async () => {
    const data = { id: 1, name: 'Test' }
    const response = Response.json(data, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

    const result = await parseSuccessResponse<typeof data>(response, '/test', 'GET')

    expect(result).toEqual(data)
  })

  test('parses JSON with charset in content-type', async () => {
    const data = { success: true }
    const response = Response.json(data, {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    })

    const result = await parseSuccessResponse<typeof data>(response, '/test', 'GET')

    expect(result).toEqual(data)
  })

  test('throws ValidationError for non-JSON content-type', async () => {
    const response = new Response('<html>Error</html>', {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    })

    await expect(parseSuccessResponse(response, '/test', 'GET')).rejects.toBeInstanceOf(
      ValidationError
    )
  })

  test('throws ValidationError when content-type is missing', async () => {
    const response = new Response('plain text', { status: 200 })

    await expect(parseSuccessResponse(response, '/test', 'GET')).rejects.toBeInstanceOf(
      ValidationError
    )
  })
})

describe('RefreshManager', () => {
  test('executes refresh function once', async () => {
    const manager = createRefreshManager()
    const refreshFn = mock(() => Promise.resolve(true))

    const result = await manager.refresh(refreshFn)

    expect(result).toBe(true)
    expect(refreshFn).toHaveBeenCalledTimes(1)
  })

  test('prevents concurrent refresh calls', async () => {
    const manager = createRefreshManager()
    let callCount = 0

    const refreshFn = mock(async () => {
      callCount++
      await new Promise((resolve) => setTimeout(resolve, 50))
      return true
    })

    // Start multiple concurrent refresh attempts
    const [result1, result2, result3] = await Promise.all([
      manager.refresh(refreshFn),
      manager.refresh(refreshFn),
      manager.refresh(refreshFn),
    ])

    expect(result1).toBe(true)
    expect(result2).toBe(true)
    expect(result3).toBe(true)
    expect(callCount).toBe(1) // Only one actual refresh should happen
  })

  test('allows new refresh after previous completes', async () => {
    const manager = createRefreshManager()
    let callCount = 0

    const refreshFn = mock(async () => {
      callCount++
      return true
    })

    await manager.refresh(refreshFn)
    await manager.refresh(refreshFn)

    expect(callCount).toBe(2)
  })

  test('handles refresh failure', async () => {
    const manager = createRefreshManager()
    const refreshFn = mock(() => Promise.resolve(false))

    const result = await manager.refresh(refreshFn)

    expect(result).toBe(false)
  })

  test('handles refresh error and resets state', async () => {
    const manager = createRefreshManager()
    const error = new Error('Refresh failed')
    const refreshFn = mock(() => Promise.reject(error))

    await expect(manager.refresh(refreshFn)).rejects.toThrow('Refresh failed')

    // After error, should be able to refresh again
    const successFn = mock(() => Promise.resolve(true))
    const result = await manager.refresh(successFn)
    expect(result).toBe(true)
  })

  test('reset clears refresh state', async () => {
    const manager = createRefreshManager()
    let callCount = 0

    const slowRefresh = mock(async () => {
      callCount++
      await new Promise((resolve) => setTimeout(resolve, 100))
      return true
    })

    // Start a refresh but don't await
    const refreshPromise = manager.refresh(slowRefresh)

    // Reset manager
    manager.reset()

    // New refresh should start immediately
    const fastRefresh = mock(() => Promise.resolve(true))
    await manager.refresh(fastRefresh)

    expect(fastRefresh).toHaveBeenCalledTimes(1)

    // Wait for the slow refresh to complete
    await refreshPromise
  })
})
