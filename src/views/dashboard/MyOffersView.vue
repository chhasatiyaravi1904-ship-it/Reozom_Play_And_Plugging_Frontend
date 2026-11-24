<template>
  <div :class="embedded ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10'">
    <div v-if="!embedded" class="sm:flex sm:items-center sm:justify-between mb-8">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">My Offers</h1>
        <p class="mt-2 text-sm text-slate-500">Track and manage all purchase offers submitted on Reozom properties.</p>
      </div>
    </div>

    <!-- Loading State -->
    <LoadingState v-if="offerStore.loading && offerStore.myOffers.length === 0" :rows="3" label="Loading your offers" />

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
              <span v-if="offer.is_backup_offer" class="text-xs bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded">
                Backup Offer
              </span>
            </div>
            <h3 class="text-lg font-bold text-slate-900 mt-2">
              {{ offer.listing?.address || 'Listing Address Unavailable' }}, {{ offer.listing?.city }}, {{ offer.listing?.state }}
            </h3>
          </div>

          <div class="text-right">
            <span class="text-xs text-slate-400 block">Offer Amount</span>
            <span class="text-2xl font-black text-slate-900">${{ Number(offer.offer_amount).toLocaleString() }}</span>
            <div v-if="Number(offer.seller_concessions) > 0" class="text-xs text-amber-600 font-medium">
              Concessions: -${{ Number(offer.seller_concessions).toLocaleString() }}
            </div>
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

        <!-- Contingencies -->
        <div v-if="offer.contingencies && Object.keys(offer.contingencies).length > 0" class="py-2 flex flex-wrap gap-2 border-t border-slate-100">
          <span
            v-for="(val, key) in offer.contingencies"
            :key="key"
            v-show="val"
            class="px-2.5 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-medium"
          >
            ✓ {{ String(key).replace(/_/g, ' ') }}
          </span>
        </div>

        <!-- Action / Counter notice -->
        <div v-if="offer.status === 'countered_by_seller'" class="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-3">
          <div>
            <p class="font-semibold text-amber-900">Seller sent a counter-offer!</p>
            <p class="text-xs text-amber-700 mt-0.5">
              Revised price: <strong class="font-bold">${{ Number(offer.offer_amount).toLocaleString() }}</strong>. Please review terms before deadline.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="handleAcceptCounter(offer)"
              :disabled="actionInProgress"
              class="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition"
            >
              Accept Counter
            </button>
            <button
              @click="openCounterModal(offer)"
              :disabled="actionInProgress"
              class="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition"
            >
              Counter Back
            </button>
          </div>
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

        <!-- Expandable Negotiation Timeline -->
        <div v-if="offer.actions && offer.actions.length > 0" class="mt-4 pt-3 border-t border-slate-100">
          <button
            @click="toggleTimeline(offer.id)"
            class="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1"
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
              v-for="act in offer.actions"
              :key="act.id"
              class="text-xs text-slate-600 py-1"
            >
              <div class="flex items-center gap-2">
                <span class="font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                  {{ act.action_type }}
                </span>
                <span class="text-slate-700 font-medium">{{ act.user?.name || act.actor_type }}</span>
                <span class="text-slate-400">• {{ formatDateTime(act.created_at) }}</span>
                <span v-if="act.offer_amount" class="font-bold text-slate-900">• ${{ Number(act.offer_amount).toLocaleString() }}</span>
              </div>
              <p v-if="act.comment" class="mt-0.5 text-slate-500 italic">"{{ act.comment }}"</p>
            </div>
          </div>
        </div>

        <!-- Actions & Contract Download -->
        <div class="flex items-center justify-between pt-4 border-t border-slate-100 mt-3 flex-wrap gap-2">
          <button
            @click="handleDownloadContract(offer)"
            class="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition flex items-center gap-1.5"
            title="Download Purchase Agreement Contract (PDF)"
          >
            <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Purchase Agreement (PDF)
          </button>

          <button
            v-if="offer.status === 'accepted' && canSign(offer.id)"
            @click="handleSignPurchaseAgreement(offer)"
            class="px-3.5 py-1.5 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-semibold transition"
            title="Open your EunoDoc signing page for the purchase agreement"
          >
            Sign Purchase Agreement
          </button>

          <button
            v-if="['submitted', 'countered_by_seller', 'countered_by_buyer'].includes(offer.status)"
            @click="handleWithdraw(offer)"
            :disabled="actionInProgress"
            class="text-xs font-semibold text-rose-600 hover:text-rose-800 transition ml-auto"
          >
            Withdraw Offer
          </button>
        </div>

        <!-- Purchase agreement signing status, fetched live from EunoDoc -->
        <div
          v-if="offer.status === 'accepted'"
          class="mt-3 flex items-center justify-between gap-3 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs"
        >
          <div class="text-slate-700">
            <template v-if="signingStatus[offer.id] === 'loading'">
              <span class="text-slate-500">Checking signing status…</span>
            </template>
            <template v-else-if="signingStatus[offer.id] === 'error' || !signingStatus[offer.id]">
              <span class="text-slate-500">Signing status unavailable.</span>
            </template>
            <template v-else-if="statusOf(offer.id)?.is_completed">
              <span class="font-semibold text-emerald-700">
                Purchase agreement fully signed{{ statusOf(offer.id)?.signed_at ? ` on ${formatDate(statusOf(offer.id)!.signed_at!)}` : '' }}
              </span>
            </template>
            <template v-else-if="statusOf(offer.id)?.status === 'inprogress'">
              <span class="font-semibold text-slate-800">Waiting for signatures:</span>
              <span v-for="(signer, i) in statusOf(offer.id)?.signers || []" :key="i" class="ml-1.5">
                {{ roleLabel(signer.role) }}
                <span :class="signer.signed ? 'text-emerald-700 font-semibold' : 'text-amber-700'">
                  {{ signer.signed ? '✓ signed' : 'pending' }}
                </span>
                <span v-if="i < (statusOf(offer.id)?.signers?.length || 0) - 1" class="text-slate-300"> · </span>
              </span>
            </template>
            <template v-else-if="statusOf(offer.id)?.status === 'canceled'">
              <span class="text-slate-500">The signing request was canceled. The seller can send it again.</span>
            </template>
            <template v-else>
              <span class="text-slate-500">Purchase agreement not sent for signature yet.</span>
            </template>
          </div>
          <button
            type="button"
            class="shrink-0 text-xs font-semibold text-indigo-700 hover:text-indigo-900 disabled:opacity-50"
            :disabled="signingStatus[offer.id] === 'loading'"
            @click="refreshSigningStatus(offer.id)"
          >
            Refresh status
          </button>
        </div>

        <!-- Addendums to the accepted purchase agreement: the buyer adds, signs and cancels them too (Reozom) -->
        <OfferAddendums v-if="offer.status === 'accepted'" :offer-id="offer.id" class="mt-4 pt-4 border-t border-slate-100" />
      </div>
    </div>

    <!-- Buyer Counter Offer Modal -->
    <div
      v-if="isCounterModalOpen && activeOfferForCounter"
      class="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm"
    >
      <div class="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h4 class="text-lg font-bold text-slate-900">Submit Counter-Offer</h4>
            <p class="text-xs text-slate-400 mt-0.5">Offer Ref: {{ activeOfferForCounter.reference_code }}</p>
          </div>
          <button
            @click="isCounterModalOpen = false"
            class="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        <form @submit.prevent="submitCounterForm" class="mt-5 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Proposed Purchase Price ($) *</label>
              <input
                v-model.number="counterForm.offer_amount"
                type="number"
                min="1000"
                step="500"
                required
                class="w-full px-3 py-2 border rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Earnest Money Deposit ($)</label>
              <input
                v-model.number="counterForm.earnest_money_deposit"
                type="number"
                min="0"
                class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Requested Closing Date</label>
              <input
                v-model="counterForm.closing_date"
                type="date"
                class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Seller Concessions ($)</label>
              <input
                v-model.number="counterForm.seller_concessions"
                type="number"
                min="0"
                class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Response Expiration Deadline</label>
            <select
              v-model="counterForm.deadlineToSet"
              class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="24">24 Hours</option>
              <option value="48">48 Hours</option>
              <option value="72">72 Hours</option>
              <option value="120">5 Days</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Message to Seller / Counter Terms</label>
            <textarea
              v-model="counterForm.comment"
              rows="3"
              placeholder="State your reasons or outline modifications for the seller..."
              class="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          <div v-if="counterErrorMessage" class="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {{ counterErrorMessage }}
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              @click="isCounterModalOpen = false"
              class="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="actionInProgress"
              class="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {{ actionInProgress ? 'Sending...' : 'Send Counter-Offer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import OfferAddendums from '@/components/offers/OfferAddendums.vue'
