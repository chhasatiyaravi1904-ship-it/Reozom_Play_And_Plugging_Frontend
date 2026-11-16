import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import * as authService from '@/services/authService'
import {
  isNetworkError,
  TOKEN_STORAGE_KEY,
  getAuthToken,
  isImpersonatingInThisTab,
  setImpersonationToken,
  impersonationReturnPath,
} from '@/services/api'
import { sampleUser } from '@/services/sampleData'
import type { LoginPayload, RegisterPayload, User } from '@/types/auth'

const TOKEN_KEY = TOKEN_STORAGE_KEY

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  // This tab's "login as user" token wins over the normal login (see services/api.ts)
  const token = ref<string | null>(getAuthToken())
  const status = ref<'idle' | 'loading' | 'error'>('idle')
  const error = ref<string | null>(null)
  const requires2fa = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  function setSession(nextToken: string, nextUser: User) {
    token.value = nextToken
    user.value = nextUser
    localStorage.setItem(TOKEN_KEY, nextToken)
  }

  function clearSession() {
    token.value = null
    user.value = null
    // A failed "login as user" session must not log the admin out of their other tabs
    if (isImpersonatingInThisTab()) {
      setImpersonationToken(null)
      return
    }
    localStorage.removeItem(TOKEN_KEY)
  }

  async function login(payload: LoginPayload) {
    status.value = 'loading'
    error.value = null
    try {
      const { data } = await authService.login(payload)
      
      if (data.requires_2fa) {
        requires2fa.value = true
        status.value = 'idle'
        return '2fa'
      }

      setSession(data.token as string, data.user as User)
      status.value = 'idle'
      return 'success'
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

  async function verify2fa(payload: { email: string; code: string }) {
    status.value = 'loading'
    error.value = null
    try {
      const { data } = await authService.verify2fa(payload)
      setSession(data.token as string, data.user as User)
      requires2fa.value = false
      status.value = 'idle'
      return true
    } catch (err) {
      status.value = 'error'
      error.value = extractErrorMessage(err)
      return false
    }
  }

  async function resend2fa(email: string) {
    status.value = 'loading'
    error.value = null
    try {
      await authService.resend2fa(email)
      status.value = 'idle'
      return true
    } catch (err) {
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
    // Logging out of a "login as user" session returns the admin to their own account
    if (isImpersonating.value) {
      const backTo = await stopImpersonation()
      // Full navigation so callers' "go to login page" redirects don't apply to the restored admin
      window.location.assign(backTo)
      return
    }
    try {
      if (token.value) await authService.logout()
    } finally {
      clearSession()
    }
  }

  // --- Admin "Login as user" (original Reozom: temporary login from the administration) ---

  // Only true in the tab where the admin started "login as user"; other tabs keep the admin session
  const impersonationActive = ref(isImpersonatingInThisTab())
  const isImpersonating = computed(() => impersonationActive.value || !!user.value?.impersonatedBy)

  /**
   * Admin only: switch THIS TAB to a temporary session as the user. The token lives in
   * sessionStorage, so the admin's login (localStorage) and other tabs are not affected.
   */
  async function startImpersonation(userId: number, returnTo = '/admin/users') {
    const { data } = await authService.impersonateUser(userId)
    setImpersonationToken(data.token, returnTo)
    impersonationActive.value = true
    token.value = data.token
    user.value = { ...data.user, impersonatedBy: data.impersonatedBy }
    return data.user
  }

  /**
   * End the "login as user" session in this tab and go back to the admin's own session.
   * Returns the admin page it was started from (e.g. the listing detail page).
   */
  async function stopImpersonation(): Promise<string> {
    const backTo = impersonationReturnPath()
    try {
      await authService.stopImpersonation()
    } catch {
      // The temporary token may already have expired; restoring the admin session is what matters
    }

    setImpersonationToken(null)
    impersonationActive.value = false
    token.value = localStorage.getItem(TOKEN_KEY)
    user.value = null
    if (token.value) await loadCurrentUser()
    return backTo
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
    requires2fa,
    isAuthenticated,
    login,
    verify2fa,
    resend2fa,
    register,
    logout,
    loadCurrentUser,
    loginWithToken,
    isImpersonating,
    startImpersonation,
    stopImpersonation,
  }
})
