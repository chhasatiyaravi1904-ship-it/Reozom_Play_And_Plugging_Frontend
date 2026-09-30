import api from './api'
import type { User } from '@/types/auth'

export const fetchProfile = () => {
  return api.get<User>('/auth/profile')
}

export const updateProfile = (payload: Pick<User, 'fullName' | 'email' | 'phone'>) => {
  return api.put<User>('/auth/profile', payload)
}
