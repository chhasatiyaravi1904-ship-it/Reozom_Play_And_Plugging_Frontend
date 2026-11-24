<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
      <div>
        <h3 class="text-xl font-bold text-slate-900">Purchase Offers & Negotiations</h3>
        <p class="text-sm text-slate-500 mt-1">
          Review, negotiate, counter, and accept purchase contracts submitted for this property.
        </p>
      </div>
      <div v-if="listingStatus" class="flex items-center gap-2">
        <span class="text-xs text-slate-500 font-medium">Listing Status:</span>
        <span
          class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
          :class="listingStatusBadgeClass(listingStatus)"
        >
          {{ formatListingStatus(listingStatus) }}
        </span>
      </div>
    </div>

    <!-- Loading -->
    <LoadingState v-if="offerStore.loading && offerStore.listingOffers.length === 0" :rows="3" label="Loading offers" />

    <!-- Empty -->
    <div v-else-if="offerStore.listingOffers.length === 0" class="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
      <p class="text-slate-600 font-medium">No purchase offers received yet.</p>
      <p class="text-xs text-slate-400 mt-1">When buyers submit offers on this property, they will appear here with bottom-line calculations and negotiation controls.</p>
    </div>

    <!-- Offers Cards -->
    <div v-else class="space-y-6">
      <div
        v-for="offer in offerStore.listingOffers"
        :key="offer.id"
        class="bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition"
        :class="offerCardClass(offer.status)"
      >
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-bold text-slate-900 text-lg">{{ offer.buyer_name || offer.buyer?.name || 'Buyer' }}</span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold capitalize" :class="statusBadgeClass(offer.status)">
                {{ formatStatus(offer.status) }}
              </span>
              <span v-if="offer.is_backup_offer" class="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-xs font-semibold">
                Backup Offer
              </span>
              <span
                v-if="hasHomeSaleContingency(offer)"
                class="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-xs font-semibold"
                title="If accepted, listing will transition to CCS (Contingent Continue to Show)"
              >
                CCS Contingency
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-1">
              Ref: <span class="font-mono text-slate-600">{{ offer.reference_code }}</span> • Submitted {{ formatDate(offer.created_at) }}
              <span v-if="offer.deadline"> • Response Deadline: <strong class="text-slate-700">{{ formatDateTime(offer.deadline) }}</strong></span>
            </p>
          </div>

          <!-- Price & Bottom Line -->
          <div class="text-right sm:border-l sm:pl-6 border-slate-100">
            <span class="text-xs text-slate-400 block font-medium">Offer Purchase Price</span>
            <span class="text-2xl font-black text-slate-900">${{ Number(offer.offer_amount).toLocaleString() }}</span>
            <div class="mt-1 flex items-center justify-end gap-2 text-xs">
              <span class="text-slate-500">Net to Seller:</span>
              <span class="font-bold text-emerald-600">${{ Number(offer.bottom_line_offer ?? offer.offer_amount).toLocaleString() }}</span>
              <span class="font-semibold text-indigo-600">({{ offer.percentage ?? 100 }}%)</span>
            </div>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 text-xs">
          <div>
            <span class="text-slate-400 block font-medium">Payment Method</span>
            <span class="font-semibold text-slate-700 capitalize">{{ offer.payment_method?.replace(/_/g, ' ') }}</span>
          </div>
          <div>
            <span class="text-slate-400 block font-medium">Earnest Money (EMD)</span>
            <span class="font-semibold text-slate-700">${{ Number(offer.earnest_money_deposit).toLocaleString() }}</span>
          </div>
          <div>
            <span class="text-slate-400 block font-medium">Closing Date</span>
            <span class="font-semibold text-slate-700">{{ offer.closing_date }}</span>
          </div>
          <div>
            <span class="text-slate-400 block font-medium">Seller Concessions</span>
            <span class="font-semibold text-slate-700">${{ Number(offer.seller_concessions).toLocaleString() }}</span>
          </div>
          <div>
            <span class="text-slate-400 block font-medium">Occupancy</span>
            <span class="font-semibold text-slate-700">
              {{ offer.occupancy_type === 'days_after_closing' ? `${offer.occupancy_days} days after close ($${offer.fee_per_day}/day)` : 'At Closing' }}
            </span>
          </div>
          <div v-if="offer.has_agent_representation">
            <span class="text-slate-400 block font-medium">Buyer Agent</span>
            <span class="font-semibold text-slate-700">{{ offer.agent_name || 'Licensed Agent' }} ({{ offer.commission }}{{ offer.commission_type === 1 ? '%' : '$' }})</span>
          </div>
          <div v-if="offer.home_warranty_included">
            <span class="text-slate-400 block font-medium">Home Warranty</span>
            <span class="font-semibold text-slate-700">Included (${{ offer.home_warranty_price || 499 }})</span>
          </div>
        </div>

        <!-- Contingencies -->
        <div v-if="offer.contingencies && Object.keys(offer.contingencies).length > 0" class="py-2 flex flex-wrap gap-2 border-t border-slate-100">
          <span
            v-for="(val, key) in offer.contingencies"
            :key="key"
            v-show="val"
            class="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium"
          >
            ✓ {{ formatKey(String(key)) }}
          </span>
        </div>

        <!-- Attached Documents -->
        <div v-if="offer.documents && offer.documents.length > 0" class="mt-2 pt-2 border-t border-slate-100 flex items-center gap-3 flex-wrap">
          <span class="text-xs font-semibold text-slate-500">Legal Documents:</span>
          <button
            v-for="doc in offer.documents"
            :key="doc.id"
            @click.prevent="downloadDoc(offer.id, doc.id, doc.original_name)"
            class="text-xs text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1 font-medium"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {{ doc.original_name }}
          </button>
        </div>

        <!-- Audit History Timeline -->
        <div v-if="offer.actions && offer.actions.length > 0" class="mt-3 pt-3 border-t border-slate-100">
          <button
            @click="toggleHistory(offer.id)"
            class="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1.5"
          >
            <span>Negotiation History ({{ offer.actions.length }} events)</span>
            <svg
              class="w-3.5 h-3.5 transform transition-transform"
              :class="{ 'rotate-180': expandedHistory[offer.id] }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div v-if="expandedHistory[offer.id]" class="mt-3 space-y-2 pl-3 border-l-2 border-indigo-200">
            <div
              v-for="action in offer.actions"
              :key="action.id"
              class="text-xs text-slate-600 py-1"
            >
              <div class="flex items-center gap-2">
                <span class="font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded" :class="actionBadgeClass(action.action_type)">
                  {{ action.action_type }}
                </span>
                <span class="text-slate-700 font-medium">{{ action.user?.name || action.actor_type }}</span>
                <span class="text-slate-400">• {{ formatDateTime(action.created_at) }}</span>
                <span v-if="action.offer_amount" class="font-bold text-slate-900">• ${{ Number(action.offer_amount).toLocaleString() }}</span>
              </div>
              <p v-if="action.comment" class="mt-0.5 text-slate-500 italic">"{{ action.comment }}"</p>
            </div>
          </div>
        </div>

        <!-- Negotiation Action Buttons -->
        <div
          v-if="['submitted', 'countered_by_buyer'].includes(offer.status)"
          class="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-slate-100 flex-wrap"
        >
          <button
            @click="handleDownloadContract(offer)"
            class="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition flex items-center gap-1.5"
            title="Download Purchase Agreement Contract (PDF)"
          >
            <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Agreement (PDF)
          </button>
          <!-- The purchase agreement is signed only after the offer is accepted -->
          <button
            v-if="offer.status === 'accepted'"
            @click="handleEunoSignOffer(offer)"
            class="px-4 py-2 rounded-xl border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-semibold transition flex items-center gap-1.5"
            title="Prepare EunoDoc digital signing packet"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            E-Sign (EunoDoc)
          </button>
          <button
            @click="openRejectModal(offer)"
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

        <!-- Executed Contract Action for Accepted Offers -->
        <div
          v-else-if="offer.status === 'accepted'"
          class="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 flex-wrap gap-3"
        >
          <div class="flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Purchase Agreement Ratified & Under Contract
          </div>
          <button
            @click="handleEunoSignOffer(offer)"
            class="px-4 py-2 rounded-xl border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-semibold transition"
            title="Open your EunoDoc signing page for the purchase agreement"
          >
            Sign Purchase Agreement
          </button>
          <button
            @click="handleResendOfferSigning(offer)"
            class="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
            title="Cancel the current signing request and send a new one to every signer"
          >
            Resend for signature
          </button>
          <button
            @click="handleDownloadContract(offer)"
            class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
            title="Download Executed Purchase Agreement Contract (PDF)"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Executed Contract (PDF)
          </button>
        </div>

        <!-- Addendum/Amendment to the purchase agreement (original Reozom Addendum) -->
        <OfferAddendums v-if="offer.status === 'accepted'" :offer-id="offer.id" class="mt-4 pt-4 border-t border-slate-100" />
      </div>
    </div>

    <!-- Modal: Counter-Offer Dialog -->
    <div v-if="isCounterModalOpen && activeCounterOffer" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 overflow-hidden transform transition-all">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 class="text-lg font-bold text-slate-900">Send Counter-Offer</h3>
            <p class="text-xs text-slate-500 mt-0.5">Ref: {{ activeCounterOffer.reference_code }}</p>
          </div>
          <button @click="isCounterModalOpen = false" class="text-slate-400 hover:text-slate-600">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="submitCounter" class="mt-5 space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700">Revised Purchase Price ($) *</label>
            <input
              v-model.number="counterForm.offer_amount"
              type="number"
              step="1000"
              required
              class="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:ring-indigo-600"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700">Earnest Money Deposit ($)</label>
              <input
                v-model.number="counterForm.earnest_money_deposit"
                type="number"
                step="500"
                class="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700">Seller Concessions ($)</label>
              <input
                v-model.number="counterForm.seller_concessions"
                type="number"
                step="500"
                class="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700">Target Closing Date</label>
              <input
                v-model="counterForm.closing_date"
                type="date"
                class="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700">Response Deadline</label>
              <select
                v-model="counterForm.deadline_hours"
                class="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
              >
                <option :value="24">24 Hours</option>
                <option :value="48">48 Hours (Standard)</option>
                <option :value="72">72 Hours (3 Days)</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700">Counter Explanation & Additional Terms</label>
            <textarea
              v-model="counterForm.comment"
              rows="3"
              placeholder="Explain the changes to the terms or justification..."
              class="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-600 focus:ring-indigo-600"
            ></textarea>
          </div>

          <div v-if="counterError" class="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs">
            {{ counterError }}
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              @click="isCounterModalOpen = false"
              class="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmittingCounter"
              class="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              {{ isSubmittingCounter ? 'Submitting...' : 'Send Counter-Proposal' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Decline Offer Dialog -->
    <div v-if="isRejectModalOpen && activeRejectOffer" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 overflow-hidden transform transition-all">
        <h3 class="text-lg font-bold text-slate-900">Decline Purchase Offer</h3>
        <p class="text-xs text-slate-500 mt-1">
          Are you sure you want to decline the offer of ${{ Number(activeRejectOffer.offer_amount).toLocaleString() }} from {{ activeRejectOffer.buyer_name || 'Buyer' }}?
        </p>

        <div class="mt-4">
          <label class="block text-xs font-semibold text-slate-700 mb-1">Reason for declining (optional)</label>
          <textarea
            v-model="rejectReason"
            rows="3"
            placeholder="e.g. Price too low, non-conforming financing..."
            class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-rose-600 focus:ring-rose-600"
          ></textarea>
        </div>

        <div class="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-slate-100">
          <button
            type="button"
            @click="isRejectModalOpen = false"
            class="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="submitReject"
            class="px-5 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 shadow-sm"
          >
            Confirm Decline
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import OfferAddendums from '@/components/offers/OfferAddendums.vue'
import { useOfferStore } from '@/stores/offer'
import { downloadOfferDocument, downloadOfferContract, type ListingOffer } from '@/services/offerService'
import * as eunoService from '@/services/eunoService'

