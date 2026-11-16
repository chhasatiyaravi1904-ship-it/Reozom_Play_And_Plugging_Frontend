import api from './api'
import type { AuthResponse, LoginPayload, RegisterPayload, RegisterResult, User } from '@/types/auth'

export const login = (payload: LoginPayload) => {
  return api.post<AuthResponse>('/auth/login', payload)
}

export const register = (payload: RegisterPayload) => {
  return api.post<RegisterResult>('/auth/register', payload)
}

export const logout = () => {
  return api.post('/auth/logout')
}

export const forgotPassword = (email: string) => {
  return api.post('/auth/forgot-password', { email })
}

export const resetPassword = (payload: { token: string; email: string; password: string }) => {
  return api.post('/auth/reset-password', payload)
}

export const fetchCurrentUser = () => {
  return api.get<User>('/auth/me')
}

export const resendVerificationEmail = (email: string) => {
  return api.post('/auth/email/resend', { email })
}

export const verify2fa = (payload: { email: string; code: string }) => {
  return api.post<AuthResponse>('/auth/verify-2fa', payload)
}

export const resend2fa = (email: string) => {
  return api.post('/auth/resend-2fa', { email })
}


/** Admin "Login as user": a temporary 2-hour token for the user. */
export const impersonateUser = (userId: number) => {
  return api.post<{ token: string; user: User; impersonatedBy: { id: number; name: string }; expiresAt: string }>(
    `/admin/users/${userId}/impersonate`,
  )
}

/** End the "Login as user" session (the temporary token is deleted). */
export const stopImpersonation = () => {
  return api.post('/auth/stop-impersonation')
}
