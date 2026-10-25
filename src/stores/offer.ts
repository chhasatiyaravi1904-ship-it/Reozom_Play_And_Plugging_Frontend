import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as offerApi from '@/services/offerService'
import type { ListingOffer } from '@/services/offerService'

export const useOfferStore = defineStore('offer', () => {
  const myOffers = ref<ListingOffer[]>([])
  const listingOffers = ref<ListingOffer[]>([])
  const currentOffer = ref<ListingOffer | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchMyOffers = async (page = 1) => {
    loading.value = true
    error.value = null
    try {
      const res = await offerApi.getMyOffers(page)
      myOffers.value = res.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load offers'
    } finally {
      loading.value = false
    }
  }

  const fetchListingOffers = async (listingId: number) => {
    loading.value = true
    error.value = null
    try {
      const res = await offerApi.getListingOffers(listingId)
      listingOffers.value = res.data.offers
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load listing offers'
    } finally {
      loading.value = false
    }
  }

  const submitNewOffer = async (
    listingId: number,
    data: Partial<ListingOffer> & { comment?: string },
    files?: File[],
  ) => {
    loading.value = true
    error.value = null
    try {
      const res = await offerApi.submitOffer(listingId, data, files)
      return res.data.offer
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to submit offer'
      throw err
    } finally {
      loading.value = false
    }
  }

  const counter = async (offerId: number, payload: any) => {
    loading.value = true
    try {
      const res = await offerApi.counterOffer(offerId, payload)
      currentOffer.value = res.data.offer
      return res.data.offer
    } finally {
      loading.value = false
    }
  }

  const accept = async (offerId: number, comment?: string) => {
    loading.value = true
    try {
      const res = await offerApi.acceptOffer(offerId, comment)
      currentOffer.value = res.data.offer
      return res.data.offer
    } finally {
      loading.value = false
    }
  }

  const reject = async (offerId: number, reason?: string) => {
    loading.value = true
    try {
      const res = await offerApi.rejectOffer(offerId, reason)
      currentOffer.value = res.data.offer
      return res.data.offer
    } finally {
      loading.value = false
    }
  }

  const withdraw = async (offerId: number, reason?: string) => {
    loading.value = true
    try {
      const res = await offerApi.withdrawOffer(offerId, reason)
      currentOffer.value = res.data.offer
      return res.data.offer
    } finally {
      loading.value = false
    }
  }

  return {
    myOffers,
    listingOffers,
    currentOffer,
    loading,
    error,
    fetchMyOffers,
    fetchListingOffers,
    submitNewOffer,
    counter,
    accept,
    reject,
    withdraw,
  }
})
