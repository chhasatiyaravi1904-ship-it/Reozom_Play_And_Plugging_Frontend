import axios from 'axios'

export const TOKEN_STORAGE_KEY = 'reozom_seller_token'

/**
 * "Login as user" token. Kept in sessionStorage so it only applies to the tab where the admin
 * started it; the admin's own token in localStorage (and every other tab) is never touched.
 */
export const IMPERSONATION_TOKEN_KEY = 'reozom_impersonation_token'

function readSession(key: string): string | null {
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}

/** The token for this tab: the "login as user" token if one is active here, otherwise the normal login. */
export function getAuthToken(): string | null {
  return readSession(IMPERSONATION_TOKEN_KEY) || localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function isImpersonatingInThisTab(): boolean {
  return !!readSession(IMPERSONATION_TOKEN_KEY)
}

/** Admin page to go back to when "Return to admin" is used (e.g. the listing it was started from). */
const IMPERSONATION_RETURN_KEY = 'reozom_impersonation_return'

export function impersonationReturnPath(): string {
  const path = readSession(IMPERSONATION_RETURN_KEY)
  // Only same-site admin paths, never an external URL
  return path && path.startsWith('/admin/') ? path : '/admin/users'
}

export function setImpersonationToken(token: string | null, returnTo?: string) {
  try {
    if (token) {
      sessionStorage.setItem(IMPERSONATION_TOKEN_KEY, token)
      if (returnTo) sessionStorage.setItem(IMPERSONATION_RETURN_KEY, returnTo)
    } else {
      sessionStorage.removeItem(IMPERSONATION_TOKEN_KEY)
      sessionStorage.removeItem(IMPERSONATION_RETURN_KEY)
    }
  } catch {
    // Storage unavailable (e.g. private mode): impersonation simply won't persist across reloads
  }
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/** Shape returned by Laravel's ApiResponse::success() helper. */
interface ApiEnvelope<T> {
  success: boolean
  message?: string
  data?: T
  meta?: any
}

function isApiEnvelope(body: unknown): body is ApiEnvelope<unknown> {
  return typeof body === 'object' && body !== null && 'success' in body
}

apiClient.interceptors.response.use(
  (response) => {
    // Unwrap Laravel's { success, message, data } envelope so callers
    // (services/stores) work with the actual payload directly.
    if (isApiEnvelope(response.data)) {
      const envelope = response.data
      const unwrapped = envelope.data ?? null
      if (envelope.meta && unwrapped && typeof unwrapped === 'object') {
        ;(unwrapped as any).meta = envelope.meta
      }
      response.data = unwrapped
    }
    return response
  },
  (err) => {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      const url = err.config?.url || ''
      if (!url.includes('/download') && !url.includes('/signed-doc') && !url.includes('/audit')) {
        // The 2-hour "login as user" session expired in this tab: back to the admin's own session
        if (isImpersonatingInThisTab()) {
          const backTo = impersonationReturnPath()
          setImpersonationToken(null)
          window.location.assign(backTo)
          return Promise.reject(err)
        }

        localStorage.removeItem(TOKEN_STORAGE_KEY)
        // Admin and seller sessions expire into different login pages —
        // redirecting an admin's expired session to the seller login is a dead end.
        const path = window.location.pathname
        const isAdminArea = path.startsWith('/admin')
        const alreadyOnGuestPage = isAdminArea ? path === '/admin/login' : path.startsWith('/auth/')
        if (!alreadyOnGuestPage) {
          window.location.assign(isAdminArea ? '/admin/login' : '/auth/login')
        }
      }
    }
    return Promise.reject(err)
  },
)

/** True when the request never reached a server (e.g. no backend running yet). */
export function isNetworkError(err: unknown): boolean {
  return axios.isAxiosError(err) && !err.response
}

export default apiClient
