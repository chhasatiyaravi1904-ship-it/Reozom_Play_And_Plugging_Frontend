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
    per_page: 12,
    total: 0,
  })

  const status = ref<'idle' | 'loading' | 'error'>('idle')
  const error = ref<string | null>(null)

  // Only the latest request may update state, so a slow earlier response
  // can't overwrite the results of a newer filter.
  let latestListRequest = 0

  async function fetchListings(page = 1, params?: Record<string, any>) {
    const requestId = ++latestListRequest
    status.value = 'loading'
    error.value = null
    try {
      const response = await publicListingService.fetchPublicListings(page, params)
      if (requestId !== latestListRequest) return

      // api.ts unwraps Laravel's { success, data, meta } envelope: the payload
      // is the listings array itself, with `meta` attached to it.
      const payload: any = response.data
      const items: PublicListing[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data) ? payload.data : []
      const pageMeta = payload?.meta ?? {}
      listings.value = items
      meta.value = {
        current_page: pageMeta.current_page ?? page,
        last_page: pageMeta.last_page ?? 1,
        per_page: pageMeta.per_page ?? 12,
        total: pageMeta.total ?? items.length,
      }
      status.value = 'idle'
    } catch {
      if (requestId !== latestListRequest) return
      listings.value = []
      status.value = 'error'
      error.value = 'Unable to load listings'
    }
  }

  async function fetchListing(id: number) {
    status.value = 'loading'
    error.value = null
    activeListing.value = null
    try {
      const response = await publicListingService.fetchPublicListing(id)
      const payload: any = response.data
      activeListing.value = payload?.data ?? payload
      status.value = 'idle'
    } catch {
      status.value = 'error'
      error.value = 'Unable to load listing details'
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
