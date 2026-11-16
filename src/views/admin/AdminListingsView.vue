<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import {
  Building2,
  CheckCircle,
  Download,
  Eye,
  FileText,
  Handshake,
  Image,
  RefreshCw,
  Search,
  Slash,
  Sliders,
  XCircle,
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
import ListingStatusModal from '@/components/admin/ListingStatusModal.vue'
import RejectListingModal from '@/components/admin/RejectListingModal.vue'
import { useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toast'
import * as adminListingService from '@/services/adminListingService'
import type { AdminListingDetail } from '@/services/adminListingService'

const toast = useToastStore()
const router = useRouter()

const listings = ref<AdminListingDetail[]>([])
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

const queryParams = reactive({
  search: '',
  status: 'all',
  page: 1,
  per_page: 10,
})

const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
})

const statusTabs = [
  { value: 'all', label: 'All Listings' },
  { value: 'published', label: 'Published' },
  { value: 'submitted', label: 'Waiting Approval' },
  { value: 'under_contract', label: 'Pending' },
  { value: 'ccs', label: 'Contingent (CCS)' },
  { value: 'sold', label: 'Sold' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'canceled', label: 'Canceled' },
  { value: 'expired', label: 'Expired' },
  { value: 'rejected', label: 'Rejected' },
]

// Moderation dialogs (listing details are a full page: /admin/listings/:id)
const selectedListing = ref<AdminListingDetail | null>(null)
const isRejectModalOpen = ref(false)
const isActionLoading = ref(false)
const isChangeStatusModalOpen = ref(false)
const changeStatusListing = ref<AdminListingDetail | null>(null)

async function loadListings() {
  isLoading.value = true
  errorMessage.value = null
  try {
    const res = await adminListingService.fetchAdminListings({
      search: queryParams.search || undefined,
      status: queryParams.status === 'all' ? undefined : queryParams.status,
      page: queryParams.page,
      per_page: queryParams.per_page,
    })
    const raw: any = res.data
    let items: AdminListingDetail[] = []
    if (Array.isArray(raw)) {
      items = raw
    } else if (raw && Array.isArray(raw.data)) {
      items = raw.data
    }
    listings.value = items

    const rawMeta = raw?.meta || (raw as any)?.pagination
    if (rawMeta) {
      pagination.value = {
        current_page: rawMeta.current_page || queryParams.page,
        last_page: rawMeta.last_page || 1,
        per_page: rawMeta.per_page || queryParams.per_page,
        total: rawMeta.total ?? items.length,
      }
    } else {
      pagination.value = {
        current_page: queryParams.page,
        last_page: 1,
        per_page: queryParams.per_page,
        total: items.length,
      }
    }
  } catch (err: any) {
    errorMessage.value = err?.response?.data?.message || 'Failed to load listings.'
  } finally {
    isLoading.value = false
  }
}

function handleTabChange(tabId: string) {
  queryParams.status = tabId
  queryParams.page = 1
  loadListings()
}

function handleSearch(query: string) {
  queryParams.search = query
  queryParams.page = 1
  loadListings()
}

function handlePageChange(page: number) {
  queryParams.page = page
  loadListings()
}

async function handlePublish(listing: AdminListingDetail) {
  isActionLoading.value = true
  try {
    await adminListingService.publishListing(listing.id)
    toast.success(`Listing ${listing.reference_code || listing.id} approved and published.`)
    await loadListings()
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Failed to publish listing.')
  } finally {
    isActionLoading.value = false
  }
}

async function handleUnpublish(listing: AdminListingDetail) {
  isActionLoading.value = true
  try {
    await adminListingService.unpublishListing(listing.id)
    toast.success(`Listing ${listing.reference_code || listing.id} unpublished.`)
    await loadListings()
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Failed to unpublish listing.')
  } finally {
    isActionLoading.value = false
  }
}

function openRejectModal(listing: AdminListingDetail) {
  selectedListing.value = listing
  isRejectModalOpen.value = true
}

function openChangeStatusModal(listing: AdminListingDetail) {
  changeStatusListing.value = listing
  isChangeStatusModalOpen.value = true
}

function getStatusBadgeVariant(status: string): 'success' | 'warning' | 'danger' | 'info' | 'secondary' {
  switch (status) {
    case 'published':
      return 'success'
    case 'submitted':
      return 'warning'
    case 'in_progress':
      return 'info'
    case 'under_contract':
    case 'pending':
      return 'warning'
    case 'ccs':
    case 'contingent_continue_to_show':
      return 'warning'
    case 'sold':
      return 'success'
    case 'rejected':
      return 'danger'
    case 'unpublished':
    case 'suspended':
    case 'canceled':
    case 'expired':
    case 'withdrawn':
    default:
      return 'secondary'
  }
}

onMounted(() => {
  loadListings()
})
</script>

