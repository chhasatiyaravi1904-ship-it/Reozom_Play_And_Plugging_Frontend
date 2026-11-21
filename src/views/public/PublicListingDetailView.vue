<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 min-h-screen">
    
    <!-- Back Navigation -->
    <div class="mb-6">
      <RouterLink to="/properties" class="inline-flex items-center text-sm font-medium text-neutral-600 hover:text-primary transition">
        <IconArrowLeft class="w-4 h-4 mr-1" />
        Back to Properties
      </RouterLink>
    </div>

    <!-- Loading State -->
    <div v-if="store.status === 'loading'" class="flex flex-col gap-8" role="status" aria-label="Loading property">
      <div class="flex flex-col gap-2" aria-hidden="true">
        <div class="skeleton aspect-video md:aspect-[21/9] rounded-2xl w-full"></div>
        <div class="flex gap-2">
          <div v-for="i in 4" :key="i" class="skeleton w-24 h-16 md:w-32 md:h-20 rounded-lg"></div>
        </div>
      </div>
      <div class="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-neutral-200 pb-8" aria-hidden="true">
        <div class="space-y-3 flex-1">
          <div class="skeleton h-9 rounded w-2/3"></div>
          <div class="skeleton h-5 rounded w-1/3"></div>
          <div class="skeleton h-3 rounded w-24"></div>
        </div>
        <div class="space-y-3 md:w-56">
          <div class="skeleton h-9 rounded w-40 md:ml-auto"></div>
          <div class="skeleton h-10 rounded-xl w-full"></div>
        </div>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-white rounded-xl border border-neutral-200" aria-hidden="true">
        <div v-for="i in 4" :key="i" class="flex flex-col items-center gap-2">
          <div class="skeleton h-3 w-16 rounded"></div>
          <div class="skeleton h-5 w-20 rounded"></div>
        </div>
      </div>
      <span class="sr-only">Loading property…</span>
    </div>

    <!-- Error State -->
    <div v-else-if="store.status === 'error' || (!store.activeListing && store.status === 'idle')" class="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-neutral-200 text-center shadow-sm mt-8">
      <IconAlertCircle class="w-12 h-12 text-danger mb-4" />
      <h2 class="text-xl font-bold text-neutral-900 mb-2">Listing Not Found</h2>
      <p class="text-neutral-500 mb-6">{{ store.error || 'The property you are looking for is unavailable.' }}</p>
      <RouterLink to="/properties" class="px-6 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition shadow-sm">
        Browse Properties
      </RouterLink>
    </div>

    <!-- Detail View -->
    <div v-else-if="listing" class="flex flex-col gap-8">
      
      <!-- Image Hero / Gallery -->
      <div class="flex flex-col gap-2">
        <div class="w-full bg-neutral-100 rounded-2xl border border-neutral-200 aspect-video md:aspect-[21/9] flex items-center justify-center shadow-inner overflow-hidden relative">
          <img v-if="activeImage" :src="formatPhotoUrl(activeImage.url)" :alt="activeImage.alt" class="w-full h-full object-cover" />
          <IconImage v-else class="w-16 h-16 text-neutral-300" />
        </div>
        
        <!-- Thumbnail strip -->
        <div v-if="listing.images && listing.images.length > 1" class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            v-for="img in listing.images" 
            :key="img.id"
            @click="activeImage = img"
            class="shrink-0 w-24 h-16 md:w-32 md:h-20 rounded-lg overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
            :class="activeImage?.id === img.id ? 'border-primary opacity-100' : 'border-transparent opacity-60 hover:opacity-100'"
            :aria-label="'View ' + img.alt"
          >
            <img :src="formatPhotoUrl(img.thumbnail_url || img.url)" :alt="img.alt" class="w-full h-full object-cover" loading="lazy" />
          </button>
        </div>
      </div>

      <!-- Title Header -->
      <div class="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-neutral-200 pb-8">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold text-neutral-900 leading-tight">
            {{ titleField ? formatField(titleField) : 'Untitled Property' }}
          </h1>
          <div class="text-lg text-neutral-500 mt-2 flex items-center gap-2">
            <IconMapPin class="w-5 h-5 text-neutral-400" />
            {{ listing.address.city }}, {{ listing.address.state }} {{ listing.address.zip }}
          </div>
          <div class="mt-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            REF: {{ listing.reference_code }}
          </div>
        </div>
        <div class="md:text-right shrink-0" v-if="priceField">
          <div class="text-3xl md:text-4xl font-bold text-primary">
            {{ formatField(priceField) }}
          </div>
          <!-- Owners can't make an offer on their own listing -->
          <div v-if="listing.is_owner" class="mt-3 md:ml-auto max-w-xs rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-800">
            <div class="font-semibold">This is your listing</div>
            <div class="mt-0.5 text-xs">You can't make an offer on a property you listed.</div>
            <router-link :to="manageListingLink" class="mt-2 inline-block text-xs font-bold text-amber-900 underline">
              Manage listing
            </router-link>
          </div>
          <router-link
            v-else
            :to="`/properties/${listingId}/send-offer`"
            class="mt-3 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition transform hover:-translate-y-0.5"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Submit an Official Offer
          </router-link>
        </div>
      </div>

      <!-- Quick Info Bar (Top 4 fields excluding title/price) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-white rounded-xl border border-neutral-200 shadow-sm" v-if="highlightFields.length">
        <div v-for="field in highlightFields" :key="field.id" class="flex flex-col items-center text-center">
          <span class="text-xs text-neutral-500 font-semibold uppercase tracking-wide">{{ field.label }}</span>
          <span class="text-lg font-bold text-neutral-900 mt-1">{{ formatField(field) }}</span>
        </div>
      </div>

      <!-- Additional Details -->
      <div v-if="remainingFields.length > 0" class="mt-4">
        <h2 class="text-xl font-bold text-neutral-900 mb-6">Property Details</h2>
        <div class="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
          <dl class="divide-y divide-neutral-100">
            <div v-for="field in remainingFields" :key="field.id" class="px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 hover:bg-neutral-50 transition">
              <dt class="text-sm font-medium text-neutral-500 sm:col-span-1">{{ field.label }}</dt>
              <dd class="text-sm text-neutral-900 font-medium sm:col-span-2">{{ formatField(field) }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Submit Offer Modal -->
      <SubmitOfferModal
        :is-open="isOfferModalOpen"
        :listing-id="listingId"
        :listing-address="listing?.address?.city ? `${listing.address.city}, ${listing.address.state}` : 'Property'"
        @close="isOfferModalOpen = false"
        @submitted="handleOfferSubmitted"
      />

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { usePublicListingStore } from '@/stores/publicListing'
import { useAuthStore } from '@/stores/auth'
import { ArrowLeft as IconArrowLeft, Image as IconImage, MapPin as IconMapPin, AlertCircle as IconAlertCircle } from 'lucide-vue-next'
import { formatPublicField } from '@/utils/fieldFormatters'
import type { PublicFieldConfig } from '@/services/publicListingService'
import SubmitOfferModal from '@/components/offers/SubmitOfferModal.vue'

const route = useRoute()
const store = usePublicListingStore()
const authStore = useAuthStore()

// The owner manages the listing in their own portal
const manageListingLink = computed(() =>
  `${authStore.user?.role === 'agent' ? '/agent' : ''}/listings/${listingId.value}`)

const listing = computed(() => store.activeListing)
const listingId = computed(() => Number(route.params.id))
const activeImage = ref<any>(null)
const isOfferModalOpen = ref(false)

function formatPhotoUrl(url: string | null | undefined): string {
  if (!url) return ''
  if (url.startsWith('/storage')) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
    const backendHost = apiBase.replace(/\/api\/?$/, '')
    return `${backendHost}${url}`
  }
  if (window.location.hostname === '127.0.0.1' && url.includes('//localhost:8000')) {
    return url.replace('//localhost:8000', '//127.0.0.1:8000')
  }
  if (window.location.hostname === 'localhost' && url.includes('//127.0.0.1:8000')) {
    return url.replace('//127.0.0.1:8000', '//localhost:8000')
  }
  return url
}

const handleOfferSubmitted = () => {
  alert('Your offer has been submitted to the seller!')
}

watch(() => listing.value, (newVal) => {
  if (newVal?.images?.length) {
    activeImage.value = newVal.images[0]
  } else {
    activeImage.value = null
  }
}, { immediate: true })

onMounted(() => {
  if (listingId.value) {
    store.fetchListing(listingId.value)
  }
})

// Extract core fields based on identifiers
const titleField = computed(() => listing.value?.public_info.find(f => f.id === 'listing_title'))
const priceField = computed(() => listing.value?.public_info.find(f => f.id === 'listing_price'))

// Extract all visible dynamic fields
const displayFields = computed(() => {
  if (!listing.value) return []
  return listing.value.public_info.filter(f => 
    f.public_display !== false && 
    f.id !== 'listing_title' && 
    f.id !== 'listing_price'
  )
})

// Feature top 4 fields prominently
const highlightFields = computed(() => displayFields.value.slice(0, 4))

// Rest go in details list
const remainingFields = computed(() => displayFields.value.slice(4))

const formatField = (field: PublicFieldConfig) => {
  if (!listing.value) return ''
  return formatPublicField(field, listing.value.values[field.id])
}
</script>
