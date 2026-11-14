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
import Modal from '@/components/ui/Modal.vue'
import PaginationBar from '@/components/ui/PaginationBar.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import Tabs from '@/components/ui/Tabs.vue'
import { useToastStore } from '@/stores/toast'
import * as adminListingService from '@/services/adminListingService'
import * as offerApi from '@/services/offerService'
import * as documentService from '@/services/documentService'
import type { AdminListingDetail } from '@/services/adminListingService'

const toast = useToastStore()

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

// Modal & Moderation Action States
const selectedListing = ref<AdminListingDetail | null>(null)
const isDetailModalOpen = ref(false)
const isRejectModalOpen = ref(false)
const rejectionReason = ref('')
const isActionLoading = ref(false)
const detailTab = ref<'overview' | 'answers' | 'media' | 'documents' | 'offers'>('overview')
const listingOffers = ref<any[]>([])
const isLoadingOffers = ref(false)

// Reozom Admin Status Management Modal State
const isChangeStatusModalOpen = ref(false)
const changeStatusListing = ref<AdminListingDetail | null>(null)
const statusForm = reactive({
  status: 'published',
  comment: '',
  anticipated_closed_date: '',
  agent: 1 as 1 | 2,
  agent_name: '',
  closed_date: '',
  sales_price: undefined as number | undefined,
  sellers_concessions: 1 as 1 | 2,
  amount: undefined as number | undefined,
  finance_type: '',
})

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

async function loadListingOffers(listingId: number) {
  isLoadingOffers.value = true
  try {
    const res = await offerApi.getAdminOffers({ listing_id: listingId })
    listingOffers.value = res.data.offers?.data || []
  } catch {
    listingOffers.value = []
  } finally {
    isLoadingOffers.value = false
  }
}

async function openDetailModal(listing: AdminListingDetail) {
  selectedListing.value = listing
  detailTab.value = 'overview'
  isDetailModalOpen.value = true
  loadListingOffers(listing.id)
  try {
    const res = await adminListingService.fetchAdminListing(listing.id)
    const detail = (res.data as any)?.data ?? res.data
    if (detail && typeof detail === 'object' && 'id' in detail) {
      selectedListing.value = detail
    }
  } catch {
    // Keep list view copy if detailed fetch fails
  }
}

async function handlePublish(listing: AdminListingDetail) {
  isActionLoading.value = true
  try {
    const res = await adminListingService.publishListing(listing.id)
    toast.success(`Listing ${listing.reference_code || listing.id} approved and published.`)
    const updated = (res.data as any)?.data ?? res.data
    if (selectedListing.value?.id === listing.id && updated && typeof updated === 'object') {
      selectedListing.value = updated
    }
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
    const res = await adminListingService.unpublishListing(listing.id)
    toast.success(`Listing ${listing.reference_code || listing.id} unpublished.`)
    const updated = (res.data as any)?.data ?? res.data
    if (selectedListing.value?.id === listing.id && updated && typeof updated === 'object') {
      selectedListing.value = updated
    }
    await loadListings()
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Failed to unpublish listing.')
  } finally {
    isActionLoading.value = false
  }
}

function openRejectModal(listing: AdminListingDetail) {
  selectedListing.value = listing
  rejectionReason.value = ''
  isRejectModalOpen.value = true
}

