import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

export function useAuth() {
  const authStore = useAuthStore()
  const { user, isAuthenticated, status, error } = storeToRefs(authStore)

  return {
    user,
    isAuthenticated,
    status,
    error,
    login: authStore.login,
    register: authStore.register,
    logout: authStore.logout,
    loginWithToken: authStore.loginWithToken,
  }
}
