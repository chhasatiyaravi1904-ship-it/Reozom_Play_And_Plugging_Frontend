<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import {
  Handshake,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  Eye,
  User,
  Building,
  Calendar,
  ShieldCheck,
  Search,
  RefreshCw,
  AlertCircle,
  Check,
} from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import Modal from '@/components/ui/Modal.vue'
import PaginationBar from '@/components/ui/PaginationBar.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import Tabs from '@/components/ui/Tabs.vue'
import { useToastStore } from '@/stores/toast'
import * as offerApi from '@/services/offerService'
import type { ListingOffer, AdminOffersResponse } from '@/services/offerService'

const toast = useToastStore()

const offers = ref<ListingOffer[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

const metrics = ref({
  total_offers: 0,
  active_offers: 0,
  accepted_offers: 0,
  accepted_volume: 0,
  rejected_offers: 0,
})

const queryParams = reactive({
  search: '',
  status: 'all',
  page: 1,
  per_page: 15,
})

const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
})

const statusTabs = [
  { value: 'all', label: 'All Offers' },
  { value: 'submitted', label: 'Pending Review' },
  { value: 'countered', label: 'In Counter / Negotiation' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
]

// Modal & Offer Inspection State
const selectedOffer = ref<ListingOffer | null>(null)
const isDetailModalOpen = ref(false)
const isDownloadingDoc = ref<string | null>(null)

async function loadOffers() {
  isLoading.value = true
  errorMessage.value = null
  try {
    const res = await offerApi.getAdminOffers({
      search: queryParams.search || undefined,
      status: queryParams.status === 'all' ? undefined : queryParams.status,
      page: queryParams.page,
      per_page: queryParams.per_page,
    })

    const payload = res.data
    offers.value = payload.offers?.data || []
    
    if (payload.offers) {
      pagination.value = {
        current_page: payload.offers.current_page || queryParams.page,
        last_page: payload.offers.last_page || 1,
        per_page: payload.offers.per_page || queryParams.per_page,
        total: payload.offers.total ?? 0,
      }
    }

    if (payload.metrics) {
      metrics.value = payload.metrics
    }
  } catch (err: any) {
    console.error('Error loading admin offers:', err)
    errorMessage.value = err.response?.data?.message || 'Failed to load offers from server.'
  } finally {
    isLoading.value = false
  }
}

function handleSearch(val: string) {
  queryParams.search = val
  queryParams.page = 1
  loadOffers()
}

function handleStatusTab(val: string) {
  queryParams.status = val
  queryParams.page = 1
  loadOffers()
}

function handlePageChange(newPage: number) {
  queryParams.page = newPage
  loadOffers()
}

function openDetailModal(offer: ListingOffer) {
  selectedOffer.value = offer
  isDetailModalOpen.value = true
}

async function handleDownloadDoc(docId: string, filename: string) {
  if (!selectedOffer.value) return
  isDownloadingDoc.value = docId
  try {
    const response = await offerApi.downloadOfferDocument(selectedOffer.value.id, docId)
    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || 'document.pdf'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (err) {
    toast.error('Failed to download document attachment.')
  } finally {
    isDownloadingDoc.value = null
  }
}

function formatCurrency(val: string | number | undefined | null): string {
  if (val === undefined || val === null || val === '') return '$0'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(val))
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function getStatusBadgeVariant(status: string): 'success' | 'warning' | 'danger' | 'info' | 'secondary' {
  switch (status) {
    case 'accepted':
      return 'success'
    case 'submitted':
      return 'info'
    case 'countered_by_seller':
    case 'countered_by_buyer':
      return 'warning'
    case 'rejected':
    case 'rejected_under_contract':
      return 'danger'
    default:
      return 'secondary'
  }
}

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ')
}

onMounted(() => {
  loadOffers()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <PageHeader
      title="Offer Management"
      description="Monitor, inspect, and track buyer purchase offers and negotiations across all listings."
    >
      <template #actions>
        <BaseButton
          variant="secondary"
          size="sm"
          :disabled="isLoading"
          @click="loadOffers"
        >
          <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </BaseButton>
      </template>
    </PageHeader>

    <!-- Metrics Stat Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <BaseCard class="p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-fg-muted">Total Offers</p>
            <p class="mt-2 text-2xl font-bold tracking-tight text-fg">{{ metrics.total_offers }}</p>
          </div>
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Handshake class="h-6 w-6" />
          </div>
        </div>
        <p class="mt-3 text-xs text-fg-muted">All purchase proposals submitted on platform</p>
      </BaseCard>

      <BaseCard class="p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-fg-muted">In Active Negotiation</p>
            <p class="mt-2 text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {{ metrics.active_offers }}
            </p>
          </div>
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock class="h-6 w-6" />
          </div>
        </div>
        <p class="mt-3 text-xs text-fg-muted">Pending review or active seller/buyer counteroffers</p>
      </BaseCard>

      <BaseCard class="p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-fg-muted">Accepted / Under Contract</p>
            <p class="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {{ metrics.accepted_offers }}
            </p>
          </div>
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 class="h-6 w-6" />
          </div>
        </div>
        <p class="mt-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          {{ formatCurrency(metrics.accepted_volume) }} volume
        </p>
      </BaseCard>

      <BaseCard class="p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-fg-muted">Declined / Withdrawn</p>
            <p class="mt-2 text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
              {{ metrics.rejected_offers }}
            </p>
          </div>
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <XCircle class="h-6 w-6" />
          </div>
        </div>
        <p class="mt-3 text-xs text-fg-muted">Rejected, withdrawn, or expired offers</p>
      </BaseCard>
    </div>

    <!-- Filters & Search -->
    <BaseCard class="p-4 sm:p-5">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          :model-value="queryParams.status"
          :tabs="statusTabs"
          class="w-full lg:w-auto"
          @update:model-value="handleStatusTab"
        />

        <div class="flex w-full items-center gap-3 lg:w-72">
          <SearchInput
            :model-value="queryParams.search"
            placeholder="Search address, buyer, ref..."
            class="w-full"
            @update:model-value="handleSearch"
          />
        </div>
      </div>
    </BaseCard>

    <!-- Data Table / List -->
    <BaseCard>
      <div v-if="isLoading" class="p-6">
        <LoadingState :rows="6" label="Loading offers..." />
      </div>

      <div v-else-if="errorMessage" class="p-6">
        <ErrorState :title="errorMessage">
          <template #action>
            <BaseButton size="sm" @click="loadOffers">Try Again</BaseButton>
          </template>
        </ErrorState>
      </div>

      <div v-else-if="offers.length === 0" class="p-6">
        <EmptyState
          title="No offers found"
          description="No buyer purchase offers match your search criteria."
        />
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm text-fg">
          <thead class="border-b border-border bg-surface-raised/40 text-xs font-semibold uppercase text-fg-muted">
            <tr>
              <th scope="col" class="px-5 py-3.5">Ref / Date</th>
              <th scope="col" class="px-5 py-3.5">Listing Property</th>
              <th scope="col" class="px-5 py-3.5">Buyer</th>
              <th scope="col" class="px-5 py-3.5">Offer Amount</th>
              <th scope="col" class="px-5 py-3.5">Terms</th>
              <th scope="col" class="px-5 py-3.5">Status</th>
              <th scope="col" class="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="offer in offers"
              :key="offer.id"
              class="transition-colors hover:bg-surface-raised/50"
            >
              <!-- Ref / Date -->
              <td class="px-5 py-4">
                <div class="font-mono text-xs font-semibold text-primary">
                  {{ offer.reference_code }}
                </div>
                <div class="text-xs text-fg-muted mt-0.5">
                  {{ formatDate(offer.created_at) }}
                </div>
              </td>

              <!-- Listing Property -->
              <td class="px-5 py-4">
                <div class="font-medium text-fg">
                  {{ offer.listing?.address || 'Unknown Address' }}
                </div>
                <div class="text-xs text-fg-muted">
                  {{ offer.listing?.city }}, {{ offer.listing?.state }} {{ offer.listing?.zip }}
                </div>
              </td>

              <!-- Buyer -->
              <td class="px-5 py-4">
                <div class="font-medium text-fg">
                  {{ offer.buyer_name || offer.buyer?.name || 'Buyer' }}
                </div>
                <div class="text-xs text-fg-muted">
                  {{ offer.buyer_email || offer.buyer?.email }}
                </div>
                <div v-if="offer.has_agent_representation" class="mt-1">
                  <span class="inline-flex items-center gap-1 rounded bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 dark:text-indigo-300">
                    Agent: {{ offer.agent_name || 'Represented' }}
                  </span>
                </div>
              </td>

              <!-- Offer Amount -->
              <td class="px-5 py-4">
                <div class="font-bold text-fg">
                  {{ formatCurrency(offer.offer_amount) }}
                </div>
                <div class="text-xs text-fg-muted mt-0.5">
                  EMD: {{ formatCurrency(offer.earnest_money_deposit) }}
                </div>
                <div v-if="Number(offer.seller_concessions) > 0" class="text-[11px] text-amber-600 dark:text-amber-400">
                  Concessions: -{{ formatCurrency(offer.seller_concessions) }}
                </div>
              </td>

              <!-- Terms -->
              <td class="px-5 py-4">
                <div class="font-medium capitalize text-fg text-xs">
                  {{ offer.payment_method }}
                </div>
                <div class="text-xs text-fg-muted mt-0.5">
                  Close: {{ formatDate(offer.closing_date) }}
                </div>
                <div v-if="offer.documents && offer.documents.length > 0" class="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5 flex items-center gap-1">
                  <FileText class="h-3 w-3" />
                  {{ offer.documents.length }} doc(s)
                </div>
              </td>

              <!-- Status -->
              <td class="px-5 py-4">
                <BaseBadge :variant="getStatusBadgeVariant(offer.status)" class="capitalize">
                  {{ formatStatus(offer.status) }}
                </BaseBadge>
                <div v-if="offer.is_backup_offer" class="mt-1">
                  <span class="inline-block rounded bg-purple-100 dark:bg-purple-950 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700 dark:text-purple-300">
                    Backup Offer
                  </span>
                </div>
              </td>

              <!-- Actions -->
              <td class="px-5 py-4 text-right">
                <BaseButton
                  variant="secondary"
                  size="sm"
                  @click="openDetailModal(offer)"
                >
                  <Eye class="mr-1.5 h-3.5 w-3.5" />
                  Inspect
                </BaseButton>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination Bar -->
        <div v-if="pagination.last_page > 1" class="border-t border-border p-4">
          <PaginationBar
            :page="pagination.current_page"
            :total-items="pagination.total"
            :per-page="pagination.per_page"
            @update:page="handlePageChange"
          />
        </div>
      </div>
    </BaseCard>

    <!-- Inspection Modal -->
    <Modal
      v-model="isDetailModalOpen"
      size="lg"
      :title="`Offer Inspection: ${selectedOffer?.reference_code || ''}`"
    >
      <div v-if="selectedOffer" class="space-y-6">
        <!-- Top Status Banner -->
        <div class="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-surface-raised p-4">
          <div>
            <span class="text-xs uppercase tracking-wider text-fg-muted font-semibold">Offer Status</span>
            <div class="mt-1 flex items-center gap-2">
              <BaseBadge :variant="getStatusBadgeVariant(selectedOffer.status)" class="capitalize text-sm py-1 px-3">
                {{ formatStatus(selectedOffer.status) }}
              </BaseBadge>
              <span v-if="selectedOffer.is_backup_offer" class="text-xs bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold px-2 py-0.5 rounded">
                Backup Offer
              </span>
            </div>
          </div>

          <div class="text-right">
            <span class="text-xs uppercase tracking-wider text-fg-muted font-semibold">Purchase Price</span>
            <div class="text-2xl font-black text-fg">
              {{ formatCurrency(selectedOffer.offer_amount) }}
            </div>
          </div>
        </div>

        <!-- Property & Parties Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Property Info -->
          <div class="rounded-xl border border-border p-4 bg-surface">
            <h4 class="text-xs font-bold uppercase tracking-wider text-fg-muted mb-3 flex items-center gap-1.5">
              <Building class="h-4 w-4 text-primary" />
              Property Details
            </h4>
            <div class="text-sm font-semibold text-fg">
              {{ selectedOffer.listing?.address }}
            </div>
            <div class="text-xs text-fg-muted">
              {{ selectedOffer.listing?.city }}, {{ selectedOffer.listing?.state }} {{ selectedOffer.listing?.zip }}
            </div>
            <div class="mt-2 text-xs text-fg-muted">
              Listing Ref: <span class="font-mono text-fg">{{ selectedOffer.listing?.reference_code }}</span>
            </div>
          </div>

          <!-- Buyer & Agent Info -->
          <div class="rounded-xl border border-border p-4 bg-surface">
            <h4 class="text-xs font-bold uppercase tracking-wider text-fg-muted mb-3 flex items-center gap-1.5">
              <User class="h-4 w-4 text-primary" />
              Buyer Contact
            </h4>
            <div class="text-sm font-semibold text-fg">
              {{ selectedOffer.buyer_name || selectedOffer.buyer?.name || 'Buyer' }}
            </div>
            <div class="text-xs text-fg-muted">
              Email: {{ selectedOffer.buyer_email || selectedOffer.buyer?.email || 'N/A' }}
            </div>
            <div v-if="selectedOffer.buyer_phone" class="text-xs text-fg-muted">
              Phone: {{ selectedOffer.buyer_phone }}
            </div>
            <div v-if="selectedOffer.has_agent_representation" class="mt-2 pt-2 border-t border-border text-xs">
              <span class="font-semibold text-fg">Agent:</span> {{ selectedOffer.agent_name }} ({{ selectedOffer.agent_email }})
            </div>
          </div>
        </div>

        <!-- Financial Breakdown -->
        <div class="rounded-xl border border-border p-4 bg-surface">
          <h4 class="text-xs font-bold uppercase tracking-wider text-fg-muted mb-4 flex items-center gap-1.5">
            <DollarSign class="h-4 w-4 text-primary" />
            Financial Terms & Breakdown
          </h4>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span class="text-fg-muted block">Earnest Money (EMD)</span>
              <span class="text-sm font-bold text-fg mt-0.5 block">
                {{ formatCurrency(selectedOffer.earnest_money_deposit) }}
              </span>
            </div>
            <div>
              <span class="text-fg-muted block">Down Payment</span>
              <span class="text-sm font-bold text-fg mt-0.5 block">
                {{ formatCurrency(selectedOffer.down_payment_amount) }}
              </span>
            </div>
            <div>
              <span class="text-fg-muted block">Payment Method</span>
              <span class="text-sm font-bold capitalize text-fg mt-0.5 block">
                {{ selectedOffer.payment_method }}
              </span>
            </div>
            <div>
              <span class="text-fg-muted block">Seller Concessions</span>
              <span class="text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">
                {{ formatCurrency(selectedOffer.seller_concessions) }}
              </span>
            </div>
          </div>

          <!-- Net Calculation -->
          <div class="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
            <span class="text-fg-muted">Estimated Net to Seller (excluding commission/closing fees):</span>
            <span class="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {{ formatCurrency(Number(selectedOffer.offer_amount) - Number(selectedOffer.seller_concessions || 0)) }}
            </span>
          </div>
        </div>

        <!-- Contingencies & Closing Details -->
        <div class="rounded-xl border border-border p-4 bg-surface">
          <h4 class="text-xs font-bold uppercase tracking-wider text-fg-muted mb-3 flex items-center gap-1.5">
            <Calendar class="h-4 w-4 text-primary" />
            Closing & Contingencies
          </h4>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs mb-4">
            <div>
              <span class="text-fg-muted block">Closing Date</span>
              <span class="font-semibold text-fg">{{ formatDate(selectedOffer.closing_date) }}</span>
            </div>
            <div>
              <span class="text-fg-muted block">Occupancy</span>
              <span class="font-semibold text-fg capitalize">
                {{ selectedOffer.occupancy_type ? selectedOffer.occupancy_type.replace(/_/g, ' ') : 'At Closing' }}
                <span v-if="selectedOffer.occupancy_days">({{ selectedOffer.occupancy_days }} days)</span>
              </span>
            </div>
            <div>
              <span class="text-fg-muted block">Expiration Deadline</span>
              <span class="font-semibold text-fg">{{ formatDateTime(selectedOffer.deadline) }}</span>
            </div>
          </div>

          <!-- Contingencies Checklist -->
          <div v-if="selectedOffer.contingencies" class="pt-3 border-t border-border">
            <span class="text-xs font-semibold text-fg block mb-2">Selected Contingencies:</span>
            <div class="flex flex-wrap gap-2">
              <template v-for="(val, key) in selectedOffer.contingencies" :key="key">
                <span
                  v-if="val"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-raised border border-border text-xs text-fg font-medium capitalize"
                >
                  <Check class="h-3.5 w-3.5 text-emerald-500" />
                  {{ String(key).replace(/_/g, ' ') }}
                </span>
              </template>
            </div>
          </div>

          <!-- Additional Terms -->
          <div v-if="selectedOffer.additional_terms" class="mt-3 pt-3 border-t border-border">
            <span class="text-xs font-semibold text-fg block mb-1">Additional Terms:</span>
            <p class="text-xs text-fg-muted bg-surface-raised p-3 rounded-lg whitespace-pre-wrap">
              {{ selectedOffer.additional_terms }}
            </p>
          </div>
        </div>

        <!-- Attached Documents -->
        <div class="rounded-xl border border-border p-4 bg-surface">
          <h4 class="text-xs font-bold uppercase tracking-wider text-fg-muted mb-3 flex items-center gap-1.5">
            <FileText class="h-4 w-4 text-primary" />
            Verification Documents ({{ selectedOffer.documents?.length || 0 }})
          </h4>

          <div v-if="!selectedOffer.documents || selectedOffer.documents.length === 0" class="text-xs text-fg-muted">
            No attached documents submitted with this offer.
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="doc in selectedOffer.documents"
              :key="doc.id"
              class="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-raised text-xs"
            >
              <div class="flex items-center gap-3">
                <FileText class="h-4 w-4 text-primary shrink-0" />
                <div>
                  <div class="font-medium text-fg">{{ doc.original_name }}</div>
                  <div class="text-[11px] text-fg-muted capitalize">{{ doc.type.replace(/_/g, ' ') }} • {{ Math.round(doc.size / 1024) }} KB</div>
                </div>
              </div>

              <BaseButton
                variant="secondary"
                size="sm"
                :disabled="isDownloadingDoc === doc.id"
                @click="handleDownloadDoc(doc.id, doc.original_name)"
              >
                <Download class="mr-1 h-3.5 w-3.5" :class="{ 'animate-bounce': isDownloadingDoc === doc.id }" />
                Download
              </BaseButton>
            </div>
          </div>
        </div>

        <!-- Action / Negotiation History Timeline -->
        <div class="rounded-xl border border-border p-4 bg-surface">
          <h4 class="text-xs font-bold uppercase tracking-wider text-fg-muted mb-3 flex items-center gap-1.5">
            <Clock class="h-4 w-4 text-primary" />
            Negotiation & Activity Timeline
          </h4>

          <div v-if="!selectedOffer.actions || selectedOffer.actions.length === 0" class="text-xs text-fg-muted">
            Initial offer submission recorded on {{ formatDateTime(selectedOffer.created_at) }}.
          </div>

          <div v-else class="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-border">
            <div
              v-for="act in selectedOffer.actions"
              :key="act.id"
              class="relative flex items-start gap-3 pl-8"
            >
              <div class="absolute left-1.5 mt-1 h-4 w-4 rounded-full border-2 border-surface bg-primary ring-2 ring-primary/20"></div>

              <div class="flex-1 rounded-lg border border-border bg-surface-raised p-3 text-xs">
                <div class="flex items-center justify-between gap-2">
                  <span class="font-bold text-fg capitalize">
                    {{ act.action_type.replace(/_/g, ' ') }}
                    <span v-if="act.offer_amount" class="text-primary font-bold">
                      ({{ formatCurrency(act.offer_amount) }})
                    </span>
                  </span>
                  <span class="text-fg-muted text-[11px]">{{ formatDateTime(act.created_at) }}</span>
                </div>
                <div class="text-fg-muted mt-1">
                  Actor: <span class="text-fg font-medium capitalize">{{ act.actor_type }}</span>
                  <span v-if="act.user"> ({{ act.user.name || act.user.first_name }})</span>
                </div>
                <p v-if="act.comment" class="mt-2 text-fg bg-surface p-2 rounded border border-border/50 text-xs italic">
                  "{{ act.comment }}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>
