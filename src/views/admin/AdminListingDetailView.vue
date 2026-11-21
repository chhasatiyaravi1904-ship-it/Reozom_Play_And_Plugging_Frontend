<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, CheckCircle, Download, FileText, Handshake, LogIn, Slash, Sliders, XCircle } from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import ListingStatusModal from '@/components/admin/ListingStatusModal.vue'
import RejectListingModal from '@/components/admin/RejectListingModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import * as adminListingService from '@/services/adminListingService'
import * as offerApi from '@/services/offerService'
import * as documentService from '@/services/documentService'
import type { AdminListingDetail } from '@/services/adminListingService'

/** Admin listing detail & moderation (full page; replaces the previous popup). */
const route = useRoute()
const router = useRouter()
const toast = useToastStore()

const listingId = computed(() => Number(route.params.id))
const listing = ref<AdminListingDetail | null>(null)
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const isActionLoading = ref(false)

type Tab = 'overview' | 'answers' | 'documents' | 'media' | 'offers'
const TABS: Tab[] = ['overview', 'answers', 'documents', 'media', 'offers']
// Keep the open tab in the URL (?tab=documents) so it can be linked and survives a refresh
const activeTab = ref<Tab>(TABS.includes(route.query.tab as Tab) ? (route.query.tab as Tab) : 'overview')
watch(activeTab, (tab) => router.replace({ query: { ...route.query, tab } }))

const offers = ref<any[]>([])
const isLoadingOffers = ref(false)

const isStatusModalOpen = ref(false)
const isRejectModalOpen = ref(false)

// --- Log in as the listing's creator (to check the listing from their side) ---
const authStore = useAuthStore()
const isLoginAsOpen = ref(false)
const isLoggingIn = ref(false)

const owner = computed(() => listing.value?.user as (AdminListingDetail['user'] & { is_active?: boolean }) | undefined)
// Same rules as the backend: never another admin, only active accounts
const canLoginAsOwner = computed(() => !!owner.value && owner.value.role !== 'admin' && owner.value.is_active !== false)
const ownerRoleLabel = computed(() => (owner.value?.role === 'agent' ? 'Agent' : 'Seller'))

async function loginAsOwner() {
  if (!owner.value || !listing.value) return
  isLoggingIn.value = true
  try {
    const user = await authStore.startImpersonation(owner.value.id, `/admin/listings/${listing.value.id}`)
    isLoginAsOpen.value = false
    toast.success(`You are now logged in as ${user.fullName || user.email}.`)
    // Open this listing in the owner's portal
    router.push(user.role === 'agent' ? `/agent/listings/${listing.value.id}` : `/listings/${listing.value.id}`)
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Could not log in as this user.')
  } finally {
    isLoggingIn.value = false
  }
}

async function loadListing() {
  isLoading.value = true
  errorMessage.value = null
  try {
    const res = await adminListingService.fetchAdminListing(listingId.value)
    const detail = (res.data as any)?.data ?? res.data
    listing.value = detail && typeof detail === 'object' && 'id' in detail ? detail : null
    if (!listing.value) errorMessage.value = 'Listing not found.'
  } catch (err: any) {
    errorMessage.value = err?.response?.status === 404 ? 'Listing not found.' : (err?.response?.data?.message || 'Failed to load the listing.')
  } finally {
    isLoading.value = false
  }
}

async function loadOffers() {
  isLoadingOffers.value = true
  try {
    const res = await offerApi.getAdminOffers({ listing_id: listingId.value })
    offers.value = res.data.offers?.data || []
  } catch {
    offers.value = []
  } finally {
    isLoadingOffers.value = false
  }
}

function reload() {
  loadListing()
  loadOffers()
}

onMounted(reload)
watch(listingId, reload)

async function handlePublish() {
  if (!listing.value) return
  isActionLoading.value = true
  try {
    await adminListingService.publishListing(listing.value.id)
    toast.success(`Listing ${listing.value.reference_code || listing.value.id} approved and published.`)
    await loadListing()
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Failed to publish listing.')
  } finally {
    isActionLoading.value = false
  }
}

