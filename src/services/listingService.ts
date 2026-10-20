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

export const resolveWorkflow = (address: PropertyAddress) => {
  return api.post<ListingRouting>('/listings/resolve-workflow', address)
}

export const fetchDisclosures = (listingId: number) => {
  return api.get<{
    success: boolean
    data: {
      listingId: number
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

export const saveDisclosures = (listingId: number, answers: Record<string, Record<string, any>>) => {
  return api.post(`/listings/${listingId}/disclosures`, { answers })
}

