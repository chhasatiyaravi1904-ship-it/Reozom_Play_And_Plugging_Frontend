import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios'
import { AxiosError } from 'axios'
import api, {
  TOKEN_STORAGE_KEY,
  IMPERSONATION_TOKEN_KEY,
  getAuthToken,
  impersonationReturnPath,
  isImpersonatingInThisTab,
  isNetworkError,
  setImpersonationToken,
} from '../api'

/** Answers every request with `body`, and remembers the last request config. */
let lastRequest: InternalAxiosRequestConfig | null = null
function respondWith(body: unknown): AxiosAdapter {
  return async (config) => {
    lastRequest = config
    return { data: body, status: 200, statusText: 'OK', headers: {}, config }
  }
}

const originalAdapter = api.defaults.adapter

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  lastRequest = null
})

afterEach(() => {
  api.defaults.adapter = originalAdapter
})

describe('api envelope unwrapping', () => {
  it('returns the inner data of a { success, data } envelope', async () => {
    api.defaults.adapter = respondWith({ success: true, data: { id: 7, name: 'Plan' } })
    const { data } = await api.get('/x')
    expect(data).toEqual({ id: 7, name: 'Plan' })
  })

  it('attaches meta to the unwrapped array (paginated lists)', async () => {
    const meta = { current_page: 2, last_page: 5, per_page: 10, total: 48 }
    api.defaults.adapter = respondWith({ success: true, data: [{ id: 1 }, { id: 2 }], meta })
    const { data } = await api.get('/x')
    expect(Array.isArray(data)).toBe(true)
    expect(data).toHaveLength(2)
    expect((data as any).meta).toEqual(meta)
  })

  it('returns null when the envelope has no data', async () => {
    api.defaults.adapter = respondWith({ success: true, message: 'Deleted' })
    const { data } = await api.get('/x')
    expect(data).toBeNull()
  })

  it('leaves responses without a success flag untouched', async () => {
    const body = { offers: { data: [] }, counts: { received: 0, sent: 0 } }
    api.defaults.adapter = respondWith(body)
    const { data } = await api.get('/x')
    expect(data).toEqual(body)
  })
})

describe('auth token', () => {
  it('sends the stored login token as a bearer header', async () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, 'login-token')
    api.defaults.adapter = respondWith({ success: true, data: null })
    await api.get('/x')
    expect(lastRequest?.headers?.Authorization).toBe('Bearer login-token')
  })

  it('prefers this tab’s "login as user" token over the normal login', () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, 'admin-token')
    setImpersonationToken('user-token', '/admin/listings/3')
    expect(getAuthToken()).toBe('user-token')
    expect(isImpersonatingInThisTab()).toBe(true)
    expect(impersonationReturnPath()).toBe('/admin/listings/3')

    setImpersonationToken(null)
    expect(getAuthToken()).toBe('admin-token')
    expect(sessionStorage.getItem(IMPERSONATION_TOKEN_KEY)).toBeNull()
  })

  it('only returns to admin pages, never an outside URL', () => {
    setImpersonationToken('t', 'https://evil.example.com')
    expect(impersonationReturnPath()).toBe('/admin/users')
  })
})

describe('isNetworkError', () => {
  it('is true only when the server never answered', () => {
    expect(isNetworkError(new AxiosError('down'))).toBe(true)
    const withResponse = new AxiosError('bad', '400', undefined, undefined, {
      status: 400, statusText: 'Bad', headers: {}, config: {} as any, data: {},
    })
    expect(isNetworkError(withResponse)).toBe(false)
    expect(isNetworkError(new Error('x'))).toBe(false)
  })
})
