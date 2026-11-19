import api from './api'

export interface PublicFieldConfig {
  id: string
  label: string
  type: string
  value: any
  public_display?: boolean
  show_on_card?: boolean
  show_on_detail?: boolean
}

export interface PublicListing {
  id: number
  reference_code: string
  status: string
  address: {
    street?: string
    city: string
    state: string
    zip: string
  }
  public_info: PublicFieldConfig[]
  values: Record<string, any>
  /** True when the logged-in viewer created this listing (owners can't make offers on it). */
  is_owner?: boolean
  images: {
    id: number
    url: string
    thumbnail_url: string | null
    alt: string
  }[]
  created_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface PublicListingResponse {
  success: boolean
  data: PublicListing
}

export const fetchPublicListings = (page = 1, params?: Record<string, any>) => {
  return api.get<PaginatedResponse<PublicListing>>('/public/listings', { params: { page, ...params } })
}

export const fetchPublicListing = (listingId: number) => {
  return api.get<PublicListingResponse>(`/public/listings/${listingId}`)
}

export interface PublicListingFilters {
  property_types: { value: string; label: string }[]
  price: { min: number | null; max: number | null }
}

/** api.ts unwraps the { success, data } envelope, so response.data is the filters object. */
export const fetchPublicListingFilters = () => {
  return api.get<PublicListingFilters>('/public/listings/filters')
}
