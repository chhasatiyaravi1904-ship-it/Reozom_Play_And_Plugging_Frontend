import api from './api'

export interface StatusHistoryItem {
  id: number
  listing_id: number
  from_status: string | null
  to_status: string
  actor_id: number | null
  actor_role: 'seller' | 'agent' | 'admin' | 'system' | 'buyer'
  comment: string | null
  metadata?: Record<string, any> | null
  created_at: string
  actor?: {
    id: number
    name: string
    first_name?: string
    last_name?: string
    email: string
  }
}

export interface StatusHistoryResponse {
  listing_id: number
  current_status: string
  history: StatusHistoryItem[]
}

export const fetchListingStatusHistory = (listingId: number) => {
  return api.get<StatusHistoryResponse>(`/listings/${listingId}/status-history`)
}

export const transitionListingStatus = (
  listingId: number,
  status: string,
  comment?: string,
  force?: boolean,
) => {
  return api.post(`/listings/${listingId}/transition`, {
    status,
    comment,
    force,
  })
}