import { useOfferStore } from '@/stores/offer'
import { downloadOfferDocument, downloadOfferContract, type ListingOffer } from '@/services/offerService'
import { initiateOfferSigning, getOfferSigningStatus, type EunoAgreementStatus } from '@/services/eunoService'

// embedded: shown as the "Sent Offers" tab of the Offers page (no own page heading)
defineProps<{ embedded?: boolean }>()

const offerStore = useOfferStore()
const actionInProgress = ref(false)
const expandedHistory = reactive<Record<number, boolean>>({})

// Counter Modal state
const isCounterModalOpen = ref(false)
const activeOfferForCounter = ref<ListingOffer | null>(null)
const counterErrorMessage = ref<string | null>(null)

const counterForm = reactive({
  offer_amount: 0,
  earnest_money_deposit: 0,
  closing_date: '',
  seller_concessions: 0,
  deadlineToSet: '48',
  comment: '',
})

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

// Purchase agreement signing status per accepted offer. The status endpoint re-checks EunoDoc
// (and stores the signed copy once everyone has signed), so this is always the latest state.
const signingStatus = reactive<Record<number, EunoAgreementStatus | 'loading' | 'error'>>({})

const statusOf = (offerId: number): EunoAgreementStatus | null => {
  const status = signingStatus[offerId]
  return status && typeof status === 'object' ? status : null
}

