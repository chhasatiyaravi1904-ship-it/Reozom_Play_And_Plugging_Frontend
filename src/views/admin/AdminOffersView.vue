<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  Handshake,
  TrendingUp,
  Clock,
  CheckCircle2,
  FileText,
  Eye,
  RefreshCw,
} from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import PaginationBar from '@/components/ui/PaginationBar.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import Tabs from '@/components/ui/Tabs.vue'
import * as offerApi from '@/services/offerService'
import type { ListingOffer } from '@/services/offerService'

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

function formatCurrency(val?: number | string | null) {
  if (val === undefined || val === null) return '$0'
  return `$${Number(val).toLocaleString()}`
}

function formatDate(iso?: string | null) {
  if (!iso) return 'N/A'
  return new Date(iso).toLocaleDateString()
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
                <RouterLink
                  :to="{ name: 'admin-offer-detail', params: { id: offer.id } }"
                  class="inline-flex items-center rounded-lg bg-secondary px-4 py-1.5 text-label-sm font-label-sm text-on-secondary shadow-sm hover:bg-secondary-fixed"
                >
                  <Eye class="mr-1.5 h-3.5 w-3.5" />
                  Inspect
                </RouterLink>
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

  </div>
</template>
