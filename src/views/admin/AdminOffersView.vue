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
  Users,
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
const isDownloadingContract = ref(false)

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
    errorMessage.value = err?.response?.data?.message || 'Failed to load offers overview.'
  } finally {
    isLoading.value = false
  }
}

function handleTabChange(val: string) {
  queryParams.status = val
  queryParams.page = 1
  loadOffers()
}

function handleSearch(val: string) {
  queryParams.search = val
  queryParams.page = 1
  loadOffers()
}

function handlePageChange(page: number) {
  queryParams.page = page
  loadOffers()
}

async function openDetailModal(offer: ListingOffer) {
  selectedOffer.value = offer
  isDetailModalOpen.value = true
  try {
    const res = await offerApi.getAdminOffer(offer.id)
    if (res.data) {
      selectedOffer.value = res.data
    }
  } catch {
    // Keep list view copy if detailed fetch fails
  }
}

async function handleDownloadDoc(docId: string, fileName: string) {
  if (!selectedOffer.value) return
  isDownloadingDoc.value = docId
  try {
    const res = await offerApi.downloadOfferDocument(selectedOffer.value.id, docId)
    const url = window.URL.createObjectURL(new Blob([res.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch {
    toast.error('Failed to download document.')
  } finally {
    isDownloadingDoc.value = null
  }
}

async function handleDownloadContract() {
  if (!selectedOffer.value) return
  isDownloadingContract.value = true
  try {
    const res = await offerApi.downloadOfferContract(selectedOffer.value.id)
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Purchase_Agreement_${selectedOffer.value.reference_code}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    toast.success('Purchase agreement contract downloaded.')
  } catch {
    toast.error('Failed to download contract.')
  } finally {
    isDownloadingContract.value = false
  }
}

function formatCurrency(val?: number | string | null) {
  if (val === undefined || val === null) return '$0'
  return `$${Number(val).toLocaleString()}`
}

function formatDate(iso?: string | null) {
  if (!iso) return 'N/A'
  return new Date(iso).toLocaleDateString()
}

function formatDateTime(iso?: string | null) {
  if (!iso) return 'N/A'
  return new Date(iso).toLocaleString()
}

function formatStatus(status: string) {
  return status.replace(/_/g, ' ')
}

function getStatusBadgeVariant(status: string): 'success' | 'warning' | 'danger' | 'info' | 'secondary' {
  switch (status) {
    case 'accepted':
      return 'success'
    case 'submitted':
      return 'warning'
    case 'countered_by_seller':
    case 'countered_by_buyer':
      return 'info'
    case 'rejected':
    case 'rejected_under_contract':
      return 'danger'
    case 'withdrawn':
    case 'expired':
    default:
      return 'secondary'
  }
}

onMounted(() => {
  loadOffers()
})
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Offer Management"
      description="Supervise property purchase offers, negotiation timelines, bottom-line calculations, and closing contracts across all active listings."
    >
      <template #actions>
        <BaseButton variant="secondary" :disabled="isLoading" @click="loadOffers">
          <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </BaseButton>
      </template>
    </PageHeader>

    <!-- Key Metrics Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Total Offers -->
      <BaseCard class="p-5 flex items-center gap-4">
        <div class="rounded-xl bg-indigo-50 dark:bg-indigo-950/50 p-3 text-indigo-600 dark:text-indigo-400">
          <Handshake class="h-6 w-6" />
        </div>
        <div>
          <div class="text-xs uppercase tracking-wider font-semibold text-fg-muted">Total Offers</div>
          <div class="text-2xl font-black text-fg mt-0.5">{{ metrics.total_offers }}</div>
        </div>
      </BaseCard>

      <!-- Active In Negotiation -->
      <BaseCard class="p-5 flex items-center gap-4">
        <div class="rounded-xl bg-amber-50 dark:bg-amber-950/50 p-3 text-amber-600 dark:text-amber-400">
          <Clock class="h-6 w-6" />
        </div>
        <div>
          <div class="text-xs uppercase tracking-wider font-semibold text-fg-muted">Active Negotiations</div>
          <div class="text-2xl font-black text-fg mt-0.5">{{ metrics.active_offers }}</div>
        </div>
      </BaseCard>

      <!-- Accepted Volume -->
      <BaseCard class="p-5 flex items-center gap-4">
        <div class="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 p-3 text-emerald-600 dark:text-emerald-400">
          <TrendingUp class="h-6 w-6" />
        </div>
        <div>
          <div class="text-xs uppercase tracking-wider font-semibold text-fg-muted">Accepted Volume</div>
          <div class="text-2xl font-black text-fg mt-0.5">{{ formatCurrency(metrics.accepted_volume) }}</div>
        </div>
      </BaseCard>

      <!-- Accepted Count -->
      <BaseCard class="p-5 flex items-center gap-4">
        <div class="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 p-3 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 class="h-6 w-6" />
        </div>
        <div>
          <div class="text-xs uppercase tracking-wider font-semibold text-fg-muted">Closed / Accepted</div>
          <div class="text-2xl font-black text-fg mt-0.5">{{ metrics.accepted_offers }}</div>
        </div>
      </BaseCard>
    </div>

    <!-- Filter Bar & Search -->
    <BaseCard class="p-4">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Tabs
          :tabs="statusTabs"
          :model-value="queryParams.status"
          @update:model-value="handleTabChange"
        />

        <div class="w-full md:w-72">
          <SearchInput
            :model-value="queryParams.search"
            placeholder="Search ref, buyer, address..."
            @update:model-value="handleSearch"
          />
        </div>
      </div>
    </BaseCard>

    <!-- Offers Table Card -->
    <BaseCard class="overflow-hidden">
      <div v-if="isLoading" class="p-8">
        <LoadingState label="Loading offer transactions..." />
      </div>

      <div v-else-if="errorMessage" class="p-8">
        <ErrorState :description="errorMessage" @retry="loadOffers" />
      </div>

      <div v-else-if="!offers || offers.length === 0" class="p-8">
        <EmptyState
          :icon="Handshake"
          title="No offers found"
          description="There are no buyer offers matching your current filter criteria."
        />
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm text-fg">
          <thead class="border-b border-border bg-surface-raised/50 text-xs uppercase font-semibold text-fg-muted">
            <tr>
              <th class="px-5 py-3.5">Ref / Date</th>
              <th class="px-5 py-3.5">Listing Property</th>
              <th class="px-5 py-3.5">Buyer</th>
              <th class="px-5 py-3.5">Offer Amount</th>
              <th class="px-5 py-3.5">Terms</th>
              <th class="px-5 py-3.5">Status</th>
              <th class="px-5 py-3.5 text-right">Actions</th>
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

        <!-- Legal Purchasers Section -->
        <div v-if="selectedOffer.purchasers && selectedOffer.purchasers.length > 0" class="rounded-xl border border-border p-4 bg-surface">
          <h4 class="text-xs font-bold uppercase tracking-wider text-fg-muted mb-3 flex items-center gap-1.5">
            <Users class="h-4 w-4 text-primary" />
            Legal Offer Purchasers ({{ selectedOffer.purchasers.length }})
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="(purchaser, idx) in selectedOffer.purchasers"
              :key="idx"
              class="p-3 rounded-lg border border-border bg-surface-raised text-xs space-y-1"
            >
              <div class="flex items-center justify-between">
                <span class="font-bold text-fg">{{ purchaser.first_name }} {{ purchaser.last_name }}</span>
                <span v-if="purchaser.is_main" class="bg-indigo-50 dark:bg-indigo-950 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded">
                  Primary Purchaser
                </span>
              </div>
              <div class="text-fg-muted">{{ purchaser.email }}</div>
              <div v-if="purchaser.street_address" class="text-fg-muted">
                {{ purchaser.street_address }}{{ purchaser.unit_number ? `, Unit ${purchaser.unit_number}` : '' }}, {{ purchaser.city }}, {{ purchaser.zip }}
              </div>
              <div v-if="purchaser.non_us_citizen" class="text-amber-600 dark:text-amber-400 font-medium text-[11px]">
                ⚠ Non-US Citizen Purchaser
              </div>
            </div>
          </div>
        </div>

        <!-- Financial Breakdown & Reozom Net Calculation -->
        <div class="rounded-xl border border-border p-4 bg-surface">
          <h4 class="text-xs font-bold uppercase tracking-wider text-fg-muted mb-4 flex items-center gap-1.5">
            <DollarSign class="h-4 w-4 text-primary" />
            Financial Terms & Bottom Line Net Calculation
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

          <!-- Reozom Live Net Calculation Breakdown -->
          <div class="mt-4 pt-3 border-t border-border space-y-1.5 text-xs">
            <div class="flex items-center justify-between text-fg-muted">
              <span>Gross Purchase Price:</span>
              <span class="font-medium text-fg">{{ formatCurrency(selectedOffer.offer_amount) }}</span>
            </div>
            <div v-if="Number(selectedOffer.seller_concessions) > 0" class="flex items-center justify-between text-amber-600 dark:text-amber-400">
              <span>Less Seller Concessions:</span>
              <span>-{{ formatCurrency(selectedOffer.seller_concessions) }}</span>
            </div>
            <div v-if="Number(selectedOffer.commission) > 0" class="flex items-center justify-between text-fg-muted">
              <span>Less Buyer Agent Commission ({{ selectedOffer.commission }}{{ selectedOffer.commission_type === 1 ? '%' : '$' }}):</span>
              <span>
                -{{ formatCurrency(selectedOffer.commission_type === 1 ? (Number(selectedOffer.offer_amount) * Number(selectedOffer.commission) / 100) : Number(selectedOffer.commission)) }}
              </span>
            </div>
            <div v-if="selectedOffer.home_warranty_included" class="flex items-center justify-between text-fg-muted">
              <span>Less Home Warranty:</span>
              <span>-{{ formatCurrency(selectedOffer.home_warranty_price || 499) }}</span>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-border font-bold">
              <span class="text-fg">Reozom Bottom Line Net to Seller:</span>
              <div class="text-right">
                <span class="text-base text-emerald-600 dark:text-emerald-400">
                  {{ formatCurrency(selectedOffer.bottom_line_offer ?? (Number(selectedOffer.offer_amount) - Number(selectedOffer.seller_concessions || 0))) }}
                </span>
                <span class="text-xs text-primary font-semibold ml-1.5">
                  ({{ selectedOffer.percentage ?? 100 }}%)
                </span>
              </div>
            </div>
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
                <span v-if="selectedOffer.occupancy_days">({{ selectedOffer.occupancy_days }} days<span v-if="selectedOffer.fee_per_day"> @ ${{ selectedOffer.fee_per_day }}/day</span>)</span>
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

        <!-- Official Purchase Agreement Contract (PDF) -->
        <div class="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <FileText class="h-5 w-5 text-primary" />
            <div>
              <div class="text-xs font-bold text-fg">Reozom Purchase Agreement & Offer Contract</div>
              <div class="text-[11px] text-fg-muted">Official electronic legal contract with pricing, terms, contingencies and signatures</div>
            </div>
          </div>
          <BaseButton
            variant="primary"
            size="sm"
            :disabled="isDownloadingContract"
            @click="handleDownloadContract"
          >
            <Download class="mr-1.5 h-3.5 w-3.5" :class="{ 'animate-bounce': isDownloadingContract }" />
            {{ isDownloadingContract ? 'Generating...' : 'Download Contract (PDF)' }}
          </BaseButton>
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
                <div v-if="act.terms_snapshot" class="mt-2 p-2 bg-surface rounded border border-border/50 text-[11px] text-fg-muted">
                  <span class="font-semibold text-fg">Terms Snapshot:</span>
                  <span v-if="act.terms_snapshot.offer_amount"> Price: {{ formatCurrency(act.terms_snapshot.offer_amount) }}</span>
                  <span v-if="act.terms_snapshot.closing_date"> • Close: {{ act.terms_snapshot.closing_date }}</span>
                  <span v-if="act.terms_snapshot.seller_concessions"> • Concessions: {{ formatCurrency(act.terms_snapshot.seller_concessions) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>
