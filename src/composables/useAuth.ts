import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

export function useAuth() {
  const authStore = useAuthStore()
  const { user, isAuthenticated, status, error, requires2fa } = storeToRefs(authStore)

  return {
    user,
    isAuthenticated,
    status,
    error,
    requires2fa,
    login: authStore.login,
    verify2fa: authStore.verify2fa,
    resend2fa: authStore.resend2fa,
    register: authStore.register,
    logout: authStore.logout,
    loginWithToken: authStore.loginWithToken,
  }
}