// Hide the sign button once the buyer has signed or everyone has
const canSign = (offerId: number) => {
  const status = statusOf(offerId)
  return !status?.is_completed && status?.you_signed !== true
}

const refreshSigningStatus = async (offerId: number) => {
  signingStatus[offerId] = 'loading'
  try {
    signingStatus[offerId] = await getOfferSigningStatus(offerId)
  } catch {
    signingStatus[offerId] = 'error'
  }
}

const refreshAllSigningStatus = (offers: ListingOffer[]) =>
  Promise.all(offers.filter((o) => o.status === 'accepted').map((o) => refreshSigningStatus(o.id)))

// Every time the offer list (re)loads, fetch the accepted offers' latest signing status
watch(() => offerStore.myOffers, refreshAllSigningStatus)

// After opening the signing page, re-check when the buyer comes back to this tab
const offerAwaitingSignature = ref<number | null>(null)
const onWindowFocus = () => {
  if (offerAwaitingSignature.value !== null) {
    refreshSigningStatus(offerAwaitingSignature.value)
    offerAwaitingSignature.value = null
  }
}
window.addEventListener('focus', onWindowFocus)
onBeforeUnmount(() => window.removeEventListener('focus', onWindowFocus))

const roleLabel = (role?: string) =>
  ({ buyer: 'Buyer', seller: 'Seller', additional_signer: 'Co-seller', listing_agent: 'Listing agent', selling_agent: 'Buyer agent' })[role || ''] || 'Signer'

