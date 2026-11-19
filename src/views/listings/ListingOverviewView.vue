<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  Bath,
  Bed,
  Building,
  CheckCircle,
  CheckCircle2,
  Clock,
  Copy,
  DollarSign,
  ExternalLink,
  FileCheck,
  FileText,
  Handshake,
  History,
  Home,
  Image as ImageIcon,
  Layers,
  MapPin,
  Maximize2,
  Pencil,
  Percent,
  Share2,
  ShieldCheck,
  Sparkles,
  Tag,
  X,
} from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import Stepper from '@/components/listing/Stepper.vue'
import ListingImageManager from '@/components/listing/ListingImageManager.vue'
import ListingOffersTab from '@/components/offers/ListingOffersTab.vue'
import ListingStatusHistoryModal from '@/components/listings/ListingStatusHistoryModal.vue'
import { useListingStore } from '@/stores/listing'
import { useWorkflowStore } from '@/stores/workflow'
import { useListingSteps } from '@/composables/useListingSteps'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const listingId = Number(route.params.listingId)

const listingStore = useListingStore()
const workflowStore = useWorkflowStore()
const authStore = useAuthStore()
const { steps, routeFor } = useListingSteps(listingId)

const isOwner = computed(() => {
  const l = listingStore.activeListing
  if (!l) return false
  if (l.isOwner !== undefined) return Boolean(l.isOwner)
  if (l.userId && authStore.user?.id) {
    return Number(l.userId) === Number(authStore.user.id)
  }
  return false
})

const canMakeOffer = computed(() => {
  const l = listingStore.activeListing
  if (!l) return false
  if (l.canMakeOffer !== undefined) return Boolean(l.canMakeOffer)
  return (
    !isOwner.value &&
    ['published', 'under_contract', 'ccs', 'contingent_continue_to_show'].includes(l.status)
  )
})

// Active Tab inside Command Center
type OverviewTab = 'command' | 'workflow' | 'offers' | 'media' | 'documents'
const OVERVIEW_TABS: OverviewTab[] = ['command', 'workflow', 'offers', 'media', 'documents']
// ?tab=offers (e.g. from admin "Log in as Seller") opens that tab directly
const requestedTab = String(route.query.tab ?? '') as OverviewTab
const activeTab = ref<OverviewTab>(OVERVIEW_TABS.includes(requestedTab) ? requestedTab : 'command')

// Modal States
const isStatusModalOpen = ref(false)
const isPriceModalOpen = ref(false)
const isRemarksModalOpen = ref(false)
const isCompensationModalOpen = ref(false)
const isCopied = ref(false)

// Fast Edit Form States
const priceForm = ref({
  price: 0,
  reason: '',
})
const remarksForm = ref({
  listing_title: '',
  remarks: '',
  directions: '',
})
const compForm = ref({
  compensation: 0,
  compensation_type: 1 as 1 | 2,
  direct_buyer_rebate: 0,
  seller_concessions: 0,
})

const isSubmittingFastEdit = ref(false)
const fastEditError = ref<string | null>(null)

const isSubmitted = computed(() => listingStore.activeListing?.status === 'submitted')
const isPublished = computed(() => listingStore.activeListing?.status === 'published')
const isUnderContract = computed(() =>
  ['under_contract', 'ccs', 'contingent_continue_to_show'].includes(
    listingStore.activeListing?.status || '',
  ),
)

const currentStep = computed(
  () => steps.value.find((s) => s.status === 'current') ?? steps.value[0],
)

const formattedPrice = computed(() => {
  const p = listingStore.activeListing?.price
  if (p && Number(p) > 0) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(Number(p))
  }
  return 'Price Pending'
})

