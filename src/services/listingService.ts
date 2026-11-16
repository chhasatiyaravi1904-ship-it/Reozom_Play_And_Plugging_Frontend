import api from './api'
import type { ListingSummary, PropertyAddress, ListingRouting } from '@/types/listing'

export const fetchListings = () => {
  return api.get<ListingSummary[]>('/listings')
}

export const fetchListing = (listingId: number) => {
  return api.get<ListingSummary>(`/listings/${listingId}`)
}

export const createListing = (address: PropertyAddress) => {
  return api.post<ListingSummary>('/listings', address)
}

export const updateListing = (listingId: number, payload: Partial<PropertyAddress>) => {
  return api.put<ListingSummary>(`/listings/${listingId}`, payload)
}

export const submitListing = (listingId: number) => {
  return api.post(`/listings/${listingId}/submit`)
}

export const publishListing = (listingId: number) => {
  return api.post(`/listings/${listingId}/publish`)
}

export const updateListingPrice = (listingId: number, price: number, reason?: string) => {
  return api.post<{ success: boolean; data: ListingSummary; message: string }>(`/listings/${listingId}/price`, {
    price,
    reason,
  })
}

export const updateListingRemarks = (
  listingId: number,
  payload: { listing_title?: string; remarks?: string; directions?: string },
) => {
  return api.put<{ success: boolean; data: ListingSummary; message: string }>(
    `/listings/${listingId}/remarks`,
    payload,
  )
}

export const updateListingCompensation = (
  listingId: number,
  payload: {
    compensation?: number
    compensation_type?: 1 | 2
    direct_buyer_rebate?: number
    seller_concessions?: number
  },
) => {
  return api.put<{ success: boolean; data: ListingSummary; message: string }>(
    `/listings/${listingId}/compensation`,
    payload,
  )
}

export const resolveWorkflow = (address: PropertyAddress) => {
  return api.post<ListingRouting>('/listings/resolve-workflow', address)
}

export interface AvailableDisclosure {
  code: string
  title: string
  description?: string
  category?: string
  state_code?: string | null
  property_type?: string | null
  order?: number
  is_required?: boolean
  is_mandatory?: boolean
  is_selected?: boolean
  sections_count?: number
  questions_count?: number
  sections?: any[]
}

export const fetchDisclosures = (listingId: number) => {
  return api.get<{
    success: boolean
    data: {
      listingId: number
      availableDisclosures: AvailableDisclosure[]
      selectedDisclosures: string[]
      steps: Array<{
        id: string
        name: string
        order: number
        sections: Array<{
          id: string
          name: string
          order: number
          fields: Array<{
            id: string
            name: string
            label: string
            type: string
            required: boolean
            options?: Array<{ label: string; value: string }>
          }>
        }>
      }>
      answers: Record<string, Record<string, any>>
    }
  }>(`/listings/${listingId}/disclosures`)
}

export const saveDisclosures = (
  listingId: number, 
  answers: Record<string, Record<string, any>>,
  selectedDisclosures?: string[]
) => {
  return api.post(`/listings/${listingId}/disclosures`, { answers, selectedDisclosures })
}

export const selectDisclosures = (listingId: number, selectedDisclosures: string[]) => {
  return api.post(`/listings/${listingId}/disclosures/select`, { selectedDisclosures })
}