// The buyer's own EunoDoc signing page for the accepted offer's purchase agreement.
// The tab is opened before the request (browsers block pop-ups opened after an await).
const handleSignPurchaseAgreement = async (offer: ListingOffer) => {
  const signingWindow = window.open('', '_blank')
  try {
    const res = await initiateOfferSigning(offer.id)
    if (res.signing_url && signingWindow) {
      offerAwaitingSignature.value = offer.id
      signingWindow.location.href = res.signing_url
    } else {
      signingWindow?.close()
      alert(res.signing_url ? 'Allow pop-ups to open the signing page.' : 'You are not a signer on this purchase agreement.')
    }
  } catch (err: any) {
    signingWindow?.close()
    alert(err?.response?.data?.message || 'The signing page could not be opened.')
  }
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

const formatDateTime = (iso: string) => {
  if (!iso) return 'N/A'
  return new Date(iso).toLocaleString()
}

const toggleTimeline = (offerId: number) => {
  expandedHistory[offerId] = !expandedHistory[offerId]
}

const handleAcceptCounter = async (offer: ListingOffer) => {
  if (confirm(`Are you sure you want to accept this counter-offer of $${Number(offer.offer_amount).toLocaleString()}? This will move the listing into contract.`)) {
    actionInProgress.value = true
    try {
      await offerStore.accept(offer.id)
      await offerStore.fetchMyOffers()
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to accept counter offer.')
    } finally {
      actionInProgress.value = false
    }
  }
}

const handleWithdraw = async (offer: ListingOffer) => {
  const reason = prompt('Optional: Reason for withdrawing this offer:')
  if (reason !== null) {
    actionInProgress.value = true
    try {
      await offerStore.withdraw(offer.id, reason)
      await offerStore.fetchMyOffers()
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to withdraw offer.')
    } finally {
      actionInProgress.value = false
    }
  }
}

const openCounterModal = (offer: ListingOffer) => {
  activeOfferForCounter.value = offer
  counterErrorMessage.value = null
  counterForm.offer_amount = Number(offer.offer_amount)
  counterForm.earnest_money_deposit = Number(offer.earnest_money_deposit || 0)
  counterForm.closing_date = offer.closing_date || ''
  counterForm.seller_concessions = Number(offer.seller_concessions || 0)
  counterForm.deadlineToSet = '48'
  counterForm.comment = ''
  isCounterModalOpen.value = true
}

const submitCounterForm = async () => {
  if (!activeOfferForCounter.value) return

  // Verify at least one term is modified per Reozom rules
  const current = activeOfferForCounter.value
  const unchanged =
    Number(counterForm.offer_amount) === Number(current.offer_amount) &&
    Number(counterForm.earnest_money_deposit) === Number(current.earnest_money_deposit || 0) &&
    counterForm.closing_date === current.closing_date &&
    Number(counterForm.seller_concessions) === Number(current.seller_concessions || 0)

  if (unchanged && !counterForm.comment) {
    counterErrorMessage.value = 'Per Reozom negotiation rules, you must modify at least one term (price, deposit, concessions, closing date, or terms) to submit a counter-offer.'
    return
  }

  actionInProgress.value = true
  counterErrorMessage.value = null

  try {
    await offerStore.counter(activeOfferForCounter.value.id, {
      offer_amount: Number(counterForm.offer_amount),
      earnest_money_deposit: Number(counterForm.earnest_money_deposit),
      closing_date: counterForm.closing_date,
      seller_concessions: Number(counterForm.seller_concessions),
      deadline: counterForm.deadlineToSet,
      comment: counterForm.comment,
    })

    isCounterModalOpen.value = false
    await offerStore.fetchMyOffers()
  } catch (err: any) {
    counterErrorMessage.value = err?.response?.data?.message || 'Failed to submit counter-offer.'
  } finally {
    actionInProgress.value = false
  }
}
</script>
