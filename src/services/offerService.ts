import api from './api'

export interface OfferAction {
  id: number
  listing_offer_id: number
  user_id: number
  actor_type: 'buyer' | 'seller' | 'agent' | 'admin' | 'system'
  action_type: 'submitted' | 'counter' | 'accepted' | 'rejected' | 'withdrawn' | 'expired'
  offer_amount: string | number
  deadline: string | null
  terms_snapshot?: Record<string, any>
  comment: string | null
  created_at: string
  user?: {
    id: number
    name: string
    first_name?: string
    last_name?: string
  }
}

export interface OfferDocument {
  id: string
  listing_offer_id: number
  type: string
  original_name: string
  mime_type: string
  size: number
  created_at: string
}

export interface ListingOffer {
  id: number
  listing_id: number
  buyer_id: number
  reference_code: string
  status:
    | 'submitted'
    | 'countered_by_seller'
    | 'countered_by_buyer'
    | 'accepted'
    | 'rejected'
    | 'withdrawn'
    | 'expired'
    | 'rejected_under_contract'
  offer_amount: string | number
  earnest_money_deposit: string | number
  down_payment_amount?: string | number | null
  payment_method: 'cash' | 'conventional' | 'fha' | 'va' | 'other'
  closing_date: string
  occupancy_type: 'at_closing' | 'days_after_closing'
  occupancy_days: number
  seller_concessions: string | number
  contingencies?: Record<string, boolean>
  deadline?: string | null
  additional_terms?: string | null
  is_backup_offer: boolean
  buyer_name?: string
  buyer_email?: string
  buyer_phone?: string
  has_agent_representation?: boolean
  agent_name?: string
  agent_email?: string
  agent_phone?: string
  created_at: string
  updated_at: string
  actions?: OfferAction[]
  documents?: OfferDocument[]
  listing?: {
    id: number
    reference_code: string
    address: string
    city: string
    state: string
    zip: string
    status: string
  }
  buyer?: {
    id: number
    name: string
    email: string
    phone?: string
  }
}

export const submitOffer = (
  listingId: number,
  data: Partial<ListingOffer> & { comment?: string },
  files?: File[],
) => {
  const formData = new FormData()

  Object.entries(data).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      if (typeof val === 'object' && !(val instanceof Date)) {
        formData.append(key, JSON.stringify(val))
      } else {
        formData.append(key, String(val))
      }
    }
  })

  if (files && files.length > 0) {
    files.forEach((file, index) => {
      formData.append(`documents[${index}][file]`, file)
      formData.append(`documents[${index}][type]`, 'pre_approval_letter')
    })
  }

  return api.post<{ message: string; offer: ListingOffer }>(
    `/listings/${listingId}/offers`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  )
}

export const getMyOffers = (page = 1) => {
  return api.get<{ data: ListingOffer[]; total: number; current_page: number }>(
    `/buyer/offers?page=${page}`,
  )
}

export const getBuyerOffer = (offerId: number) => {
  return api.get<ListingOffer>(`/buyer/offers/${offerId}`)
}

export const getListingOffers = (listingId: number) => {
  return api.get<{ listing_id: number; listing_status: string; offers: ListingOffer[] }>(
    `/listings/${listingId}/offers`,
  )
}

export const getSellerOffer = (offerId: number) => {
  return api.get<ListingOffer>(`/seller/offers/${offerId}`)
}

export const counterOffer = (
  offerId: number,
  data: {
    offer_amount: number
    earnest_money_deposit?: number
    closing_date?: string
    seller_concessions?: number
    deadline?: string
    additional_terms?: string
    comment?: string
  },
) => {
  return api.post<{ message: string; offer: ListingOffer }>(`/offers/${offerId}/counter`, data)
}

export const acceptOffer = (offerId: number, comment?: string) => {
  return api.post<{ message: string; offer: ListingOffer }>(`/offers/${offerId}/accept`, {
    comment,
  })
}

export const rejectOffer = (offerId: number, reason?: string) => {
  return api.post<{ message: string; offer: ListingOffer }>(`/offers/${offerId}/reject`, {
    reason,
  })
}

export const withdrawOffer = (offerId: number, reason?: string) => {
  return api.post<{ message: string; offer: ListingOffer }>(`/offers/${offerId}/withdraw`, {
    reason,
  })
}

export const downloadOfferDocument = (offerId: number, documentId: string) => {
  return api.get(`/offers/${offerId}/documents/${documentId}/download`, {
    responseType: 'blob',
  })
}

export interface AdminOffersResponse {
  offers: {
    data: ListingOffer[]
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  metrics: {
    total_offers: number
    active_offers: number
    accepted_offers: number
    accepted_volume: number
    rejected_offers: number
  }
}

export const getAdminOffers = (params?: {
  search?: string
  status?: string
  listing_id?: number
  page?: number
  per_page?: number
}) => {
  return api.get<AdminOffersResponse>('/admin/offers', { params })
}

export const getAdminOffer = (offerId: number) => {
  return api.get<ListingOffer>(`/admin/offers/${offerId}`)
}

