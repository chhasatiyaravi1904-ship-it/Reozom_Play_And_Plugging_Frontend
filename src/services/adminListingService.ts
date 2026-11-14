import api from './api'
import type { ListingStatus } from '@/types/listing'

export interface AdminListingQueryParams {
  search?: string
  status?: string
  moderation_status?: string
  page?: number
  per_page?: number
}

export interface AdminListingDetail {
  id: number
  reference_code: string
  status: ListingStatus
  address: string
  city: string
  state: string
  zip: string
  steps_completed: number
  steps_total: number
  created_at: string
  updated_at: string
  moderation_status?: string
  moderated_by?: number
  moderated_at?: string
  rejection_reason?: string
  status_changed_date?: string
  sold_details?: {
    id: number
    listing_id: number
    anticipated_closed_date?: string
    closed_date?: string
    sales_price?: number
    sellers_concessions?: number
    amount?: number
    finance_type?: string
    agent?: number
    agent_name?: string
    company?: string
  }
  user?: {
    id: number
    name: string
    email: string
    first_name?: string
    last_name?: string
    phone?: string
    role: string
  }
  moderator?: {
    id: number
    name: string
    email: string
  }
  service_package?: {
    id: number
    name: string
    price?: number
    agent?: {
      id: number
      first_name?: string
      last_name?: string
      email: string
    }
  }
  answers?: Array<{
    id: number
    step_id: string
    values: Record<string, any>
  }>
  images?: Array<{
    id: number
    url: string
    thumbnail_url?: string
    is_primary: boolean
  }>
  documents?: Array<{
    id: string
    type: string
    original_name: string
    path: string
    size: number
    created_at: string
    verification_status?: string
    review_notes?: string
  }>
}

export interface AdminListingListResponse {
  data: AdminListingDetail[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export const fetchAdminListings = (params?: AdminListingQueryParams) => {
  return api.get<AdminListingListResponse>('/admin/listings', { params })
}

export const fetchAdminListing = (id: number) => {
  return api.get<{ data: AdminListingDetail }>(`/admin/listings/${id}`)
}

export const publishListing = (id: number) => {
  return api.post<{ data: AdminListingDetail }>(`/admin/listings/${id}/publish`)
}

export const unpublishListing = (id: number) => {
  return api.post<{ data: AdminListingDetail }>(`/admin/listings/${id}/unpublish`)
}

export const rejectListing = (id: number, rejection_reason: string) => {
  return api.post<{ data: AdminListingDetail }>(`/admin/listings/${id}/reject`, { rejection_reason })
}

export interface ChangeAdminListingStatusPayload {
  status: string | number
  comment: string
  anticipated_closed_date?: string
  agent?: 1 | 2
  agent_name?: string
  closed_date?: string
  sales_price?: number
  sellers_concessions?: 1 | 2
  amount?: number
  finance_type?: string
}

export const changeAdminListingStatus = (id: number, data: ChangeAdminListingStatusPayload) => {
  return api.post<{ data: AdminListingDetail; message: string }>(`/admin/listings/${id}/change-status`, data)
}
