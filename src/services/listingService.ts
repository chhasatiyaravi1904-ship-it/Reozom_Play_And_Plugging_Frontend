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