async function handleUnpublish() {
  if (!listing.value) return
  isActionLoading.value = true
  try {
    await adminListingService.unpublishListing(listing.value.id)
    toast.success(`Listing ${listing.value.reference_code || listing.value.id} unpublished.`)
    await loadListing()
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Failed to unpublish listing.')
  } finally {
    isActionLoading.value = false
  }
}

async function handleDownloadDoc(doc: NonNullable<AdminListingDetail['documents']>[number]) {
  if (!listing.value) return
  try {
    const res = await documentService.downloadDocument(listing.value.id, String(doc.id || doc.type))
    let filename = doc.original_name || `${doc.type || 'document'}.pdf`
    const disposition = res.headers?.['content-disposition']
    if (disposition) {
      const match = disposition.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?/i)
      if (match && match[1]) filename = decodeURIComponent(match[1].trim())
    }
    if (!filename.includes('.')) filename += '.pdf'

    const blob = new Blob([res.data], { type: String(res.headers?.['content-type'] || 'application/pdf') })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch {
    toast.error('Failed to download document.')
  }
}

async function handleViewDoc(doc: NonNullable<AdminListingDetail['documents']>[number]) {
  if (!listing.value) return
  try {
    const res = await documentService.viewDocument(listing.value.id, String(doc.id || doc.type))
    const url = URL.createObjectURL(res.data as Blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } catch {
    toast.error('Could not open the document.')
  }
}

/**
 * Answers grouped by step, with the question labels from the listing's steps
 * (falls back to the raw field name for answers no step defines).
 */
const answerGroups = computed(() => {
  const l = listing.value
  if (!l?.answers?.length) return []

  const steps = l.workflow_snapshot || []
  const fieldsByStep = new Map<string, Map<string, { label: string; options?: Array<{ label: string; value: string }> }>>()
  for (const step of steps) {
    const fields = new Map<string, { label: string; options?: Array<{ label: string; value: string }> }>()
    for (const section of step.sections || []) {
      for (const f of section.fields || []) fields.set(f.name || f.id, { label: f.label || f.name || f.id, options: f.options })
    }
    fieldsByStep.set(step.id, fields)
  }

  return l.answers.map((ans) => {
    const step = steps.find((s) => s.id === ans.step_id)
    const fields = fieldsByStep.get(ans.step_id)
    const rows = Object.entries(ans.values || {})
      // The wizard saves all values with every step: show only the step's own questions when known
      .filter(([key]) => !fields || fields.has(key))
      .map(([key, value]) => {
        const field = fields?.get(key)
        return { key, label: field?.label || key, value: formatValue(value, field?.options) }
      })
    return { stepId: ans.step_id, stepName: step?.name || ans.step_id, rows }
  }).filter((g) => g.rows.length > 0)
})

function formatValue(value: unknown, options?: Array<{ label: string; value: string }>): string {
  if (value === null || value === undefined || value === '') return '—'
  const label = (v: unknown) => options?.find((o) => String(o.value) === String(v))?.label ?? String(v)
  if (Array.isArray(value)) return value.map(label).join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return label(value)
}

function getStatusBadgeVariant(status: string): 'success' | 'warning' | 'danger' | 'info' | 'secondary' {
  switch (status) {
    case 'published':
    case 'sold':
    case 'signed':
      return 'success'
    case 'submitted':
    case 'under_contract':
    case 'pending':
    case 'ccs':
    case 'contingent_continue_to_show':
      return 'warning'
    case 'in_progress':
      return 'info'
    case 'rejected':
      return 'danger'
    default:
      return 'secondary'
  }
}

const tabLabels = computed<Record<Tab, string>>(() => ({
  overview: 'Overview',
  answers: `Form Answers (${answerGroups.value.length})`,
  documents: `Documents (${listing.value?.documents?.length || 0})`,
  media: `Photos (${listing.value?.images?.length || 0})`,
  offers: `Offers (${offers.value.length})`,
}))
</script>

<template>
  <div class="space-y-6">
    <router-link to="/admin/listings" class="inline-flex items-center gap-1 text-sm text-fg-muted hover:text-primary">
      <ArrowLeft class="h-4 w-4" /> Back to Listings
    </router-link>

    <LoadingState variant="detail" v-if="isLoading && !listing" :rows="4" label="Loading listing..." />

    <ErrorState v-else-if="errorMessage && !listing" :description="errorMessage">
      <template #action>
        <BaseButton variant="secondary" @click="reload">Try Again</BaseButton>
      </template>
    </ErrorState>

    <template v-else-if="listing">
      <!-- Header with moderation actions -->
      <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="text-2xl font-bold text-fg">{{ listing.reference_code || `Listing #${listing.id}` }}</h1>
            <BaseBadge :variant="getStatusBadgeVariant(listing.status)">{{ listing.status.toUpperCase() }}</BaseBadge>
            <span v-if="listing.moderation_status && listing.moderation_status !== 'none'" class="text-xs text-fg-muted">
              ({{ listing.moderation_status }})
            </span>
          </div>
          <p class="text-sm text-fg-muted mt-1">
            {{ listing.address }}, {{ listing.city }}, {{ listing.state }} {{ listing.zip }}
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <BaseButton
            v-if="canLoginAsOwner"
            variant="secondary"
            title="Log in as the user who created this listing and open it in their view"
            @click="isLoginAsOpen = true"
          >
            <LogIn class="mr-1 h-3.5 w-3.5" /> Log in as {{ ownerRoleLabel }}
          </BaseButton>
          <BaseButton variant="secondary" @click="isStatusModalOpen = true">
            <Sliders class="mr-1 h-3.5 w-3.5" /> Change Status
          </BaseButton>
          <BaseButton v-if="listing.status !== 'published'" variant="primary" :disabled="isActionLoading" @click="handlePublish">
            <CheckCircle class="mr-1 h-3.5 w-3.5" /> Approve & Publish
          </BaseButton>
          <BaseButton v-else variant="secondary" :disabled="isActionLoading" @click="handleUnpublish">
            <Slash class="mr-1 h-3.5 w-3.5" /> Unpublish
          </BaseButton>
          <BaseButton v-if="listing.status !== 'rejected'" variant="danger" :disabled="isActionLoading" @click="isRejectModalOpen = true">
            <XCircle class="mr-1 h-3.5 w-3.5" /> Reject with Feedback
          </BaseButton>
        </div>
      </div>

      <!-- Summary -->
      <BaseCard class="p-0">
        <div class="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div class="text-xs text-fg-muted">Seller</div>
            <div class="font-medium text-sm">{{ listing.user?.name || 'Seller' }}</div>
            <div class="text-xs text-fg-muted">{{ listing.user?.email }}</div>
          </div>
          <div>
            <div class="text-xs text-fg-muted">Service Package</div>
            <div class="font-medium text-sm">{{ listing.service_package?.name || 'Default' }}</div>
            <div v-if="listing.service_package?.price" class="text-xs text-fg-muted">${{ listing.service_package.price }}</div>
          </div>
          <div>
            <div class="text-xs text-fg-muted">Listing Process</div>
            <div class="font-medium text-sm">{{ listing.listing_process?.name || '—' }}</div>
          </div>
          <div>
            <div class="text-xs text-fg-muted">Progress</div>
            <div class="font-medium text-sm">{{ listing.steps_completed }} of {{ listing.steps_total }} steps</div>
          </div>
        </div>
      </BaseCard>

      <!-- Tabs -->
      <div class="flex border-b border-border overflow-x-auto">
        <button
          v-for="tab in TABS"
          :key="tab"
          type="button"
          class="px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap flex items-center gap-1.5"
          :class="activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-fg-muted hover:text-fg'"
          @click="activeTab = tab"
        >
          <Handshake v-if="tab === 'offers'" class="h-4 w-4" />
          {{ tabLabels[tab] }}
        </button>
      </div>

      <!-- Overview -->
      <BaseCard v-if="activeTab === 'overview'" class="p-5 space-y-4">
        <div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <span class="text-xs text-fg-muted block">Property Address</span>
            <span class="font-medium">{{ listing.address }}, {{ listing.city }}, {{ listing.state }} {{ listing.zip }}</span>
          </div>
          <div>
            <span class="text-xs text-fg-muted block">Created</span>
            <span class="font-medium">{{ new Date(listing.created_at).toLocaleString() }}</span>
          </div>
          <div v-if="listing.status_changed_date">
            <span class="text-xs text-fg-muted block">Status Changed</span>
            <span class="font-medium">{{ new Date(listing.status_changed_date).toLocaleString() }}</span>
          </div>
          <div v-if="listing.moderator">
            <span class="text-xs text-fg-muted block">Last Moderated By</span>
            <span class="font-medium">{{ listing.moderator.name }} ({{ listing.moderator.email }})</span>
          </div>
        </div>
        <div v-if="listing.sold_details" class="rounded bg-surface-raised border border-border p-3 text-xs space-y-1">
          <span class="font-bold text-fg block text-sm">Closing / Sold Details</span>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-fg-muted">
            <div v-if="listing.sold_details.sales_price">Price: <span class="text-fg font-semibold">${{ Number(listing.sold_details.sales_price).toLocaleString() }}</span></div>
            <div v-if="listing.sold_details.closed_date">Closed: <span class="text-fg font-semibold">{{ listing.sold_details.closed_date }}</span></div>
            <div v-if="listing.sold_details.anticipated_closed_date">Anticipated Close: <span class="text-fg font-semibold">{{ listing.sold_details.anticipated_closed_date }}</span></div>
            <div v-if="listing.sold_details.finance_type">Finance: <span class="text-fg font-semibold">{{ listing.sold_details.finance_type }}</span></div>
            <div v-if="listing.sold_details.agent_name">Agent: <span class="text-fg font-semibold">{{ listing.sold_details.agent_name }}</span></div>
          </div>
        </div>
        <div v-if="listing.rejection_reason" class="rounded bg-danger/10 p-3 text-danger text-sm">
          <span class="font-semibold block">Rejection Feedback</span>
          {{ listing.rejection_reason }}
        </div>
      </BaseCard>

      <!-- Form answers -->
      <div v-if="activeTab === 'answers'" class="space-y-4">
        <BaseCard v-if="!answerGroups.length" class="p-5 text-sm text-fg-muted italic">
          No form step answers have been saved yet.
        </BaseCard>
        <BaseCard v-for="group in answerGroups" :key="group.stepId" class="p-0 overflow-hidden">
          <div class="px-5 py-3 border-b border-border bg-bg-muted/40 font-semibold text-sm text-primary">{{ group.stepName }}</div>
          <table class="w-full text-sm">
            <tbody class="divide-y divide-border">
              <tr v-for="row in group.rows" :key="row.key">
                <td class="px-5 py-2 text-fg-muted w-1/2">{{ row.label }}</td>
                <td class="px-5 py-2 font-medium text-fg break-words">{{ row.value }}</td>
              </tr>
            </tbody>
          </table>
        </BaseCard>
      </div>

      <!-- Documents -->
      <BaseCard v-if="activeTab === 'documents'" class="p-5 space-y-3">
        <div v-if="!listing.documents?.length" class="text-fg-muted text-sm italic">No documents yet.</div>
        <div
          v-for="doc in listing.documents"
          :key="doc.id"
          class="flex flex-col gap-3 rounded border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex items-center gap-3">
            <FileText class="h-5 w-5 text-primary shrink-0" />
            <div>
              <div class="font-medium text-sm">{{ doc.original_name }}</div>
              <div class="text-xs text-fg-muted">
                {{ doc.document_template_id ? 'Generated' : 'Uploaded' }} · {{ Math.max(1, Math.round((doc.size || 0) / 1024)) }} KB
              </div>
              <div v-if="doc.signed_at" class="text-[11px] text-success mt-0.5">
                Signed {{ new Date(doc.signed_at).toLocaleDateString() }} {{ doc.signed_by ? 'by ' + doc.signed_by : '' }}
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <BaseBadge :variant="getStatusBadgeVariant(doc.status || '')">{{ doc.status || 'Pending' }}</BaseBadge>
            <BaseButton size="sm" variant="secondary" title="View" @click="handleViewDoc(doc)">View</BaseButton>
            <BaseButton size="sm" variant="secondary" title="Download" @click="handleDownloadDoc(doc)">
              <Download class="h-3.5 w-3.5" />
            </BaseButton>
          </div>
        </div>
      </BaseCard>

      <!-- Photos -->
      <BaseCard v-if="activeTab === 'media'" class="p-5">
        <div v-if="!listing.images?.length" class="text-fg-muted text-sm italic">No photos uploaded yet.</div>
        <div v-else class="grid grid-cols-2 gap-3 md:grid-cols-4">
          <a
            v-for="img in listing.images"
            :key="img.id"
            :href="img.url"
            target="_blank"
            rel="noopener"
            class="relative rounded overflow-hidden border border-border aspect-video bg-bg-muted block"
          >
            <img :src="img.thumbnail_url || img.url" class="object-cover w-full h-full" alt="Property photo" />
            <span v-if="img.is_primary" class="absolute top-1 left-1 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded font-semibold">Primary</span>
          </a>
        </div>
      </BaseCard>

      <!-- Offers -->
      <BaseCard v-if="activeTab === 'offers'" class="p-5 space-y-3">
        <div v-if="isLoadingOffers" class="text-fg-muted text-sm py-4 text-center">Loading offers...</div>
        <div v-else-if="!offers.length" class="text-fg-muted text-sm italic py-6 text-center">
          No buyer offers have been submitted for this property yet.
        </div>
        <div
          v-for="off in offers"
          v-else
          :key="off.id"
          class="flex flex-col gap-2 rounded-xl border border-border p-3.5 text-xs sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-bold text-fg text-sm">${{ Number(off.offer_amount).toLocaleString() }}</span>
              <BaseBadge :variant="getStatusBadgeVariant(off.status)" class="capitalize">{{ off.status.replace(/_/g, ' ') }}</BaseBadge>
              <span class="font-mono text-[11px] text-fg-muted">({{ off.reference_code }})</span>
            </div>
            <div class="text-fg-muted mt-1">
              Buyer: <span class="text-fg font-medium">{{ off.buyer_name || off.buyer?.name || 'Buyer' }}</span>
              · Payment: <span class="capitalize text-fg font-medium">{{ off.payment_method }}</span>
              · Closing: <span class="text-fg font-medium">{{ off.closing_date }}</span>
            </div>
          </div>
          <router-link
            :to="`/admin/offers?search=${encodeURIComponent(off.reference_code)}`"
            class="text-xs text-primary hover:underline font-semibold shrink-0"
          >
            Inspect Offer &rarr;
          </router-link>
        </div>
      </BaseCard>
    </template>

    <ConfirmDialog
      v-if="listing?.user"
      v-model="isLoginAsOpen"
      :title="`Log in as ${listing.user.name}`"
      :confirm-label="`Log in as ${ownerRoleLabel}`"
      :loading="isLoggingIn"
      @confirm="loginAsOwner"
    >
      This tab will switch to <span class="font-semibold text-fg">{{ listing.user.name }}</span>'s account
      and open this listing as they see it, so you can check for issues. Your other tabs stay logged in
      as admin. Use <span class="font-semibold text-fg">Return to admin</span> in the yellow bar to come back.
      This is recorded in the admin activity log.
    </ConfirmDialog>

    <ListingStatusModal v-model="isStatusModalOpen" :listing="listing" @updated="loadListing" />
    <RejectListingModal v-model="isRejectModalOpen" :listing="listing" @updated="loadListing" />
  </div>
</template>