const props = defineProps<{
  listingId: number
  listingStatus?: string
}>()

const emit = defineEmits(['listingUpdated'])

const offerStore = useOfferStore()
const expandedHistory = reactive<Record<number, boolean>>({})

// Counter Modal state
const isCounterModalOpen = ref(false)
const activeCounterOffer = ref<ListingOffer | null>(null)
const isSubmittingCounter = ref(false)
const counterError = ref<string | null>(null)
const counterForm = reactive({
  offer_amount: 0,
  earnest_money_deposit: 0,
  seller_concessions: 0,
  closing_date: '',
  deadline_hours: 48,
  comment: '',
})

// Reject Modal state
const isRejectModalOpen = ref(false)
const activeRejectOffer = ref<ListingOffer | null>(null)
const rejectReason = ref('')

onMounted(() => {
  offerStore.fetchListingOffers(props.listingId)
})

const toggleHistory = (offerId: number) => {
  expandedHistory[offerId] = !expandedHistory[offerId]
}

const hasHomeSaleContingency = (offer: ListingOffer): boolean => {
  const c = offer.contingencies || {}
  return Boolean(c.sale_of_home || c.sale_buyers_home || c.oc_sale_buyers_home)
}

const offerCardClass = (status: string) => {
  switch (status) {
    case 'accepted':
      return 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10'
    case 'countered_by_seller':
    case 'countered_by_buyer':
      return 'border-amber-300'
    case 'rejected':
    case 'rejected_under_contract':
      return 'border-slate-200 opacity-75'
    default:
      return 'border-slate-200'
  }
}

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
    case 'withdrawn':
      return 'bg-slate-100 text-slate-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

const listingStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'published':
    case 'active':
      return 'bg-emerald-100 text-emerald-800'
    case 'under_contract':
    case 'pending':
      return 'bg-amber-100 text-amber-800'
    case 'ccs':
      return 'bg-purple-100 text-purple-800'
    case 'sold':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-slate-100 text-slate-800'
  }
}

const actionBadgeClass = (type: string) => {
  switch (type) {
    case 'submitted':
      return 'bg-blue-100 text-blue-800'
    case 'counter':
      return 'bg-amber-100 text-amber-800'
    case 'accepted':
      return 'bg-emerald-100 text-emerald-800'
    case 'rejected':
      return 'bg-rose-100 text-rose-800'
    case 'withdrawn':
      return 'bg-slate-100 text-slate-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

const formatListingStatus = (status: string) => {
  if (status === 'ccs') return 'Contingent - Continue to Show (CCS)'
  if (status === 'under_contract') return 'Pending / Under Contract'
  return status.replace(/_/g, ' ')
}

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ')
}

const formatDate = (iso: string) => {
  if (!iso) return 'N/A'
  return new Date(iso).toLocaleDateString()
}

const formatDateTime = (iso: string) => {
  if (!iso) return 'N/A'
  return new Date(iso).toLocaleString()
}

const formatKey = (key: string) => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

const downloadDoc = async (offerId: number, docId: string, docName?: string) => {
  const res = await downloadOfferDocument(offerId, docId)
  let filename = docName || 'Offer_Document.pdf'
  const disposition = res.headers?.['content-disposition']
  if (disposition) {
    const match = disposition.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?/i)
    if (match && match[1]) {
      filename = decodeURIComponent(match[1].trim())
    }
  }
  const url = window.URL.createObjectURL(new Blob([res.data], { type: res.headers?.['content-type'] || 'application/pdf' }))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

const handleDownloadContract = async (offer: ListingOffer) => {
  try {
    const res = await downloadOfferContract(offer.id)
    const filename = `Purchase_Agreement_${offer.reference_code || offer.id}.pdf`
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    alert('Failed to download purchase agreement contract.')
  }
}

const handleAccept = async (offer: ListingOffer) => {
  const willBeCcs = hasHomeSaleContingency(offer)
  const statusTarget = willBeCcs ? 'CCS (Contingent - Continue to Show)' : 'Under Contract (Pending)'

  if (
    confirm(
      `Accept this offer of $${Number(offer.offer_amount).toLocaleString()}?\n\nPer Reozom workflow rules, this listing will transition to '${statusTarget}'.`,
    )
  ) {
    // Reozom sends the person who accepted straight to their purchase agreement signing page.
    // Open the tab now (browsers block pop-ups opened after an await) and point it at the link later.
    const signingWindow = window.open('', '_blank')
    try {
      await offerStore.accept(offer.id)
      await offerStore.fetchListingOffers(props.listingId)
      emit('listingUpdated')
      const res = await eunoService.initiateOfferSigning(offer.id)
      if (res.signing_url && signingWindow) {
        signingWindow.location.href = res.signing_url
      } else {
        signingWindow?.close()
        if (!res.signing_url) alert(`The offer was accepted. ${NOT_A_SIGNER}`)
      }
    } catch (err: any) {
      signingWindow?.close()
      alert(err?.response?.data?.message || 'The offer was not accepted or the signing page could not be opened.')
    }
  }
}

const NOT_A_SIGNER = 'You are not a signer on this purchase agreement.'

// Cancel the open purchase agreement and send a new one (Reozom: admin regenerate)
const handleResendOfferSigning = async (offer: ListingOffer) => {
  if (!confirm('Send the purchase agreement again? The current signing request will be canceled and every signer gets a new one.')) {
    return
  }
  try {
    const res = await eunoService.resendOfferSigning(offer.id)
    if (res.signing_url) window.open(res.signing_url, '_blank')
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Failed to resend the purchase agreement.')
  }
}

const openRejectModal = (offer: ListingOffer) => {
  activeRejectOffer.value = offer
  rejectReason.value = ''
  isRejectModalOpen.value = true
}

const submitReject = async () => {
  if (!activeRejectOffer.value) return
  await offerStore.reject(activeRejectOffer.value.id, rejectReason.value || undefined)
  isRejectModalOpen.value = false
  await offerStore.fetchListingOffers(props.listingId)
}

const openCounterModal = (offer: ListingOffer) => {
  activeCounterOffer.value = offer
  counterError.value = null
  counterForm.offer_amount = Number(offer.offer_amount)
  counterForm.earnest_money_deposit = Number(offer.earnest_money_deposit)
  counterForm.seller_concessions = Number(offer.seller_concessions)
  counterForm.closing_date = offer.closing_date || ''
  counterForm.deadline_hours = 48
  counterForm.comment = ''
  isCounterModalOpen.value = true
}

const submitCounter = async () => {
  if (!activeCounterOffer.value) return
  isSubmittingCounter.value = true
  counterError.value = null

  try {
    await offerStore.counter(activeCounterOffer.value.id, {
      offer_amount: counterForm.offer_amount,
      earnest_money_deposit: counterForm.earnest_money_deposit,
      seller_concessions: counterForm.seller_concessions,
      closing_date: counterForm.closing_date || undefined,
      deadline: counterForm.deadline_hours,
      comment: counterForm.comment || 'Seller revised purchase terms.',
    })
    isCounterModalOpen.value = false
    await offerStore.fetchListingOffers(props.listingId)
  } catch (err: any) {
    counterError.value = err.response?.data?.message || 'Failed to submit counter-offer.'
  } finally {
    isSubmittingCounter.value = false
  }
}

// Opens the current user's own signing page (the seller's for the listing owner)
const handleEunoSignOffer = async (offer: ListingOffer) => {
  const signingWindow = window.open('', '_blank')
  try {
    const res = await eunoService.initiateOfferSigning(offer.id)
    if (res.signing_url && signingWindow) {
      signingWindow.location.href = res.signing_url
    } else {
      signingWindow?.close()
      alert(res.signing_url ? 'Allow pop-ups to open the signing page.' : NOT_A_SIGNER)
    }
  } catch (err: any) {
    signingWindow?.close()
    alert(err?.response?.data?.message || 'Failed to initiate EunoDoc agreement packet.')
  }
}
</script>
