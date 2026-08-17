import api from './api'
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '@/types/auth'

export const login = (payload: LoginPayload) => {
  return api.post<AuthResponse>('/auth/login', payload)
}

export const register = (payload: RegisterPayload) => {
  return api.post<AuthResponse>('/auth/register', payload)
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
