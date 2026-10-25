<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div class="sm:flex sm:items-center sm:justify-between mb-8">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">My Offers</h1>
        <p class="mt-2 text-sm text-slate-500">Track and manage all purchase offers submitted on Reozom properties.</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="offerStore.loading && offerStore.myOffers.length === 0" class="py-16 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-r-transparent"></div>
      <p class="mt-4 text-sm text-slate-500">Loading your offers...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="offerStore.myOffers.length === 0" class="text-center py-16 bg-white rounded-2xl border border-slate-200">
      <svg class="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="mt-3 text-lg font-bold text-slate-900">No offers submitted yet</h3>
      <p class="mt-1 text-sm text-slate-500">Explore published listings on the marketplace and submit an offer to get started.</p>
      <router-link to="/browse" class="mt-5 inline-flex items-center px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition">
        Browse Properties
      </router-link>
    </div>

    <!-- Offers List -->
    <div v-else class="space-y-6">
      <div
        v-for="offer in offerStore.myOffers"
        :key="offer.id"
        class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 hover:shadow-md transition"
      >
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-3">
              <span class="text-xs font-bold text-indigo-600 tracking-wider uppercase bg-indigo-50 px-2.5 py-1 rounded-md">
                {{ offer.reference_code }}
              </span>
              <span
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize"
                :class="statusBadgeClass(offer.status)"
              >
                {{ formatStatus(offer.status) }}
              </span>
            </div>
            <h3 class="text-lg font-bold text-slate-900 mt-2">
              {{ offer.listing?.address || 'Listing Address Unavailable' }}, {{ offer.listing?.city }}, {{ offer.listing?.state }}
            </h3>
          </div>

          <div class="text-right">
            <span class="text-xs text-slate-400 block">Offer Amount</span>
            <span class="text-2xl font-black text-slate-900">${{ Number(offer.offer_amount).toLocaleString() }}</span>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 text-sm">
          <div>
            <span class="text-xs text-slate-400 block">Earnest Money</span>
            <span class="font-medium text-slate-700">${{ Number(offer.earnest_money_deposit).toLocaleString() }}</span>
          </div>
          <div>
            <span class="text-xs text-slate-400 block">Payment Method</span>
            <span class="font-medium text-slate-700 capitalize">{{ offer.payment_method }}</span>
          </div>
          <div>
            <span class="text-xs text-slate-400 block">Requested Closing</span>
            <span class="font-medium text-slate-700">{{ offer.closing_date }}</span>
          </div>
          <div>
            <span class="text-xs text-slate-400 block">Submitted On</span>
            <span class="font-medium text-slate-700">{{ formatDate(offer.created_at) }}</span>
          </div>
        </div>

        <!-- Action / Counter notice -->
        <div v-if="offer.status === 'countered_by_seller'" class="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4 mt-2">
          <div>
            <p class="font-semibold text-amber-900">Seller sent a counter-offer!</p>
            <p class="text-xs text-amber-700 mt-0.5">Please review the revised terms before the deadline.</p>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="handleAcceptCounter(offer)"
              class="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition"
            >
              Accept Counter
            </button>
            <button
              @click="openCounterModal(offer)"
              class="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition"
            >
              Counter Again
            </button>
          </div>
        </div>

        <!-- Withdraw Button -->
        <div v-if="['submitted', 'countered_by_seller', 'countered_by_buyer'].includes(offer.status)" class="flex justify-end pt-4 border-t border-slate-100">
          <button
            @click="handleWithdraw(offer)"
            class="text-xs font-semibold text-rose-600 hover:text-rose-800 transition"
          >
            Withdraw Offer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useOfferStore } from '@/stores/offer'
import type { ListingOffer } from '@/services/offerService'

const offerStore = useOfferStore()

onMounted(() => {
  offerStore.fetchMyOffers()
})

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ')
}

const statusBadgeClass = (status: string) => {
  switch (status) {
    case 'accepted':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    case 'submitted':
      return 'bg-blue-50 text-blue-700 border border-blue-200'
    case 'countered_by_seller':
    case 'countered_by_buyer':
      return 'bg-amber-50 text-amber-700 border border-amber-200'
    case 'rejected':
    case 'rejected_under_contract':
      return 'bg-rose-50 text-rose-700 border border-rose-200'
    case 'withdrawn':
    case 'expired':
      return 'bg-slate-100 text-slate-600 border border-slate-200'
    default:
      return 'bg-slate-50 text-slate-700'
  }
}

const formatDate = (iso: string) => {
  if (!iso) return 'N/A'
  return new Date(iso).toLocaleDateString()
}

const handleAcceptCounter = async (offer: ListingOffer) => {
  if (confirm(`Are you sure you want to accept this counter-offer of $${Number(offer.offer_amount).toLocaleString()}? This will move the listing into contract.`)) {
    await offerStore.accept(offer.id)
    await offerStore.fetchMyOffers()
  }
}

const handleWithdraw = async (offer: ListingOffer) => {
  if (confirm('Are you sure you want to withdraw this offer?')) {
    await offerStore.withdraw(offer.id)
    await offerStore.fetchMyOffers()
  }
}

const openCounterModal = (offer: ListingOffer) => {
  const newAmount = prompt('Enter your counter-offer amount ($):', String(offer.offer_amount))
  if (newAmount) {
    offerStore.counter(offer.id, { offer_amount: Number(newAmount) })
      .then(() => offerStore.fetchMyOffers())
  }
}
</script>
