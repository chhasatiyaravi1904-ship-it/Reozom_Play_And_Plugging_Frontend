import api from './api'
import type { AdminUserItem } from './adminUsersData'

export interface AdminUserListResponse {
  items?: AdminUserItem[]
  data?: AdminUserItem[]
  meta?: {
    currentPage?: number
    perPage?: number
    total?: number
    lastPage?: number
  }
}

export interface UserQueryParams {
  search?: string
  role?: string
  is_active?: boolean
  per_page?: number
}

export interface UserFormPayload {
  fullName: string
  email: string
  phone?: string
  password?: string
  role: string
  location?: string
  isActive?: boolean
}

/** Laravel validates snake_case keys (name, is_active) — translate at the API boundary. */
function toApiPayload(payload: Partial<UserFormPayload>): Record<string, unknown> {
  const body: Record<string, unknown> = {}
  if (payload.fullName !== undefined) body.name = payload.fullName
  if (payload.email !== undefined) body.email = payload.email
  if (payload.phone !== undefined) body.phone = payload.phone
  if (payload.password) body.password = payload.password
  if (payload.role !== undefined) body.role = payload.role
  if (payload.location !== undefined) body.location = payload.location
  if (payload.isActive !== undefined) body.is_active = payload.isActive
  return body
}

export const fetchUsers = (params?: UserQueryParams) => {
  return api.get<AdminUserListResponse | AdminUserItem[]>('/admin/users', { params })
}

export const fetchUser = (id: number | string) => {
  return api.get<AdminUserItem>(`/admin/users/${id}`)
}

export const createUser = (payload: UserFormPayload) => {
  return api.post<AdminUserItem>('/admin/users', toApiPayload(payload))
}

export const updateUser = (id: number | string, payload: Partial<UserFormPayload>) => {
  return api.put<AdminUserItem>(`/admin/users/${id}`, toApiPayload(payload))
}

export const deleteUser = (id: number | string) => {
  return api.delete(`/admin/users/${id}`)
}

export const toggleUserStatus = (id: number | string, isActive: boolean) => {
  return api.put<AdminUserItem>(`/admin/users/${id}`, { is_active: isActive })
}

export const verifyUserEmail = (id: number | string) => {
  return api.put<AdminUserItem>(`/admin/users/${id}`, { email_verified: true })
}
