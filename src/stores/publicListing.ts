import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as publicListingService from '@/services/publicListingService'
import type { PublicListing } from '@/services/publicListingService'

export const usePublicListingStore = defineStore('publicListing', () => {
  const listings = ref<PublicListing[]>([])
  const activeListing = ref<PublicListing | null>(null)
  const meta = ref({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  })
  
  const status = ref<'idle' | 'loading' | 'error'>('idle')
  const error = ref<string | null>(null)

  async function fetchListings(page = 1) {
    status.value = 'loading'
    error.value = null
    try {
      const { data } = await publicListingService.fetchPublicListings(page)
      listings.value = data.data
      meta.value = data.meta
    } catch (err: any) {
      status.value = 'error'
      error.value = 'Unable to load listings'
    } finally {
      if (status.value !== 'error') status.value = 'idle'
    }
  }

  async function fetchListing(id: number) {
    status.value = 'loading'
    error.value = null
    activeListing.value = null
    try {
      const { data } = await publicListingService.fetchPublicListing(id)
      activeListing.value = data.data
    } catch (err: any) {
      status.value = 'error'
      error.value = 'Unable to load listing details'
    } finally {
      if (status.value !== 'error') status.value = 'idle'
    }
  }

  return {
    listings,
    activeListing,
    meta,
    status,
    error,
    fetchListings,
    fetchListing,
  }
})