const publicListingUrl = computed(() => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/properties/${listingId}`
  }
  return `/properties/${listingId}`
})

onMounted(async () => {
  await Promise.all([listingStore.fetchListing(listingId), workflowStore.fetchWorkflow(listingId)])
  populateFastEditForms()
})

function populateFastEditForms() {
  const l = listingStore.activeListing
  if (!l) return
  priceForm.value.price = Number(l.price) || 0
  priceForm.value.reason = ''
  remarksForm.value.listing_title = l.listingTitle || ''
  remarksForm.value.remarks = l.remarks || ''
  remarksForm.value.directions = l.directions || ''
  compForm.value.compensation = Number(l.compensation) || 0
  compForm.value.compensation_type = (l.compensationType as 1 | 2) || 1
  compForm.value.direct_buyer_rebate = Number(l.directBuyerRebate) || 0
  compForm.value.seller_concessions = Number(l.sellerConcessions) || 0
}

function openPriceModal() {
  populateFastEditForms()
  fastEditError.value = null
  isPriceModalOpen.value = true
}

function openRemarksModal() {
  populateFastEditForms()
  fastEditError.value = null
  isRemarksModalOpen.value = true
}

function openCompensationModal() {
  populateFastEditForms()
  fastEditError.value = null
  isCompensationModalOpen.value = true
}

async function handleSavePrice() {
  if (priceForm.value.price <= 0) {
    fastEditError.value = 'Please enter a valid price greater than $0.'
    return
  }
  isSubmittingFastEdit.value = true
  fastEditError.value = null
  try {
    await listingStore.updatePrice(listingId, priceForm.value.price, priceForm.value.reason)
    isPriceModalOpen.value = false
  } catch (err: any) {
    fastEditError.value = err.response?.data?.message || 'Failed to update price.'
  } finally {
    isSubmittingFastEdit.value = false
  }
}

async function handleSaveRemarks() {
  isSubmittingFastEdit.value = true
  fastEditError.value = null
  try {
    await listingStore.updateRemarks(listingId, remarksForm.value)
    isRemarksModalOpen.value = false
  } catch (err: any) {
    fastEditError.value = err.response?.data?.message || 'Failed to update remarks.'
  } finally {
    isSubmittingFastEdit.value = false
  }
}

async function handleSaveCompensation() {
  isSubmittingFastEdit.value = true
  fastEditError.value = null
  try {
    await listingStore.updateCompensation(listingId, compForm.value)
    isCompensationModalOpen.value = false
  } catch (err: any) {
    fastEditError.value = err.response?.data?.message || 'Failed to update compensation terms.'
  } finally {
    isSubmittingFastEdit.value = false
  }
}

function copyPublicUrl() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(publicListingUrl.value)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  }
}

function formatPhotoUrl(url: string | null | undefined): string {
  if (!url) return ''
  if (url.startsWith('/storage')) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
    const backendHost = apiBase.replace(/\/api\/?$/, '')
    return `${backendHost}${url}`
  }
  return url
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-7xl flex-col gap-6">
    <!-- Breadcrumb & Back Link -->
    <div class="flex items-center justify-between">
      <RouterLink
        to="/agent/listings"
        class="inline-flex items-center gap-1.5 text-xs font-semibold text-fg-muted hover:text-primary transition"
      >
        <ArrowLeft class="h-3.5 w-3.5" />
        Back to Properties Portfolio
      </RouterLink>

      <div class="flex items-center gap-2">
        <RouterLink
          v-if="canMakeOffer"
          :to="`/properties/${listingId}/send-offer`"
          class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition shadow-sm"
        >
          <Handshake class="h-4 w-4" />
          Make an Offer
        </RouterLink>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface text-xs font-semibold text-fg hover:bg-surface-raised transition shadow-xs"
          @click="isStatusModalOpen = true"
        >
          <History class="h-3.5 w-3.5 text-primary" />
          Status History & Audit Log
        </button>

        <a
          v-if="isPublished"
          :href="publicListingUrl"
          target="_blank"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-primary/10 text-xs font-bold text-primary hover:bg-primary/20 transition shadow-xs"
        >
          <ExternalLink class="h-3.5 w-3.5" />
          Live Marketplace Listing
        </a>
      </div>
    </div>

    <!-- Loading State -->
    <LoadingState
      v-if="listingStore.status === 'loading' && !listingStore.activeListing"
      :rows="3"
    />

    <!-- Error State -->
    <ErrorState
      v-else-if="listingStore.status === 'error' && !listingStore.activeListing"
      :description="listingStore.error || undefined"
    >
      <template #action>
        <BaseButton size="sm" @click="listingStore.fetchListing(listingId)">Try Again</BaseButton>
      </template>
    </ErrorState>

    <template v-else-if="listingStore.activeListing">
      <!-- HERO COMMAND HEADER -->
      <div class="relative overflow-hidden rounded-3xl border border-border/80 bg-surface shadow-xs p-6 sm:p-8">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <!-- Left: Thumbnail & Address Details -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5 min-w-0">
            <!-- Thumbnail Image -->
            <div class="relative h-28 w-28 sm:h-32 sm:w-36 rounded-2xl bg-surface-raised overflow-hidden border border-border shrink-0 flex items-center justify-center shadow-xs">
              <img
                v-if="listingStore.activeListing.primaryPhotoUrl"
                :src="formatPhotoUrl(listingStore.activeListing.primaryPhotoUrl)"
                :alt="listingStore.activeListing.address.address || 'Property'"
                class="w-full h-full object-cover"
              />
              <div v-else class="flex flex-col items-center justify-center text-fg-muted/40 p-2 text-center">
                <Home class="h-8 w-8 text-primary/30" />
                <span class="text-[10px] text-fg-muted mt-1 font-medium">No Photo</span>
              </div>

              <div
                v-if="listingStore.activeListing.offersCount && listingStore.activeListing.offersCount > 0"
                class="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow"
              >
                <Handshake class="h-3 w-3" />
                {{ listingStore.activeListing.offersCount }} Offer{{ listingStore.activeListing.offersCount > 1 ? 's' : '' }}
              </div>
            </div>

            <!-- Address and Attributes -->
            <div class="space-y-2 min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-mono text-xs font-bold text-white bg-slate-900 px-2.5 py-1 rounded-lg">
                  {{ listingStore.activeListing.referenceCode || `REO-${listingStore.activeListing.id}` }}
                </span>
                <span class="bg-surface px-2.5 py-1 rounded-lg border border-border/60">
                  <StatusBadge :status="listingStore.activeListing.status" />
                </span>
                <span v-if="listingStore.activeListing.packageName" class="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                  {{ listingStore.activeListing.packageName }}
                </span>
              </div>

              <div>
                <h1 class="text-2xl sm:text-3xl font-extrabold text-fg tracking-tight">
                  {{ listingStore.activeListing.address.address || 'Address Pending Completion' }}
                </h1>
                <p class="text-sm text-fg-muted flex items-center gap-1.5 mt-1 font-medium">
                  <MapPin class="h-4 w-4 text-primary shrink-0" />
                  <span>
                    {{ listingStore.activeListing.address.city ? `${listingStore.activeListing.address.city}, ${listingStore.activeListing.address.state} ${listingStore.activeListing.address.zip}` : listingStore.activeListing.address.zip }}
                  </span>
                </p>
              </div>

              <!-- Quick Specs Row -->
              <div class="flex flex-wrap items-center gap-4 text-xs text-fg-muted pt-1 font-medium">
                <div v-if="listingStore.activeListing.bedrooms" class="flex items-center gap-1.5">
                  <Bed class="h-4 w-4 text-primary" />
                  <span class="font-bold text-fg">{{ listingStore.activeListing.bedrooms }}</span> Beds
                </div>
                <div v-if="listingStore.activeListing.bathrooms" class="flex items-center gap-1.5">
                  <Bath class="h-4 w-4 text-primary" />
                  <span class="font-bold text-fg">{{ listingStore.activeListing.bathrooms }}</span> Baths
                </div>
                <div v-if="listingStore.activeListing.squareFeet" class="flex items-center gap-1.5">
                  <Maximize2 class="h-4 w-4 text-primary" />
                  <span class="font-bold text-fg">{{ Number(listingStore.activeListing.squareFeet).toLocaleString() }}</span> sqft
                </div>
                <div class="flex items-center gap-1.5">
                  <ShieldCheck class="h-4 w-4 text-primary" />
                  <span>{{ listingStore.activeListing.progressPercent }}% Compliance</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Price & Quick Action Buttons -->
          <div class="flex flex-col sm:items-end justify-between gap-4 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-border">
            <div class="text-left sm:text-right">
              <span class="text-xs text-fg-muted font-medium block">Current Asking Price</span>
              <span class="text-3xl font-black text-fg tracking-tight block">{{ formattedPrice }}</span>
              <div v-if="listingStore.activeListing.compensation" class="text-xs text-emerald-600 font-semibold mt-0.5">
                BAC: {{ listingStore.activeListing.compensationType === 2 ? `$${listingStore.activeListing.compensation}` : `${listingStore.activeListing.compensation}%` }}
              </div>
            </div>

            <!-- Buyer Offer Action Bar -->
            <div v-if="canMakeOffer" class="flex flex-wrap items-center gap-2">
              <RouterLink :to="`/properties/${listingId}/send-offer`">
                <BaseButton class="!bg-emerald-600 hover:!bg-emerald-700 !text-white font-bold !rounded-xl shadow-md flex items-center gap-2">
                  <Handshake class="h-4 w-4" />
                  Make an Offer
                </BaseButton>
              </RouterLink>
              <RouterLink :to="`/properties/${listingId}`">
                <BaseButton variant="secondary" class="!rounded-xl text-xs font-semibold">
                  View Full Details
                </BaseButton>
              </RouterLink>
            </div>

            <!-- Fast Edit Trigger Bar for Owner / Agent -->
            <div v-else class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-surface text-xs font-bold text-fg hover:border-primary/50 hover:bg-surface-raised transition shadow-xs"
                @click="openPriceModal"
              >
                <DollarSign class="h-3.5 w-3.5 text-primary" />
                Change Price
              </button>

              <button
                type="button"
                class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-surface text-xs font-bold text-fg hover:border-primary/50 hover:bg-surface-raised transition shadow-xs"
                @click="openRemarksModal"
              >
                <Pencil class="h-3.5 w-3.5 text-primary" />
                Edit Remarks
              </button>

              <button
                type="button"
                class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-surface text-xs font-bold text-fg hover:border-primary/50 hover:bg-surface-raised transition shadow-xs"
                @click="openCompensationModal"
              >
                <Percent class="h-3.5 w-3.5 text-primary" />
                Commission
              </button>
            </div>
          </div>
        </div>

        <!-- BUYER CALLOUT BANNER (When viewing a property to make an offer) -->
        <div
          v-if="canMakeOffer"
          class="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/30"
        >
          <div class="flex items-center gap-3.5">
            <div class="h-11 w-11 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Handshake class="h-6 w-6" />
            </div>
            <div>
              <h4 class="font-extrabold text-sm sm:text-base text-fg">Interested in Purchasing this Property?</h4>
              <p class="text-xs text-fg-muted mt-0.5">Prepare and submit an official purchase contract offer with earnest money deposit & contingencies directly to the seller.</p>
            </div>
          </div>
          <RouterLink :to="`/properties/${listingId}/send-offer`" class="shrink-0 w-full sm:w-auto">
            <BaseButton class="w-full !bg-emerald-600 hover:!bg-emerald-700 !text-white font-bold !rounded-xl shadow-md flex items-center justify-center gap-2">
              <Handshake class="h-4 w-4" />
              Submit Offer Now
            </BaseButton>
          </RouterLink>
        </div>

        <!-- COMMAND CENTER TABS -->
        <div class="mt-8 pt-4 border-t border-border/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            class="px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition"
            :class="
              activeTab === 'command'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface text-fg-muted hover:text-fg hover:bg-surface-raised'
            "
            @click="activeTab = 'command'"
          >
            <Sparkles class="h-4 w-4" />
            Command Center & Fast Edits
          </button>

          <button
            type="button"
            class="px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition"
            :class="
              activeTab === 'workflow'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface text-fg-muted hover:text-fg hover:bg-surface-raised'
            "
            @click="activeTab = 'workflow'"
          >
            <Layers class="h-4 w-4" />
            Workflow Steps & Disclosures ({{ steps.length }})
          </button>

          <button
            type="button"
            class="px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition"
            :class="
              activeTab === 'offers'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface text-fg-muted hover:text-fg hover:bg-surface-raised'
            "
            @click="activeTab = 'offers'"
          >
            <Handshake class="h-4 w-4" />
            Offers & Negotiations
            <span
              v-if="listingStore.activeListing.offersCount"
              class="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-white"
            >
              {{ listingStore.activeListing.offersCount }}
            </span>
          </button>

          <button
            type="button"
            class="px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition"
            :class="
              activeTab === 'media'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface text-fg-muted hover:text-fg hover:bg-surface-raised'
            "
            @click="activeTab = 'media'"
          >
            <ImageIcon class="h-4 w-4" />
            Photos & Gallery
          </button>

          <button
            type="button"
            class="px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition"
            :class="
              activeTab === 'documents'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface text-fg-muted hover:text-fg hover:bg-surface-raised'
            "
            @click="activeTab = 'documents'"
          >
            <FileText class="h-4 w-4" />
            Disclosures & Documents
          </button>
        </div>
      </div>

      <!-- TAB 1: COMMAND CENTER & FAST EDITS -->
      <div v-if="activeTab === 'command'" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Card 1: Pricing & Terms -->
          <div class="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col justify-between">
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg uppercase tracking-wide">
                  Pricing & Terms
                </span>
                <button
                  type="button"
                  class="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  @click="openPriceModal"
                >
                  <Pencil class="h-3 w-3" /> Edit
                </button>
              </div>

              <div>
                <span class="text-xs text-fg-muted">Current Listing Price</span>
                <p class="text-2xl font-black text-fg mt-0.5">{{ formattedPrice }}</p>
              </div>

              <div class="grid grid-cols-2 gap-3 pt-3 border-t border-border/60 text-xs">
                <div>
                  <span class="text-fg-muted block">Direct Rebate</span>
                  <span class="font-bold text-fg">
                    {{ listingStore.activeListing.directBuyerRebate ? `$${listingStore.activeListing.directBuyerRebate.toLocaleString()}` : 'None' }}
                  </span>
                </div>
                <div>
                  <span class="text-fg-muted block">Concessions</span>
                  <span class="font-bold text-fg">
                    {{ listingStore.activeListing.sellerConcessions ? `$${listingStore.activeListing.sellerConcessions.toLocaleString()}` : '$0' }}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              class="mt-5 w-full py-2 rounded-xl bg-surface-raised border border-border text-xs font-bold text-fg hover:border-primary/40 transition"
              @click="openPriceModal"
            >
              Adjust Price
            </button>
          </div>

          <!-- Card 2: Agent Compensation -->
          <div class="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col justify-between">
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg uppercase tracking-wide">
                  Agent Compensation
                </span>
                <button
                  type="button"
                  class="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
                  @click="openCompensationModal"
                >
                  <Pencil class="h-3 w-3" /> Edit
                </button>
              </div>

              <div>
                <span class="text-xs text-fg-muted">Buyer Agent Commission</span>
                <p class="text-2xl font-black text-fg mt-0.5">
                  {{
                    listingStore.activeListing.compensation
                      ? (listingStore.activeListing.compensationType === 2
                          ? `$${listingStore.activeListing.compensation.toLocaleString()}`
                          : `${listingStore.activeListing.compensation}%`)
                      : 'Not Set'
                  }}
                </p>
              </div>

              <p class="text-xs text-fg-muted pt-2 border-t border-border/60">
                Syndicated to buyer's agents on the MLS and public marketplaces as offered cooperating broker fee.
              </p>
            </div>

            <button
              type="button"
              class="mt-5 w-full py-2 rounded-xl bg-surface-raised border border-border text-xs font-bold text-fg hover:border-emerald-500/40 transition"
              @click="openCompensationModal"
            >
              Update Commission Terms
            </button>
          </div>

          <!-- Card 3: Syndication & Social Share -->
          <div class="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col justify-between">
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg uppercase tracking-wide">
                  Syndication & Link
                </span>
                <span class="text-xs text-fg-muted font-mono">REO-{{ listingStore.activeListing.id }}</span>
              </div>

              <div>
                <span class="text-xs text-fg-muted">Marketplace Listing Link</span>
                <div class="mt-1 flex items-center gap-2">
                  <input
                    type="text"
                    readonly
                    :value="publicListingUrl"
                    class="w-full text-xs font-mono bg-surface-raised border border-border rounded-lg px-2.5 py-1.5 truncate text-fg-muted"
                  />
                  <button
                    type="button"
                    class="p-2 rounded-lg bg-surface-raised border border-border hover:text-primary transition shrink-0"
                    title="Copy Link"
                    @click="copyPublicUrl"
                  >
                    <Copy class="h-3.5 w-3.5" />
                  </button>
                </div>
                <span v-if="isCopied" class="text-[11px] text-emerald-600 font-bold block mt-1">Copied to clipboard!</span>
              </div>

              <!-- Social Share Shortcuts -->
              <div class="pt-2 border-t border-border/60 flex items-center gap-2 text-xs">
                <span class="text-fg-muted">Share:</span>
                <a
                  :href="`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicListingUrl)}`"
                  target="_blank"
                  class="px-2 py-1 rounded-md bg-surface-raised text-fg hover:text-primary font-semibold text-xs border border-border/60"
                >
                  Facebook
                </a>
                <a
                  :href="`https://twitter.com/intent/tweet?url=${encodeURIComponent(publicListingUrl)}&text=${encodeURIComponent(listingStore.activeListing.address.address || 'Property')}`"
                  target="_blank"
                  class="px-2 py-1 rounded-md bg-surface-raised text-fg hover:text-primary font-semibold text-xs border border-border/60"
                >
                  X (Twitter)
                </a>
                <a
                  :href="`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicListingUrl)}`"
                  target="_blank"
                  class="px-2 py-1 rounded-md bg-surface-raised text-fg hover:text-primary font-semibold text-xs border border-border/60"
                >
                  LinkedIn
                </a>
              </div>
            </div>

            <a
              v-if="isPublished"
              :href="publicListingUrl"
              target="_blank"
              class="mt-5 w-full py-2 rounded-xl bg-primary text-white text-xs font-bold text-center hover:bg-primary/90 transition shadow-xs flex items-center justify-center gap-1.5"
            >
              Open Live Site
              <ExternalLink class="h-3.5 w-3.5" />
            </a>
            <div v-else class="mt-5 text-center text-xs text-fg-muted font-medium py-2">
              Available on marketplace once published
            </div>
          </div>
        </div>

        <!-- Remarks & Description Banner -->
        <div class="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-bold text-fg">Public Remarks & Marketing Narrative</h3>
              <p class="text-xs text-fg-muted">This description is syndicated directly to prospective buyers and MLS agents.</p>
            </div>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface-raised text-xs font-bold text-primary hover:bg-surface-raised/80 transition"
              @click="openRemarksModal"
            >
              <Pencil class="h-3.5 w-3.5" />
              Edit Description
            </button>
          </div>

          <div class="p-4 rounded-xl bg-surface-raised/60 border border-border/50 text-sm leading-relaxed text-fg">
            <h4 v-if="listingStore.activeListing.listingTitle" class="font-bold text-base text-fg mb-2">
              {{ listingStore.activeListing.listingTitle }}
            </h4>
            <p v-if="listingStore.activeListing.remarks" class="whitespace-pre-line text-fg/90">
              {{ listingStore.activeListing.remarks }}
            </p>
            <p v-else class="text-xs text-fg-muted italic">
              No public description provided yet. Click "Edit Description" to add property highlights.
            </p>
          </div>

          <div v-if="listingStore.activeListing.directions" class="text-xs text-fg-muted flex items-start gap-2 pt-1">
            <span class="font-bold text-fg shrink-0">Directions:</span>
            <span>{{ listingStore.activeListing.directions }}</span>
          </div>
        </div>

        <!-- Recent Status History Snippet -->
        <div class="flex items-center justify-between p-4 rounded-2xl border border-border bg-surface shadow-xs">
          <div class="flex items-center gap-3">
            <span class="text-xs font-bold uppercase tracking-wider text-fg-muted">Listing Status:</span>
            <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary">
              {{ listingStore.activeListing.status }}
            </span>
            <span class="text-xs text-fg-muted hidden sm:inline">
              Updated {{ listingStore.activeListing.updatedAt }}
            </span>
          </div>
          <button
            type="button"
            class="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            @click="isStatusModalOpen = true"
          >
            <History class="h-3.5 w-3.5" />
            Audit Trail
          </button>
        </div>
      </div>

      <!-- TAB 2: WORKFLOW & COMPLIANCE STEPS -->
      <div v-else-if="activeTab === 'workflow'" class="space-y-6">
        <div class="p-6 rounded-2xl border border-border bg-surface shadow-xs">
          <div class="flex items-center justify-between pb-4 border-b border-border/60">
            <div>
              <h3 class="text-base font-bold text-fg">Statutory Compliance Stepper</h3>
              <p class="text-xs text-fg-muted">Complete each required real estate disclosures and compliance form.</p>
            </div>
            <span class="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
              {{ listingStore.activeListing.stepsCompleted }} of {{ steps.length }} Steps Complete
            </span>
          </div>

          <div class="pt-6">
            <Stepper :steps="steps" @select="(id) => router.push(routeFor(id))" />
          </div>
        </div>
      </div>

      <!-- TAB 3: OFFERS & NEGOTIATIONS -->
      <div v-else-if="activeTab === 'offers'" class="rounded-2xl border border-border bg-surface p-6 shadow-xs">
        <ListingOffersTab
          :listing-id="listingId"
          :listing-status="listingStore.activeListing.status"
          @listing-updated="listingStore.fetchListing(listingId)"
        />
      </div>

      <!-- TAB 4: PHOTOS & MEDIA -->
      <div v-else-if="activeTab === 'media'" class="rounded-2xl border border-border bg-surface p-6 shadow-xs">
        <ListingImageManager :listing-id="listingId" />
      </div>

      <!-- TAB 5: DISCLOSURES & DOCUMENTS -->
      <div v-else-if="activeTab === 'documents'" class="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-6">
        <div class="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <h3 class="text-base font-bold text-fg">Legal Documents & Statutory Disclosures</h3>
            <p class="text-xs text-fg-muted">Access formal signed agreements, Seller's Disclosure Statements, and Lead-Based Paint notices.</p>
          </div>
          <RouterLink
            :to="`/agent/listings/${listingId}/documents`"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-xs"
          >
            <FileCheck class="h-4 w-4" />
            Manage Document Center
          </RouterLink>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="p-5 rounded-xl border border-border bg-surface-raised/40 flex items-start gap-4">
            <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileText class="h-5 w-5" />
            </div>
            <div>
              <h4 class="text-sm font-bold text-fg">Statutory Seller's Disclosure</h4>
              <p class="text-xs text-fg-muted mt-1">Review answers provided for water, roofing, structural, electrical, and environmental questions.</p>
              <RouterLink
                :to="`/agent/listings/${listingId}/disclosures`"
                class="inline-flex items-center gap-1 text-xs font-bold text-primary mt-2 hover:underline"
              >
                Open Disclosures Form <ArrowRight class="h-3 w-3" />
              </RouterLink>
            </div>
          </div>

          <div class="p-5 rounded-xl border border-border bg-surface-raised/40 flex items-start gap-4">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck class="h-5 w-5" />
            </div>
            <div>
              <h4 class="text-sm font-bold text-fg">Digital E-Sign Agreements</h4>
              <p class="text-xs text-fg-muted mt-1">Review legal purchase contracts, agency agreements, and audit certificate trails.</p>
              <RouterLink
                :to="`/agent/listings/${listingId}/documents`"
                class="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-2 hover:underline"
              >
                View Signed Contracts <ArrowRight class="h-3 w-3" />
              </RouterLink>
            </div>
          </div>
        </div>
      </div>

      <!-- FAST EDIT MODAL 1: PRICE CHANGE -->
      <div
        v-if="isPriceModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      >
        <div class="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-5">
          <div class="flex items-center justify-between pb-3 border-b border-border">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <DollarSign class="h-4 w-4" />
              </div>
              <h3 class="text-base font-bold text-fg">Adjust Listing Price</h3>
            </div>
            <button
              type="button"
              class="p-1 rounded-lg text-fg-muted hover:text-fg"
              @click="isPriceModalOpen = false"
            >
              <X class="h-4 w-4" />
            </button>
          </div>

          <div v-if="fastEditError" class="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium">
            {{ fastEditError }}
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-fg mb-1">New Listing Price ($)</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-fg-muted font-bold">$</span>
                <input
                  v-model.number="priceForm.price"
                  type="number"
                  min="1"
                  step="1000"
                  class="focus-ring w-full rounded-xl border border-border bg-surface py-2.5 pl-8 pr-4 text-sm font-bold text-fg"
                  placeholder="375000"
                />
              </div>
            </div>

            <div v-if="listingStore.activeListing.price && priceForm.price > 0" class="p-3 rounded-xl bg-surface-raised border border-border text-xs">
              <div class="flex items-center justify-between text-fg-muted">
                <span>Current Price:</span>
                <span class="font-bold text-fg">${{ Number(listingStore.activeListing.price).toLocaleString() }}</span>
              </div>
              <div class="flex items-center justify-between mt-1">
                <span>Price Difference:</span>
                <span
                  class="font-black"
                  :class="priceForm.price < Number(listingStore.activeListing.price) ? 'text-rose-600' : 'text-emerald-600'"
                >
                  {{ priceForm.price < Number(listingStore.activeListing.price) ? '-' : '+' }}${{ Math.abs(priceForm.price - Number(listingStore.activeListing.price)).toLocaleString() }}
                </span>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-fg mb-1">Reason for Price Change (Optional)</label>
              <input
                v-model="priceForm.reason"
                type="text"
                maxlength="250"
                class="focus-ring w-full rounded-xl border border-border bg-surface py-2 px-3 text-xs text-fg"
                placeholder="e.g. Market price reduction, Seller motivated"
              />
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              class="px-4 py-2 rounded-xl text-xs font-bold text-fg-muted hover:text-fg"
              @click="isPriceModalOpen = false"
            >
              Cancel
            </button>
            <BaseButton
              size="sm"
              class="!rounded-xl shadow-xs"
              :disabled="isSubmittingFastEdit"
              @click="handleSavePrice"
            >
              {{ isSubmittingFastEdit ? 'Saving...' : 'Update Price' }}
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- FAST EDIT MODAL 2: REMARKS & TITLE -->
      <div
        v-if="isRemarksModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      >
        <div class="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-5">
          <div class="flex items-center justify-between pb-3 border-b border-border">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Pencil class="h-4 w-4" />
              </div>
              <h3 class="text-base font-bold text-fg">Edit Remarks & Title</h3>
            </div>
            <button
              type="button"
              class="p-1 rounded-lg text-fg-muted hover:text-fg"
              @click="isRemarksModalOpen = false"
            >
              <X class="h-4 w-4" />
            </button>
          </div>

          <div v-if="fastEditError" class="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium">
            {{ fastEditError }}
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-fg mb-1">Listing Headline / Title</label>
              <input
                v-model="remarksForm.listing_title"
                type="text"
                maxlength="250"
                class="focus-ring w-full rounded-xl border border-border bg-surface py-2 px-3 text-xs text-fg font-semibold"
                placeholder="e.g., Stunning Historic 4-Bedroom Colonial"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-fg mb-1">Public Remarks (Syndicated)</label>
              <textarea
                v-model="remarksForm.remarks"
                rows="6"
                maxlength="4000"
                class="focus-ring w-full rounded-xl border border-border bg-surface p-3 text-xs text-fg leading-relaxed"
                placeholder="Describe the architectural highlights, upgrades, neighborhood features, and key property details..."
              ></textarea>
              <span class="text-[10px] text-fg-muted block text-right mt-1">
                {{ remarksForm.remarks.length }} / 4000 characters
              </span>
            </div>

            <div>
              <label class="block text-xs font-bold text-fg mb-1">Driving Directions</label>
              <input
                v-model="remarksForm.directions"
                type="text"
                maxlength="500"
                class="focus-ring w-full rounded-xl border border-border bg-surface py-2 px-3 text-xs text-fg"
                placeholder="e.g. North on Main St, left on Woodward Ave"
              />
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              class="px-4 py-2 rounded-xl text-xs font-bold text-fg-muted hover:text-fg"
              @click="isRemarksModalOpen = false"
            >
              Cancel
            </button>
            <BaseButton
              size="sm"
              class="!rounded-xl shadow-xs"
              :disabled="isSubmittingFastEdit"
              @click="handleSaveRemarks"
            >
              {{ isSubmittingFastEdit ? 'Saving...' : 'Save Remarks' }}
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- FAST EDIT MODAL 3: COMPENSATION & CONCESSIONS -->
      <div
        v-if="isCompensationModalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      >
        <div class="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-5">
          <div class="flex items-center justify-between pb-3 border-b border-border">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <Percent class="h-4 w-4" />
              </div>
              <h3 class="text-base font-bold text-fg">Agent Commission & Rebate</h3>
            </div>
            <button
              type="button"
              class="p-1 rounded-lg text-fg-muted hover:text-fg"
              @click="isCompensationModalOpen = false"
            >
              <X class="h-4 w-4" />
            </button>
          </div>

          <div v-if="fastEditError" class="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium">
            {{ fastEditError }}
          </div>

          <div class="space-y-4">
            <!-- Commission Type Toggle -->
            <div>
              <label class="block text-xs font-bold text-fg mb-1">Commission Type</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  class="py-2 rounded-xl border text-xs font-bold transition"
                  :class="
                    compForm.compensation_type === 1
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-surface border-border text-fg-muted hover:text-fg'
                  "
                  @click="compForm.compensation_type = 1"
                >
                  Percentage (%)
                </button>
                <button
                  type="button"
                  class="py-2 rounded-xl border text-xs font-bold transition"
                  :class="
                    compForm.compensation_type === 2
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-surface border-border text-fg-muted hover:text-fg'
                  "
                  @click="compForm.compensation_type = 2"
                >
                  Flat Fee ($)
                </button>
              </div>
            </div>

            <!-- Commission Amount Input -->
            <div>
              <label class="block text-xs font-bold text-fg mb-1">
                Buyer Agent Commission ({{ compForm.compensation_type === 1 ? '%' : '$' }})
              </label>
              <input
                v-model.number="compForm.compensation"
                type="number"
                min="0"
                step="0.1"
                class="focus-ring w-full rounded-xl border border-border bg-surface py-2.5 px-3 text-sm font-bold text-fg"
                :placeholder="compForm.compensation_type === 1 ? '2.5' : '3000'"
              />
            </div>

            <!-- Direct Buyer Rebate -->
            <div>
              <label class="block text-xs font-bold text-fg mb-1">Direct Buyer Rebate ($)</label>
              <input
                v-model.number="compForm.direct_buyer_rebate"
                type="number"
                min="0"
                step="100"
                class="focus-ring w-full rounded-xl border border-border bg-surface py-2 px-3 text-xs text-fg"
                placeholder="0"
              />
              <span class="text-[10px] text-fg-muted mt-0.5 block">Cash rebate offered directly to unrepresented buyers.</span>
            </div>

            <!-- Seller Concessions -->
            <div>
              <label class="block text-xs font-bold text-fg mb-1">Max Seller Concessions ($)</label>
              <input
                v-model.number="compForm.seller_concessions"
                type="number"
                min="0"
                step="100"
                class="focus-ring w-full rounded-xl border border-border bg-surface py-2 px-3 text-xs text-fg"
                placeholder="0"
              />
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              class="px-4 py-2 rounded-xl text-xs font-bold text-fg-muted hover:text-fg"
              @click="isCompensationModalOpen = false"
            >
              Cancel
            </button>
            <BaseButton
              size="sm"
              class="!rounded-xl shadow-xs"
              :disabled="isSubmittingFastEdit"
              @click="handleSaveCompensation"
            >
              {{ isSubmittingFastEdit ? 'Saving...' : 'Save Terms' }}
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Status History Modal -->
      <ListingStatusHistoryModal
        :is-open="isStatusModalOpen"
        :listing-id="listingId"
        @close="isStatusModalOpen = false"
      />
    </template>
  </div>
</template>
