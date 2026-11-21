import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/services/authService', () => ({
  login: vi.fn(),
  verify2fa: vi.fn(),
  logout: vi.fn(),
  fetchCurrentUser: vi.fn(),
}))

import * as authService from '@/services/authService'
import { useAuthStore, SIGN_PROMPT_KEY } from '../auth'
import { TOKEN_STORAGE_KEY, setImpersonationToken } from '@/services/api'

const seller = { id: 4, name: 'Seller', email: 'seller@example.com', role: 'seller_buyer' }
const admin = { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' }

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  sessionStorage.clear()
  vi.resetAllMocks()
})

describe('auth store login', () => {
  it('stores the token and user, and asks to show the signing pop-up', async () => {
    vi.mocked(authService.login).mockResolvedValue({ data: { token: 't-1', user: seller } } as any)
    const store = useAuthStore()

    expect(await store.login({ email: seller.email, password: 'x' } as any)).toBe('success')
    expect(store.isAuthenticated).toBe(true)
    expect(store.user?.email).toBe(seller.email)
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBe('t-1')
    expect(sessionStorage.getItem(SIGN_PROMPT_KEY)).toBe('1')
  })

  it('does not ask admins to sign listing documents', async () => {
    vi.mocked(authService.login).mockResolvedValue({ data: { token: 't-a', user: admin } } as any)
    await useAuthStore().login({ email: admin.email, password: 'x' } as any)
    expect(sessionStorage.getItem(SIGN_PROMPT_KEY)).toBeNull()
  })

  it('waits for the 2FA code before logging in', async () => {
    vi.mocked(authService.login).mockResolvedValue({ data: { requires_2fa: true } } as any)
    const store = useAuthStore()

    expect(await store.login({ email: seller.email, password: 'x' } as any)).toBe('2fa')
    expect(store.requires2fa).toBe(true)
    expect(store.isAuthenticated).toBe(false)

    vi.mocked(authService.verify2fa).mockResolvedValue({ data: { token: 't-2', user: seller } } as any)
    expect(await store.verify2fa({ email: seller.email, code: '123456' })).toBe(true)
    expect(store.isAuthenticated).toBe(true)
    expect(store.requires2fa).toBe(false)
  })

  it('shows the server message when login fails', async () => {
    vi.mocked(authService.login).mockRejectedValue({ response: { status: 422, data: { message: 'Wrong password' } } })
    const store = useAuthStore()

    expect(await store.login({ email: seller.email, password: 'bad' } as any)).toBe(false)
    expect(store.status).toBe('error')
    expect(store.error).toBe('Wrong password')
    expect(store.isAuthenticated).toBe(false)
  })
})

describe('auth store logout', () => {
  it('clears the session', async () => {
    vi.mocked(authService.login).mockResolvedValue({ data: { token: 't-1', user: seller } } as any)
    vi.mocked(authService.logout).mockResolvedValue({} as any)
    const store = useAuthStore()
    await store.login({ email: seller.email, password: 'x' } as any)

    await store.logout()
    expect(store.isAuthenticated).toBe(false)
    expect(store.user).toBeNull()
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull()
  })

  it('a failed "login as user" session never logs the admin out of other tabs', async () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, 'admin-token')
    setImpersonationToken('user-token')
    vi.mocked(authService.fetchCurrentUser).mockRejectedValue(new Error('expired'))
    const store = useAuthStore()

    await store.loadCurrentUser()
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBe('admin-token')
  })
})
