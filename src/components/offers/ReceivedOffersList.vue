<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { Handshake } from 'lucide-vue-next'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import PaginationBar from '@/components/ui/PaginationBar.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import * as offerApi from '@/services/offerService'
import type { InvolvementOffer, InvolvementOffersResponse } from '@/services/offerService'

/**
 * "Received Offers": offers on the user's listings (and, for an agent, on
 * clients' listings that use one of their plans). Offers are accepted /
 * countered / rejected on the listing's Offers tab, which "Manage" opens.
 */
const props = defineProps<{ isAgent: boolean }>()
const emit = defineEmits<{ (e: 'counts', counts: InvolvementOffersResponse['counts']): void }>()

const offers = ref<InvolvementOffer[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const filters = reactive({ search: '', status: 'all', page: 1 })
const meta = ref({ current_page: 1, last_page: 1, per_page: 15, total: 0 })

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'submitted', label: 'New' },
  { value: 'countered', label: 'In negotiation' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
]

let latestRequest = 0

async function load() {
  const requestId = ++latestRequest
  isLoading.value = true
  errorMessage.value = null
  try {
    const res = await offerApi.getOffersByInvolvement({
      involvement: 'received',
      status: filters.status === 'all' ? undefined : filters.status,
      search: filters.search || undefined,
      page: filters.page,
      per_page: 15,
    })
    if (requestId !== latestRequest) return
    offers.value = res.data.offers.data
    meta.value = {
      current_page: res.data.offers.current_page,
      last_page: res.data.offers.last_page,
      per_page: res.data.offers.per_page,
      total: res.data.offers.total,
    }
    emit('counts', res.data.counts)
  } catch (err: any) {
    if (requestId !== latestRequest) return
    offers.value = []
    errorMessage.value = err?.response?.data?.message || 'Failed to load received offers.'
  } finally {
    if (requestId === latestRequest) isLoading.value = false
  }
}

watch(() => filters.status, () => {
  filters.page = 1
  load()
})

function onSearch(value: string) {
  filters.search = value
  filters.page = 1
  load()
}

function onPage(page: number) {
  filters.page = page
  load()
}

/** Where the listing's offers are handled, in the viewer's own portal. */
function manageLink(offer: InvolvementOffer) {
  const base = props.isAgent ? '/agent' : ''
  return `${base}/listings/${offer.listing_id}?tab=offers`
}

function formatCurrency(val?: number | string | null) {
  return `$${Number(val ?? 0).toLocaleString()}`
}

function formatDate(iso?: string | null) {
  return iso ? new Date(iso).toLocaleDateString() : 'N/A'
}

function statusLabel(status: string) {
  return status === 'submitted' ? 'new' : status.replace(/_/g, ' ')
}

function statusVariant(status: string): 'success' | 'warning' | 'danger' | 'info' | 'secondary' {
  if (status === 'accepted') return 'success'
  if (status === 'submitted') return 'warning'
  if (status.startsWith('countered')) return 'info'
  if (status.startsWith('rejected')) return 'danger'
  return 'secondary'
}

function buyerName(offer: InvolvementOffer) {
  return offer.buyer_name || offer.buyer?.name || 'Buyer'
}

onMounted(load)
defineExpose({ reload: load })
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="w-full sm:w-72">
        <SearchInput :model-value="filters.search" placeholder="Search ref, buyer, address..." @update:model-value="onSearch" />
      </div>
      <select
        v-model="filters.status"
        aria-label="Offer status"
        class="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg focus:border-primary focus:outline-none"
      >
        <option v-for="opt in STATUS_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
    </div>

    <div class="overflow-hidden rounded-2xl border border-border bg-surface">
      <div v-if="isLoading && offers.length === 0" class="p-8">
        <LoadingState label="Loading received offers..." />
      </div>
      <div v-else-if="errorMessage" class="p-8">
        <ErrorState :description="errorMessage" @retry="load" />
      </div>
      <div v-else-if="offers.length === 0" class="p-8">
        <EmptyState
          :icon="Handshake"
          title="No received offers"
          :description="isAgent
            ? 'Offers on your listings and on your clients\' listings will appear here.'
            : 'Offers buyers make on your listings will appear here.'"
        />
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm text-fg">
          <thead class="border-b border-border bg-surface-raised/50 text-xs font-semibold uppercase text-fg-muted">
            <tr>
              <th class="px-5 py-3">Ref / Date</th>
              <th class="px-5 py-3">Property</th>
              <th class="px-5 py-3">Buyer</th>
              <th class="px-5 py-3">Offer</th>
              <th class="px-5 py-3">Status</th>
              <th class="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="offer in offers"
              :key="offer.id"
              class="transition-colors hover:bg-surface-raised/50"
              :class="offer.is_action_required ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''"
            >
              <td class="px-5 py-4">
                <div class="font-mono text-xs font-semibold text-primary">{{ offer.reference_code }}</div>
                <div class="mt-0.5 text-xs text-fg-muted">{{ formatDate(offer.created_at) }}</div>
              </td>
              <td class="px-5 py-4">
                <div class="font-medium">{{ offer.listing?.address || 'Listing' }}</div>
                <div class="text-xs text-fg-muted">
                  {{ offer.listing?.city }}, {{ offer.listing?.state }} {{ offer.listing?.zip }}
                </div>
                <span
                  v-if="offer.my_role === 'agent'"
                  class="mt-1 inline-block rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                >
                  Client listing
                </span>
              </td>
              <td class="px-5 py-4">
                <div class="font-medium">{{ buyerName(offer) }}</div>
                <div class="text-xs text-fg-muted">{{ offer.buyer_email || offer.buyer?.email }}</div>
              </td>
              <td class="px-5 py-4">
                <div class="font-bold">{{ formatCurrency(offer.offer_amount) }}</div>
                <div class="mt-0.5 text-xs capitalize text-fg-muted">{{ offer.payment_method }}</div>
              </td>
              <td class="px-5 py-4">
                <BaseBadge :variant="statusVariant(offer.status)" class="capitalize">{{ statusLabel(offer.status) }}</BaseBadge>
                <div v-if="offer.is_action_required" class="mt-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                  Action required
                </div>
              </td>
              <td class="px-5 py-4 text-right">
                <RouterLink
                  :to="manageLink(offer)"
                  class="inline-flex items-center rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-primary hover:bg-surface-raised"
                >
                  {{ offer.my_role === 'agent' ? 'View' : 'Manage' }}
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="meta.last_page > 1" class="border-t border-border p-4">
          <PaginationBar
            :page="meta.current_page"
            :total-items="meta.total"
            :per-page="meta.per_page"
            :per-page-options="[15]"
            @update:page="onPage"
          />
        </div>
      </div>
    </div>
  </div>
</template>
