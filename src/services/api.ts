import axios from 'axios'

export const TOKEN_STORAGE_KEY = 'reozom_seller_token'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/** Shape returned by Laravel's ApiResponse::success() helper. */
interface ApiEnvelope<T> {
  success: boolean
  message?: string
  data?: T
}

function isApiEnvelope(body: unknown): body is ApiEnvelope<unknown> {
  return typeof body === 'object' && body !== null && 'success' in body
}

apiClient.interceptors.response.use(
  (response) => {
    // Unwrap Laravel's { success, message, data } envelope so callers
    // (services/stores) work with the actual payload directly.
    if (isApiEnvelope(response.data)) {
      response.data = response.data.data ?? null
    }
    return response
  },
  (err) => {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
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
    return Promise.reject(err)
  },
)

/** True when the request never reached a server (e.g. no backend running yet). */
export function isNetworkError(err: unknown): boolean {
  return axios.isAxiosError(err) && !err.response
}

export default apiClient
