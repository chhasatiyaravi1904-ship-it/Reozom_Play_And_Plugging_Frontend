<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between pb-4 border-b border-slate-200">
      <div>
        <h3 class="text-xl font-bold text-slate-900">Purchase Offers</h3>
        <p class="text-sm text-slate-500 mt-1">
          Review, negotiate, and accept purchase offers submitted for this property.
        </p>
      </div>
      <div v-if="listingStatus" class="flex items-center gap-2">
        <span class="text-xs text-slate-500">Current Status:</span>
        <span class="px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-800">
          {{ listingStatus.replace(/_/g, ' ') }}
        </span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="offerStore.loading && offerStore.listingOffers.length === 0" class="py-12 text-center text-slate-400">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-r-transparent"></div>
      <p class="mt-2 text-sm">Loading offers...</p>
    </div>

    <!-- Empty -->
    <div v-else-if="offerStore.listingOffers.length === 0" class="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
      <p class="text-slate-600 font-medium">No offers received yet.</p>
      <p class="text-xs text-slate-400 mt-1">When buyers submit offers on this property, they will appear here for review.</p>
    </div>

    <!-- Offers Cards -->
    <div v-else class="space-y-4">
      <div
        v-for="offer in offerStore.listingOffers"
        :key="offer.id"
        class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition"
        :class="{ 'border-emerald-500 ring-2 ring-emerald-500/20': offer.status === 'accepted' }"
      >
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-900 text-lg">{{ offer.buyer_name || offer.buyer?.name || 'Buyer' }}</span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize" :class="statusBadgeClass(offer.status)">
                {{ offer.status.replace(/_/g, ' ') }}
              </span>
              <span v-if="offer.is_backup_offer" class="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-xs font-medium">
                Backup Offer
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-1">Ref: {{ offer.reference_code }} • Submitted on {{ formatDate(offer.created_at) }}</p>
          </div>

          <div class="text-right">
            <span class="text-xs text-slate-400 block">Offer Price</span>
            <span class="text-2xl font-black text-slate-900">${{ Number(offer.offer_amount).toLocaleString() }}</span>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 text-xs">
          <div>
            <span class="text-slate-400 block">Payment Method</span>
            <span class="font-semibold text-slate-700 capitalize">{{ offer.payment_method }}</span>
          </div>
          <div>
            <span class="text-slate-400 block">Earnest Money</span>
            <span class="font-semibold text-slate-700">${{ Number(offer.earnest_money_deposit).toLocaleString() }}</span>
          </div>
          <div>
            <span class="text-slate-400 block">Closing Date</span>
            <span class="font-semibold text-slate-700">{{ offer.closing_date }}</span>
          </div>
          <div>
            <span class="text-slate-400 block">Seller Concessions</span>
            <span class="font-semibold text-slate-700">${{ Number(offer.seller_concessions).toLocaleString() }}</span>
          </div>
        </div>

        <!-- Contingencies -->
        <div v-if="offer.contingencies && Object.keys(offer.contingencies).length > 0" class="py-2 flex flex-wrap gap-2">
          <span
            v-for="(val, key) in offer.contingencies"
            :key="key"
            v-show="val"
            class="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs"
          >
            ✓ {{ formatKey(key) }}
          </span>
        </div>

        <!-- Documents -->
        <div v-if="offer.documents && offer.documents.length > 0" class="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3">
          <span class="text-xs font-medium text-slate-500">Attachments:</span>
          <a
            v-for="doc in offer.documents"
            :key="doc.id"
            href="#"
            @click.prevent="downloadDoc(offer.id, doc.id)"
            class="text-xs text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {{ doc.original_name }}
          </a>
        </div>

        <!-- Negotiation Action Buttons -->
        <div
          v-if="['submitted', 'countered_by_buyer'].includes(offer.status)"
          class="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-100"
        >
          <button
            @click="handleEunoSignOffer(offer)"
            class="px-4 py-2 rounded-xl border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-semibold transition flex items-center gap-1.5"
            title="Sign purchase agreement via EunoDoc"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            E-Sign (EunoDoc)
          </button>
          <button
            @click="handleReject(offer)"
            class="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition"
          >
            Decline Offer
          </button>
          <button
            @click="openCounterModal(offer)"
            class="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition"
          >
            Send Counter-Offer
          </button>
          <button
            @click="handleAccept(offer)"
            class="px-5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold shadow-md shadow-emerald-600/20 transition"
          >
            Accept Offer & Put Under Contract
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useOfferStore } from '@/stores/offer'
import { downloadOfferDocument, type ListingOffer } from '@/services/offerService'
import * as eunoService from '@/services/eunoService'

const props = defineProps<{
  listingId: number
  listingStatus?: string
}>()

const emit = defineEmits(['listingUpdated'])

const offerStore = useOfferStore()

onMounted(() => {
  offerStore.fetchListingOffers(props.listingId)
})

const statusBadgeClass = (status: string) => {
  switch (status) {
    case 'accepted':
      return 'bg-emerald-100 text-emerald-800'
    case 'submitted':
      return 'bg-blue-100 text-blue-800'
    case 'countered_by_seller':
    case 'countered_by_buyer':
      return 'bg-amber-100 text-amber-800'
    case 'rejected':
    case 'rejected_under_contract':
      return 'bg-rose-100 text-rose-800'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

const formatDate = (iso: string) => {
  if (!iso) return 'N/A'
  return new Date(iso).toLocaleDateString()
}

const formatKey = (key: string) => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

const downloadDoc = async (offerId: number, docId: string) => {
  const res = await downloadOfferDocument(offerId, docId)
  const url = window.URL.createObjectURL(new Blob([res.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'Offer_Document.pdf')
  document.body.appendChild(link)
  link.click()
  link.remove()
}

const handleAccept = async (offer: ListingOffer) => {
  if (
    confirm(
      `Are you sure you want to accept this offer of $${Number(offer.offer_amount).toLocaleString()}? This will officially move your listing to 'under_contract'.`,
    )
  ) {
    await offerStore.accept(offer.id)
    await offerStore.fetchListingOffers(props.listingId)
    emit('listingUpdated')
  }
}

const handleReject = async (offer: ListingOffer) => {
  const reason = prompt('Enter a reason for declining this offer (optional):')
  await offerStore.reject(offer.id, reason || undefined)
  await offerStore.fetchListingOffers(props.listingId)
}

const openCounterModal = async (offer: ListingOffer) => {
  const newAmount = prompt('Enter your counter-offer price ($):', String(offer.offer_amount))
  if (newAmount) {
    await offerStore.counter(offer.id, {
      offer_amount: Number(newAmount),
      comment: 'Seller revised purchase price.',
    })
    await offerStore.fetchListingOffers(props.listingId)
  }
}

const handleEunoSignOffer = async (offer: ListingOffer) => {
  try {
    const res = await eunoService.initiateOfferSigning(offer.id)
    if (res.signing_url) {
      window.open(res.signing_url, '_blank')
    }
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Failed to initiate EunoDoc agreement.')
  }
}
</script>
