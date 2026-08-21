import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as authService from '@/services/authService'
import { isNetworkError, TOKEN_STORAGE_KEY } from '@/services/api'
import { sampleUser } from '@/services/sampleData'
import type { LoginPayload, RegisterPayload, User } from '@/types/auth'

const TOKEN_KEY = TOKEN_STORAGE_KEY

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const status = ref<'idle' | 'loading' | 'error'>('idle')
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  function setSession(nextToken: string, nextUser: User) {
    token.value = nextToken
    user.value = nextUser
    localStorage.setItem(TOKEN_KEY, nextToken)
  }

  function clearSession() {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  async function login(payload: LoginPayload) {
    status.value = 'loading'
    error.value = null
    try {
      const { data } = await authService.login(payload)
      setSession(data.token, data.user)
      status.value = 'idle'
      return true
    } catch (err) {
      // DEV fallback: no Laravel API running yet, so allow the seller journey
      // to be previewed locally. Remove once the backend is live.
      if (import.meta.env.DEV && isNetworkError(err)) {
        setSession('demo-token', { ...sampleUser, email: payload.email })
        status.value = 'idle'
        return true
      }
      status.value = 'error'
      error.value = extractErrorMessage(err)
      return false
    }
  }

  async function register(payload: RegisterPayload): Promise<'active' | 'pending' | false> {
    status.value = 'loading'
    error.value = null
    try {
      const { data } = await authService.register(payload)
      status.value = 'idle'
      if (data.pendingApproval || !data.token) {
        return 'pending'
      }
      setSession(data.token, data.user)
      return 'active'
    } catch (err) {
      if (import.meta.env.DEV && isNetworkError(err)) {
        setSession('demo-token', {
          ...sampleUser,
          fullName: `${payload.firstName} ${payload.lastName}`.trim(),
          email: payload.email,
          phone: payload.phone,
        })
        status.value = 'idle'
        return 'active'
      }
      status.value = 'error'
      error.value = extractErrorMessage(err)
      return false
    }
  }

  async function logout() {
    try {
      if (token.value) await authService.logout()
    } finally {
      clearSession()
    }
  }

  async function loadCurrentUser() {
    if (!token.value) return
    try {
      const { data } = await authService.fetchCurrentUser()
      user.value = data
    } catch {
      clearSession()
    }
  }

  /** Used by the OAuth callback landing page — the backend already minted a
   * token during the provider redirect round trip, so there's no
   * credentials payload to post, just a token to adopt and a profile to
   * fetch. */
  async function loginWithToken(nextToken: string) {
    token.value = nextToken
    localStorage.setItem(TOKEN_KEY, nextToken)
    await loadCurrentUser()
    return !!user.value
  }

  function extractErrorMessage(err: unknown): string {
    const maybeAxiosError = err as { response?: { data?: { message?: string } } }
    return (
      maybeAxiosError.response?.data?.message || 'We could not reach the server. Please try again.'
    )
  }

  return {
    user,
    token,
    status,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    loadCurrentUser,
    loginWithToken,
  }
})
