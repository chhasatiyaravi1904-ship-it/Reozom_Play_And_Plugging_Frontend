import api from './api'
import type { User } from '@/types/auth'
import type { StripeSyncSummary } from '@/types/stripe'
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
  if (payload.maxListingProcesses !== undefined) body.max_listing_processes = payload.maxListingProcesses
  if (payload.features !== undefined) body.features = payload.features
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

export const fetchAdminPermissions = () => {
  return api.get<string[]>('/admin/packages/permissions')
}

/** Create/refresh this plan in Stripe now (Retry for a failed or pending sync). */
export const syncPackageToStripe = (id: string) => {
  return api.post<StripeSyncSummary>(`/admin/packages/${id}/stripe-sync`)
}

export type SubscriptionStatus = 'active' | 'replaced' | 'expired' | 'refunded'

export interface SubscriptionHistoryRow {
  id: string
  package: { id: string; name: string; duration_days: number } | null
  started_at: string
  expires_at: string
  status: SubscriptionStatus
  /** In cents; 0 for free plans. */
  amount: number
  currency: string
  paid_at: string | null
  payment_status: string | null
}

export interface SubscriptionHistoryPage {
  data: SubscriptionHistoryRow[]
  meta: { current_page: number; last_page: number; per_page: number; total: number }
}

/** The logged-in agent's subscription purchase history (GET /agent/subscriptions). */
export const fetchMySubscriptions = (page = 1) => {
  return api.get<SubscriptionHistoryPage>('/agent/subscriptions', { params: { page } })
}
