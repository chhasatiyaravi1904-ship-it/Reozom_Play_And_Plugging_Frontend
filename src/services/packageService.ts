import api from './api'
import type { User } from '@/types/auth'
import type {
  PackageItem,
  PackageListResponse,
  CreatePackagePayload,
  UpdatePackagePayload,
  PackageQueryParams,
} from '@/types/package'

/** Laravel validates snake_case keys — translate at the API boundary. */
function toApiPayload(payload: Partial<CreatePackagePayload>): Record<string, unknown> {
  const body: Record<string, unknown> = {}
  if (payload.name !== undefined) body.name = payload.name
  if (payload.slug !== undefined) body.slug = payload.slug
  if (payload.description !== undefined) body.description = payload.description
  if (payload.price !== undefined) body.price = payload.price
  if (payload.durationDays !== undefined) body.duration_days = payload.durationDays
  if (payload.sortOrder !== undefined) body.sort_order = payload.sortOrder
  if (payload.isActive !== undefined) body.is_active = payload.isActive
  return body
}

/**
 * Packages an agent can choose from (GET /packages).
 */
export const fetchPackages = (params?: PackageQueryParams) => {
  return api.get<PackageListResponse | PackageItem[]>('/packages', { params })
}

/**
 * Select (or renew/switch to) a package (POST /packages/{id}/select).
 * Returns the updated authenticated user, including the new currentPackage.
 */
export const selectPackage = (id: string) => {
  return api.post<User>(`/packages/${id}/select`)
}

/**
 * Admin package management (GET /admin/packages).
 */
export const fetchAdminPackages = (params?: PackageQueryParams) => {
  return api.get<PackageListResponse | PackageItem[]>('/admin/packages', { params })
}

export const fetchAdminPackage = (id: string) => {
  return api.get<PackageItem>(`/admin/packages/${id}`)
}

export const createPackage = (payload: CreatePackagePayload) => {
  return api.post<PackageItem>('/admin/packages', toApiPayload(payload))
}

export const updatePackage = (id: string, payload: UpdatePackagePayload) => {
  return api.put<PackageItem>(`/admin/packages/${id}`, toApiPayload(payload))
}

export const deletePackage = (id: string) => {
  return api.delete(`/admin/packages/${id}`)
}