async function handleDownloadDoc(doc: any) {
  if (!selectedListing.value) return
  const listingId = selectedListing.value.id
  const docKey = doc.id || doc.type
  try {
    const res = await documentService.downloadDocument(listingId, docKey)
    let filename = doc.original_name || `${doc.type || 'document'}.pdf`
    const disposition = res.headers?.['content-disposition']
    if (disposition) {
      const match = disposition.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?/i)
      if (match && match[1]) filename = decodeURIComponent(match[1].trim())
    }
    if (!filename.includes('.')) filename += '.pdf'

    const blob = new Blob([res.data], { type: res.headers?.['content-type'] || 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    toast.success(`Downloaded ${filename}`)
  } catch (err: any) {
    toast.error('Failed to download document.')
  }
}

async function confirmReject() {
  if (!selectedListing.value || !rejectionReason.value.trim()) return
  isActionLoading.value = true
  try {
    const res = await adminListingService.rejectListing(
      selectedListing.value.id,
      rejectionReason.value.trim(),
    )
    toast.success(`Listing rejected with feedback provided.`)
    isRejectModalOpen.value = false
    const updated = (res.data as any)?.data ?? res.data
    if (selectedListing.value?.id === updated?.id && updated && typeof updated === 'object') {
      selectedListing.value = updated
    }
    await loadListings()
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Failed to reject listing.')
  } finally {
    isActionLoading.value = false
  }
}

function openChangeStatusModal(listing: AdminListingDetail) {
  changeStatusListing.value = listing
  statusForm.status = listing.status || 'published'
  statusForm.comment = ''
  statusForm.anticipated_closed_date = listing.sold_details?.anticipated_closed_date || ''
  statusForm.agent = (listing.sold_details?.agent as 1 | 2) || 1
  statusForm.agent_name = listing.sold_details?.agent_name || ''
  statusForm.closed_date = listing.sold_details?.closed_date || ''
  statusForm.sales_price = listing.sold_details?.sales_price
  statusForm.sellers_concessions = (listing.sold_details?.sellers_concessions as 1 | 2) || 1
  statusForm.amount = listing.sold_details?.amount
  statusForm.finance_type = listing.sold_details?.finance_type || ''
  isChangeStatusModalOpen.value = true
}

async function confirmStatusChange() {
  if (!changeStatusListing.value || !statusForm.comment.trim()) {
    toast.error('Audit comment is required for status changes.')
    return
  }

  isActionLoading.value = true
  try {
    const payload: any = {
      status: statusForm.status,
      comment: statusForm.comment.trim(),
    }

    if (['under_contract', 'ccs', '2', '3'].includes(String(statusForm.status))) {
      if (statusForm.anticipated_closed_date) payload.anticipated_closed_date = statusForm.anticipated_closed_date
      if (statusForm.agent) payload.agent = Number(statusForm.agent)
      if (statusForm.agent_name) payload.agent_name = statusForm.agent_name
    }

    if (['sold', '4'].includes(String(statusForm.status))) {
      if (statusForm.closed_date) payload.closed_date = statusForm.closed_date
      if (statusForm.sales_price !== undefined && statusForm.sales_price !== null) payload.sales_price = Number(statusForm.sales_price)
      if (statusForm.sellers_concessions) payload.sellers_concessions = Number(statusForm.sellers_concessions)
      if (statusForm.amount !== undefined && statusForm.amount !== null) payload.amount = Number(statusForm.amount)
      if (statusForm.finance_type) payload.finance_type = statusForm.finance_type
      if (statusForm.agent_name) payload.agent_name = statusForm.agent_name
    }

    const res = await adminListingService.changeAdminListingStatus(changeStatusListing.value.id, payload)
    toast.success(`Listing status updated to ${statusForm.status}.`)
    isChangeStatusModalOpen.value = false

    const updated = (res.data as any)?.listing ?? (res.data as any)?.data ?? res.data
    if (selectedListing.value?.id === changeStatusListing.value.id && updated && typeof updated === 'object') {
      selectedListing.value = updated
    }
    await loadListings()
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Failed to update listing status.')
  } finally {
    isActionLoading.value = false
  }
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
                {{ listing.reference_code || `REO-${listing.id}` }}
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
                    @click="openDetailModal(listing)"
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

    <!-- Listing Detail & Moderation Modal -->
    <Modal
      v-model="isDetailModalOpen"
      size="lg"
      :title="`Listing Moderation: ${selectedListing?.reference_code || selectedListing?.id}`"
    >
      <div v-if="selectedListing" class="space-y-6">
        <!-- Status & Meta Bar -->
        <div class="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-bg-muted/50 p-4">
          <div>
            <div class="text-xs text-fg-muted">Current Public Status</div>
            <div class="mt-1 flex items-center gap-2">
              <BaseBadge :variant="getStatusBadgeVariant(selectedListing.status)">
                {{ selectedListing.status.toUpperCase() }}
              </BaseBadge>
              <span v-if="selectedListing.moderation_status" class="text-xs text-fg-muted">
                ({{ selectedListing.moderation_status }})
              </span>
            </div>
          </div>
          <div>
            <div class="text-xs text-fg-muted">Seller Account</div>
            <div class="font-medium text-sm">{{ selectedListing.user?.name }} ({{ selectedListing.user?.email }})</div>
          </div>
          <div>
            <div class="text-xs text-fg-muted">Assigned Service Package</div>
            <div class="font-medium text-sm">{{ selectedListing.service_package?.name || 'Default' }}</div>
          </div>
        </div>

        <!-- Detail Navigation Tabs -->
        <div class="flex border-b border-border">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium border-b-2"
            :class="detailTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-fg-muted hover:text-fg'"
            @click="detailTab = 'overview'"
          >
            Overview
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium border-b-2"
            :class="detailTab === 'answers' ? 'border-primary text-primary' : 'border-transparent text-fg-muted hover:text-fg'"
            @click="detailTab = 'answers'"
          >
            Form Answers ({{ selectedListing.answers?.length || 0 }})
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium border-b-2"
            :class="detailTab === 'documents' ? 'border-primary text-primary' : 'border-transparent text-fg-muted hover:text-fg'"
            @click="detailTab = 'documents'"
          >
            Documents ({{ selectedListing.documents?.length || 0 }})
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium border-b-2"
            :class="detailTab === 'media' ? 'border-primary text-primary' : 'border-transparent text-fg-muted hover:text-fg'"
            @click="detailTab = 'media'"
          >
            Photos ({{ selectedListing.images?.length || 0 }})
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium border-b-2 flex items-center gap-1.5"
            :class="detailTab === 'offers' ? 'border-primary text-primary' : 'border-transparent text-fg-muted hover:text-fg'"
            @click="detailTab = 'offers'"
          >
            <Handshake class="h-4 w-4" />
            Offers ({{ listingOffers.length }})
          </button>
        </div>

        <!-- Tab 1: Overview -->
        <div v-if="detailTab === 'overview'" class="space-y-4">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-xs text-fg-muted block">Property Address</span>
              <span class="font-medium">{{ selectedListing.address }}, {{ selectedListing.city }}, {{ selectedListing.state }} {{ selectedListing.zip }}</span>
            </div>
            <div>
              <span class="text-xs text-fg-muted block">Steps Completed</span>
              <span class="font-medium">{{ selectedListing.steps_completed }} of {{ selectedListing.steps_total }} steps</span>
            </div>
            <div v-if="selectedListing.moderator">
              <span class="text-xs text-fg-muted block">Last Moderated By</span>
              <span class="font-medium">{{ selectedListing.moderator.name }} ({{ selectedListing.moderator.email }})</span>
            </div>
            <div v-if="selectedListing.sold_details" class="col-span-2 rounded bg-surface-raised border border-border p-3 text-xs space-y-1">
              <span class="font-bold text-fg block text-sm">Closing / Sold Details:</span>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-fg-muted">
                <div v-if="selectedListing.sold_details.sales_price">Price: <span class="text-fg font-semibold">${{ Number(selectedListing.sold_details.sales_price).toLocaleString() }}</span></div>
                <div v-if="selectedListing.sold_details.closed_date">Closed: <span class="text-fg font-semibold">{{ selectedListing.sold_details.closed_date }}</span></div>
                <div v-if="selectedListing.sold_details.anticipated_closed_date">Anticipated Close: <span class="text-fg font-semibold">{{ selectedListing.sold_details.anticipated_closed_date }}</span></div>
                <div v-if="selectedListing.sold_details.finance_type">Finance: <span class="text-fg font-semibold">{{ selectedListing.sold_details.finance_type }}</span></div>
                <div v-if="selectedListing.sold_details.agent_name">Agent: <span class="text-fg font-semibold">{{ selectedListing.sold_details.agent_name }}</span></div>
              </div>
            </div>
            <div v-if="selectedListing.rejection_reason" class="col-span-2 rounded bg-danger/10 p-3 text-danger text-sm">
              <span class="font-semibold block">Rejection Feedback:</span>
              {{ selectedListing.rejection_reason }}
            </div>
          </div>
        </div>

        <!-- Tab 2: Answers -->
        <div v-if="detailTab === 'answers'" class="max-h-80 overflow-y-auto space-y-4">
          <div v-if="!selectedListing.answers?.length" class="text-fg-muted text-sm italic">
            No form step answers have been saved yet.
          </div>
          <div
            v-for="ans in selectedListing.answers"
            :key="ans.id"
            class="rounded border border-border p-3 text-sm space-y-2 bg-bg-muted/20"
          >
            <div class="font-semibold text-primary">Step: {{ ans.step_id }}</div>
            <pre class="text-xs bg-bg p-2 rounded overflow-x-auto text-fg font-mono">{{ JSON.stringify(ans.values, null, 2) }}</pre>
          </div>
        </div>

        <!-- Tab 3: Documents -->
        <div v-if="detailTab === 'documents'" class="space-y-3">
          <div v-if="!selectedListing.documents?.length" class="text-fg-muted text-sm italic">
            No compliance documents uploaded yet.
          </div>
          <div
            v-for="doc in selectedListing.documents"
            :key="doc.id"
            class="flex items-center justify-between rounded border border-border p-3"
          >
            <div class="flex items-center gap-3">
              <FileText class="h-5 w-5 text-primary" />
              <div>
                <div class="font-medium text-sm">{{ doc.original_name }}</div>
                <div class="text-xs text-fg-muted">Type: {{ doc.type }} | Size: {{ Math.round(doc.size / 1024) }} KB</div>
                <div v-if="doc.signed_at" class="text-[11px] text-success mt-0.5">
                  Signed: {{ new Date(doc.signed_at).toLocaleDateString() }} {{ doc.signed_by ? 'by ' + doc.signed_by : '' }}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <BaseBadge :variant="doc.status === 'signed' ? 'success' : 'secondary'">
                {{ doc.status === 'signed' ? 'Signed' : (doc.status || 'Pending') }}
              </BaseBadge>
              <BaseButton
                size="sm"
                variant="secondary"
                title="Download Document (PDF)"
                @click="handleDownloadDoc(doc)"
              >
                <Download class="h-3.5 w-3.5" />
              </BaseButton>
            </div>
          </div>
        </div>

        <!-- Tab 4: Photos -->
        <div v-if="detailTab === 'media'" class="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto">
          <div v-if="!selectedListing.images?.length" class="col-span-3 text-fg-muted text-sm italic">
            No photos uploaded yet.
          </div>
          <div
            v-for="img in selectedListing.images"
            :key="img.id"
            class="relative rounded overflow-hidden border border-border aspect-video bg-bg-muted"
          >
            <img :src="img.url" class="object-cover w-full h-full" alt="Property image" />
            <span v-if="img.is_primary" class="absolute top-1 left-1 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded font-semibold">
              Primary
            </span>
          </div>
        </div>

        <!-- Tab 5: Offers -->
        <div v-if="detailTab === 'offers'" class="space-y-3 max-h-80 overflow-y-auto">
          <div v-if="isLoadingOffers" class="text-fg-muted text-sm py-4 text-center">
            Loading offers for this listing...
          </div>
          <div v-else-if="!listingOffers.length" class="text-fg-muted text-sm italic py-6 text-center bg-bg-muted/30 rounded-xl border border-dashed border-border">
            No buyer offers have been submitted for this property yet.
          </div>
          <div
            v-else
            v-for="off in listingOffers"
            :key="off.id"
            class="flex items-center justify-between rounded-xl border border-border p-3.5 bg-surface hover:bg-surface-raised transition text-xs"
          >
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-fg text-sm">${{ Number(off.offer_amount).toLocaleString() }}</span>
                <BaseBadge :variant="getStatusBadgeVariant(off.status)" class="capitalize">
                  {{ off.status.replace(/_/g, ' ') }}
                </BaseBadge>
                <span class="font-mono text-[11px] text-fg-muted">({{ off.reference_code }})</span>
              </div>
              <div class="text-fg-muted mt-1">
                Buyer: <span class="text-fg font-medium">{{ off.buyer_name || off.buyer?.name || 'Buyer' }}</span>
                <span v-if="off.buyer_email || off.buyer?.email"> ({{ off.buyer_email || off.buyer?.email }})</span>
                • Payment: <span class="capitalize text-fg font-medium">{{ off.payment_method }}</span>
                • Closing: <span class="text-fg font-medium">{{ off.closing_date }}</span>
              </div>
            </div>
            <router-link
              :to="`/admin/offers?search=${encodeURIComponent(off.reference_code)}`"
              class="text-xs text-primary hover:underline font-semibold ml-4 shrink-0 inline-flex items-center gap-1"
            >
              Inspect Offer &rarr;
            </router-link>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-between w-full">
          <BaseButton variant="secondary" @click="isDetailModalOpen = false">Close</BaseButton>
          <div class="flex gap-2">
            <BaseButton
              v-if="selectedListing"
              variant="secondary"
              @click="openChangeStatusModal(selectedListing)"
            >
              <Sliders class="mr-1 h-3.5 w-3.5" />
              Change Status
            </BaseButton>
            <BaseButton
              v-if="selectedListing && selectedListing.status !== 'published'"
              variant="primary"
              :disabled="isActionLoading"
              @click="handlePublish(selectedListing)"
            >
              Approve & Publish
            </BaseButton>
            <BaseButton
              v-if="selectedListing && selectedListing.status === 'published'"
              variant="secondary"
              :disabled="isActionLoading"
              @click="handleUnpublish(selectedListing)"
            >
              Unpublish
            </BaseButton>
            <BaseButton
              v-if="selectedListing && selectedListing.status !== 'rejected'"
              variant="danger"
              :disabled="isActionLoading"
              @click="openRejectModal(selectedListing)"
            >
              Reject with Feedback
            </BaseButton>
          </div>
        </div>
      </template>
    </Modal>

    <!-- Reject Confirmation Modal -->
    <Modal
      v-model="isRejectModalOpen"
      size="md"
      title="Reject Listing"
    >
      <div class="space-y-4">
        <p class="text-sm text-fg-muted">
          Please provide a reason for rejecting listing
          <strong class="text-fg">{{ selectedListing?.reference_code || selectedListing?.id }}</strong>.
          The seller will receive this feedback to make corrections.
        </p>

        <div>
          <label class="block text-xs font-semibold text-fg mb-1">Rejection Reason / Feedback *</label>
          <textarea
            v-model="rejectionReason"
            rows="4"
            class="w-full rounded border border-border bg-bg p-2.5 text-sm text-fg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="E.g., Property deed is unclear or blurry. Please upload a higher resolution document."
          ></textarea>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <BaseButton variant="secondary" @click="isRejectModalOpen = false">Cancel</BaseButton>
          <BaseButton
            variant="danger"
            :disabled="!rejectionReason.trim() || isActionLoading"
            @click="confirmReject"
          >
            Confirm Rejection
          </BaseButton>
        </div>
      </template>
    </Modal>

    <!-- Reozom Admin Change Listing Status Modal -->
    <Modal
      v-model="isChangeStatusModalOpen"
      size="md"
      :title="`Change Listing Status: ${changeStatusListing?.reference_code || changeStatusListing?.id}`"
    >
      <form @submit.prevent="confirmStatusChange" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-fg mb-1">Target Status *</label>
          <select
            v-model="statusForm.status"
            required
            class="w-full rounded border border-border bg-bg p-2 text-sm text-fg focus:border-primary focus:outline-none"
          >
            <option value="published">1 - Active / Published</option>
            <option value="under_contract">2 - Pending / Under Contract</option>
            <option value="ccs">3 - Contingent - Continue to Show (CCS)</option>
            <option value="sold">4 - Sold</option>
            <option value="suspended">6 - Suspended</option>
            <option value="canceled">5 - Canceled</option>
            <option value="expired">7 - Expired</option>
            <option value="submitted">0 - Waiting Approval</option>
            <option value="rejected">-1 - Not Approved / Rejected</option>
            <option value="unpublished">Unpublished</option>
          </select>
          <p class="text-[11px] text-fg-muted mt-1">
            Replicating Reozom Administration status transitions with mandatory audit log.
          </p>
        </div>

        <div>
          <label class="block text-xs font-semibold text-fg mb-1">Audit Comment *</label>
          <textarea
            v-model="statusForm.comment"
            rows="3"
            maxlength="250"
            required
            placeholder="Reason for changing status (max 250 characters)..."
            class="w-full rounded border border-border bg-bg p-2.5 text-sm text-fg focus:border-primary focus:outline-none"
          ></textarea>
          <div class="text-right text-[11px] text-fg-muted">{{ statusForm.comment.length }} / 250</div>
        </div>

        <!-- Conditional Fields for Pending / CCS (2 or 3) -->
        <div v-if="['under_contract', 'ccs', '2', '3'].includes(String(statusForm.status))" class="p-3 bg-surface-raised rounded-lg border border-border space-y-3">
          <span class="text-xs font-bold text-fg block">Pending / Contingent Contract Details</span>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label class="block font-medium text-fg-muted mb-1">Anticipated Closing Date</label>
              <input
                v-model="statusForm.anticipated_closed_date"
                type="date"
                class="w-full rounded border border-border bg-bg p-2 text-fg text-xs"
              />
            </div>
            <div>
              <label class="block font-medium text-fg-muted mb-1">Agent Representation</label>
              <select
                v-model.number="statusForm.agent"
                class="w-full rounded border border-border bg-bg p-2 text-fg text-xs"
              >
                <option :value="1">Listing Agent</option>
                <option :value="2">Co-Agent / Buyer Agent</option>
              </select>
            </div>
            <div class="col-span-2">
              <label class="block font-medium text-fg-muted mb-1">Agent / Agency Name</label>
              <input
                v-model="statusForm.agent_name"
                type="text"
                placeholder="Agent or brokerage name"
                class="w-full rounded border border-border bg-bg p-2 text-fg text-xs"
              />
            </div>
          </div>
        </div>

        <!-- Conditional Fields for Sold (4) -->
        <div v-if="['sold', '4'].includes(String(statusForm.status))" class="p-3 bg-surface-raised rounded-lg border border-border space-y-3">
          <span class="text-xs font-bold text-fg block">Closing & Sold Contract Details</span>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label class="block font-medium text-fg-muted mb-1">Final Closed Date</label>
              <input
                v-model="statusForm.closed_date"
                type="date"
                class="w-full rounded border border-border bg-bg p-2 text-fg text-xs"
              />
            </div>
            <div>
              <label class="block font-medium text-fg-muted mb-1">Final Sales Price ($)</label>
              <input
                v-model.number="statusForm.sales_price"
                type="number"
                min="0"
                class="w-full rounded border border-border bg-bg p-2 text-fg text-xs"
              />
            </div>
            <div>
              <label class="block font-medium text-fg-muted mb-1">Financing Type</label>
              <input
                v-model="statusForm.finance_type"
                type="text"
                placeholder="Cash, Conventional, FHA, VA"
                class="w-full rounded border border-border bg-bg p-2 text-fg text-xs"
              />
            </div>
            <div>
              <label class="block font-medium text-fg-muted mb-1">Seller Concessions ($)</label>
              <input
                v-model.number="statusForm.amount"
                type="number"
                min="0"
                class="w-full rounded border border-border bg-bg p-2 text-fg text-xs"
              />
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t border-border">
          <BaseButton variant="secondary" @click="isChangeStatusModalOpen = false">Cancel</BaseButton>
          <BaseButton
            variant="primary"
            type="submit"
            :disabled="!statusForm.comment.trim() || isActionLoading"
          >
            {{ isActionLoading ? 'Updating...' : 'Update Status' }}
          </BaseButton>
        </div>
      </form>
    </Modal>
  </div>
</template>
