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
    <div v-if="store.status === 'loading'" class="animate-pulse flex flex-col gap-8">
      <div class="h-64 md:h-96 bg-neutral-200 rounded-2xl w-full"></div>
      <div class="space-y-4">
        <div class="h-8 bg-neutral-200 rounded w-1/2"></div>
        <div class="h-6 bg-neutral-200 rounded w-1/3"></div>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div v-for="i in 4" :key="i" class="h-16 bg-neutral-100 rounded border border-neutral-200"></div>
      </div>
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
          <img v-if="activeImage" :src="activeImage.url" :alt="activeImage.alt" class="w-full h-full object-cover" />
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
            <img :src="img.thumbnail_url || img.url" :alt="img.alt" class="w-full h-full object-cover" loading="lazy" />
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
          <button
            @click="isOfferModalOpen = true"
            class="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition"
          >
            Make an Offer
          </button>
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
import { ArrowLeft as IconArrowLeft, Image as IconImage, MapPin as IconMapPin, AlertCircle as IconAlertCircle } from 'lucide-vue-next'
import { formatPublicField } from '@/utils/fieldFormatters'
import type { PublicFieldConfig } from '@/services/publicListingService'
import SubmitOfferModal from '@/components/offers/SubmitOfferModal.vue'

const route = useRoute()
const store = usePublicListingStore()

const listing = computed(() => store.activeListing)
const listingId = computed(() => Number(route.params.id))
const activeImage = ref<any>(null)
const isOfferModalOpen = ref(false)

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
