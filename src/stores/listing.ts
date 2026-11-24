import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as listingService from '@/services/listingService'
import { isNetworkError } from '@/services/api'
import { sampleListing } from '@/services/sampleData'
import type { ListingSummary, PropertyAddress } from '@/types/listing'

export const useListingStore = defineStore('listing', () => {
  const listings = ref<ListingSummary[]>([])
  const activeListing = ref<ListingSummary | null>(null)
  const status = ref<'idle' | 'loading' | 'error'>('idle')
  const error = ref<string | null>(null)

  async function fetchListings(scope?: 'my') {
    status.value = 'loading'
    error.value = null
    try {
      const { data } = await listingService.fetchListings(scope)
      listings.value = data
      activeListing.value = data[0] ?? null
    } catch (err) {
      // DEV fallback: no Laravel API running yet.
      if (import.meta.env.DEV && isNetworkError(err)) {
        listings.value = [sampleListing]
        activeListing.value = sampleListing
      } else {
        status.value = 'error'
        error.value = 'Unable to load your listings. Please try again.'
      }
    } finally {
      if (status.value !== 'error') status.value = 'idle'
    }
  }

  async function fetchListing(listingId: number) {
    status.value = 'loading'
    error.value = null
    try {
      const { data } = await listingService.fetchListing(listingId)
      activeListing.value = data
    } catch (err) {
      if (import.meta.env.DEV && isNetworkError(err)) {
        activeListing.value = { ...sampleListing, id: listingId }
      } else {
        status.value = 'error'
        error.value = 'Unable to load this listing. Please try again.'
      }
    } finally {
      if (status.value !== 'error') status.value = 'idle'
    }
  }

  async function startListing(address: PropertyAddress) {
    status.value = 'loading'
    error.value = null
    try {
      const { data } = await listingService.createListing(address)
      activeListing.value = data
      listings.value.unshift(data)
      return data
    } catch (err: any) {
      if (import.meta.env.DEV && isNetworkError(err)) {
        const listing: ListingSummary = {
          ...sampleListing,
          address,
          progressPercent: 0,
          stepsCompleted: 0,
          updatedAt: 'just now',
        }
        activeListing.value = listing
        listings.value.unshift(listing)
        status.value = 'idle'
        return listing
      }
      status.value = 'error'
      error.value = err?.response?.data?.message || 'Unable to start your listing. Please try again.'
      return null
    } finally {
      if (status.value !== 'error') status.value = 'idle'
    }
  }

  async function submitListing(listingId: number) {
    try {
      await listingService.submitListing(listingId)
      await fetchListing(listingId)
      return true
    } catch (err: any) {
      if (import.meta.env.DEV && isNetworkError(err)) return true
      // 402 = the service package must be paid first; show the server's message
      error.value = err?.response?.status === 402
        ? (err.response.data?.message || 'Please complete the payment before publishing.')
        : 'Unable to publish your listing. Please try again.'
      return false
    }
  }

  async function publishListing(listingId: number) {
    try {
      await listingService.publishListing(listingId)
      await fetchListing(listingId)
      return true
    } catch (err) {
      if (import.meta.env.DEV && isNetworkError(err)) return true
      error.value = 'Unable to publish your listing. Please try again.'
      return false
    }
  }

  async function updatePrice(listingId: number, price: number, reason?: string) {
    status.value = 'loading'
    try {
      const res = await listingService.updateListingPrice(listingId, price, reason)
      activeListing.value = res.data
      return res.data
    } finally {
      status.value = 'idle'
    }
  }

  async function updateRemarks(
    listingId: number,
    payload: { listing_title?: string; remarks?: string; directions?: string },
  ) {
    status.value = 'loading'
    try {
      const res = await listingService.updateListingRemarks(listingId, payload)
      activeListing.value = res.data
      return res.data
    } finally {
      status.value = 'idle'
    }
  }

  async function updateCompensation(
    listingId: number,
    payload: {
      compensation?: number
      compensation_type?: 1 | 2
      direct_buyer_rebate?: number
      seller_concessions?: number
    },
  ) {
    status.value = 'loading'
    try {
      const res = await listingService.updateListingCompensation(listingId, payload)
      activeListing.value = res.data
      return res.data
    } finally {
      status.value = 'idle'
    }
  }

  return {
    listings,
    activeListing,
    status,
    error,
    fetchListings,
    fetchListing,
    startListing,
    submitListing,
    publishListing,
    updatePrice,
    updateRemarks,
    updateCompensation,
  }
})