<template>
  <div class="space-y-6">
    <PageHeader
      title="Listing Moderation"
      description="Review, verify, approve, unpublish, and inspect submitted listings across all agents."
    >
      <template #actions>
        <BaseButton variant="secondary" :disabled="isLoading" @click="loadListings">
          <RefreshCw class="mr-2 h-4 w-4" :class="{ 'animate-spin': isLoading }" />
          Refresh
        </BaseButton>
      </template>
    </PageHeader>

    <!-- Filter Tabs & Search Bar -->
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
            placeholder="Search address, code, seller..."
            @update:model-value="handleSearch"
          />
        </div>
      </div>
    </BaseCard>

    <!-- Listings Table Card -->
    <BaseCard class="overflow-hidden">
      <div v-if="isLoading" class="p-8">
        <LoadingState label="Loading listings for moderation..." />
      </div>

      <div v-else-if="errorMessage" class="p-8">
        <ErrorState :description="errorMessage" @retry="loadListings" />
      </div>

      <div v-else-if="!listings || listings.length === 0" class="p-8">
        <EmptyState
          :icon="Building2"
          title="No listings found"
          description="There are no listings matching the selected status or search filter."
        />
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm text-fg">
          <thead class="border-b border-border bg-bg-muted/50 text-xs uppercase text-fg-muted font-semibold">
            <tr>
              <th class="px-6 py-4">Ref Code</th>
              <th class="px-6 py-4">Property Address</th>
              <th class="px-6 py-4">Seller</th>
              <th class="px-6 py-4">Service Package</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4">Progress</th>
              <th class="px-6 py-4 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="listing in (listings || [])"
              :key="listing.id"
              class="transition-colors hover:bg-bg-muted/30"
            >
              <td class="px-6 py-4 font-mono font-medium text-primary">
                <router-link :to="`/admin/listings/${listing.id}`" class="hover:underline">{{ listing.reference_code || `REO-${listing.id}` }}</router-link>
              </td>
              <td class="px-6 py-4">
                <div class="font-medium text-fg">{{ listing.address || 'Address pending' }}</div>
                <div class="text-xs text-fg-muted">
                  {{ listing.city ? `${listing.city}, ${listing.state} ${listing.zip}` : listing.zip }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="font-medium">{{ listing.user?.name || 'Seller' }}</div>
                <div class="text-xs text-fg-muted">{{ listing.user?.email }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="font-medium">{{ listing.service_package?.name || 'Default' }}</div>
                <div v-if="listing.service_package?.price" class="text-xs text-fg-muted">
                  ${{ listing.service_package.price }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col gap-1 items-start">
                  <BaseBadge :variant="getStatusBadgeVariant(listing.status)">
                    {{ listing.status.toUpperCase() }}
                  </BaseBadge>
                  <span v-if="listing.moderation_status && listing.moderation_status !== 'none'" class="text-[11px] text-fg-muted">
                    Mod: {{ listing.moderation_status }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-xs font-medium">
                  {{ listing.steps_completed }} / {{ listing.steps_total }} steps
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <BaseButton
                    size="sm"
                    variant="secondary"
                    title="View Details & Documents"
                    @click="router.push(`/admin/listings/${listing.id}`)"
                  >
                    <Eye class="h-3.5 w-3.5" />
                  </BaseButton>

                  <BaseButton
                    size="sm"
                    variant="secondary"
                    title="Change Status (Reozom Audit)"
                    @click="openChangeStatusModal(listing)"
                  >
                    <Sliders class="mr-1 h-3.5 w-3.5" />
                    Status
                  </BaseButton>

                  <BaseButton
                    v-if="listing.status !== 'published'"
                    size="sm"
                    variant="primary"
                    :disabled="isActionLoading"
                    title="Approve & Publish to Public"
                    @click="handlePublish(listing)"
                  >
                    <CheckCircle class="mr-1 h-3.5 w-3.5" />
                    Publish
                  </BaseButton>

                  <BaseButton
                    v-if="listing.status === 'published'"
                    size="sm"
                    variant="secondary"
                    :disabled="isActionLoading"
                    title="Unpublish from Public"
                    @click="handleUnpublish(listing)"
                  >
                    <Slash class="mr-1 h-3.5 w-3.5" />
                    Unpublish
                  </BaseButton>

                  <BaseButton
                    v-if="listing.status !== 'rejected'"
                    size="sm"
                    variant="danger"
                    :disabled="isActionLoading"
                    title="Reject Listing"
                    @click="openRejectModal(listing)"
                  >
                    <XCircle class="h-3.5 w-3.5" />
                  </BaseButton>
                </div>
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

    <!-- Listing details are a full page: /admin/listings/:id -->
    <ListingStatusModal v-model="isChangeStatusModalOpen" :listing="changeStatusListing" @updated="loadListings" />
    <RejectListingModal v-model="isRejectModalOpen" :listing="selectedListing" @updated="loadListings" />
  </div>
</template>
