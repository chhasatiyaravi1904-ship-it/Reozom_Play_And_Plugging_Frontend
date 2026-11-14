<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import {
  ArrowRight,
  ExternalLink,
  Handshake,
  Home,
  Image as ImageIcon,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  FileCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import type { ListingSummary } from '@/types/listing'

const props = withDefaults(
  defineProps<{
    listing: ListingSummary
    layout?: 'card' | 'row'
  }>(),
  {
    layout: 'card',
  },
)

const route = useRoute()
const linkPath = computed(() => {
  const basePath = route.path.startsWith('/agent') ? '/agent' : ''
  return `${basePath}/listings/`
})

const isSubmitted = computed(() => props.listing.status === 'submitted')
const isPublished = computed(() => props.listing.status === 'published')
const isUnderContract = computed(() =>
  ['under_contract', 'ccs', 'contingent_continue_to_show'].includes(props.listing.status),
)
const isSold = computed(() => props.listing.status === 'sold')

const actionButtonLabel = computed(() => {
  if (isSold.value) return 'Closing Record'
  if (isUnderContract.value) return 'Manage Contract'
  if (isPublished.value) return 'Manage & Offers'
  if (isSubmitted.value) return 'View Submission'
  return 'Continue Setup'
})

const formattedPrice = computed(() => {
  if (props.listing.price && Number(props.listing.price) > 0) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(Number(props.listing.price))
  }
  return null
})

const propertyTypeLabel = computed(() => {
  if (!props.listing.propertyType) return null
  const map: Record<string, string> = {
    single_family: 'Single Family',
    condo: 'Condo',
    townhouse: 'Townhouse',
    multi_family: 'Multi-Family',
    commercial: 'Commercial',
    land: 'Vacant Land',
  }
  return map[props.listing.propertyType] || props.listing.propertyType.replace(/_/g, ' ')
})

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
</script>

<template>
  <!-- ROW VIEW (Refined Modern List Layout) -->
  <div
    v-if="layout === 'row'"
    class="group relative flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 sm:p-6 bg-surface hover:bg-surface-raised/60 border border-border/80 hover:border-primary/40 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200"
  >
    <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0 flex-1">
      <!-- Thumbnail with price badge overlay -->
      <div class="relative h-24 w-full sm:w-36 rounded-xl bg-surface-raised shrink-0 overflow-hidden border border-border flex items-center justify-center group-hover:shadow-sm transition">
        <img
          v-if="listing.primaryPhotoUrl"
          :src="formatPhotoUrl(listing.primaryPhotoUrl)"
          :alt="listing.address.address || 'Property'"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div v-else class="w-full h-full flex flex-col items-center justify-center text-fg-muted/40 bg-gradient-to-br from-surface to-surface-raised">
          <Home class="h-8 w-8 text-primary/30" />
          <span class="text-[10px] text-fg-muted font-medium mt-1">No Photo</span>
        </div>

        <div v-if="listing.offersCount && listing.offersCount > 0" class="absolute top-1.5 left-1.5 flex items-center gap-1 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
          <Handshake class="h-3 w-3" />
          {{ listing.offersCount }}
        </div>
      </div>

      <!-- Listing Information -->
      <div class="min-w-0 flex-1 space-y-1.5">
        <div class="flex flex-wrap items-center gap-2">
          <span class="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
            {{ listing.referenceCode || `REO-${listing.id}` }}
          </span>
          <StatusBadge :status="listing.status" />
          <span v-if="propertyTypeLabel" class="text-[11px] font-medium text-fg-muted bg-surface-raised px-2 py-0.5 rounded-md border border-border/60">
            {{ propertyTypeLabel }}
          </span>
          <span v-if="listing.packageName" class="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md">
            {{ listing.packageName }}
          </span>
        </div>

        <div class="flex items-baseline gap-3">
          <h3 class="truncate text-base sm:text-lg font-bold text-fg group-hover:text-primary transition-colors">
            {{ listing.address.address || 'Address Pending Completion' }}
          </h3>
          <span v-if="formattedPrice" class="text-base font-extrabold text-primary shrink-0">
            {{ formattedPrice }}
          </span>
        </div>

        <p class="text-xs text-fg-muted flex items-center gap-1">
          <MapPin class="h-3.5 w-3.5 text-fg-muted shrink-0" />
          <span>{{ listing.address.city ? `${listing.address.city}, ${listing.address.state} ${listing.address.zip}` : listing.address.zip }}</span>
        </p>

        <!-- Specs row if available -->
        <div class="flex flex-wrap items-center gap-4 text-xs text-fg-muted pt-0.5">
          <div v-if="listing.bedrooms" class="flex items-center gap-1">
            <Bed class="h-3.5 w-3.5 text-primary/70" />
            <span class="font-medium text-fg">{{ listing.bedrooms }}</span> Beds
          </div>
          <div v-if="listing.bathrooms" class="flex items-center gap-1">
            <Bath class="h-3.5 w-3.5 text-primary/70" />
            <span class="font-medium text-fg">{{ listing.bathrooms }}</span> Baths
          </div>
          <div v-if="listing.squareFeet" class="flex items-center gap-1">
            <Maximize2 class="h-3.5 w-3.5 text-primary/70" />
            <span class="font-medium text-fg">{{ Number(listing.squareFeet).toLocaleString() }}</span> sqft
          </div>

          <!-- Progress Bar snippet -->
          <div class="flex items-center gap-2 ml-auto sm:ml-0">
            <div class="h-1.5 w-24 overflow-hidden rounded-full bg-surface-raised border border-border/50">
              <div
                class="h-full rounded-full transition-all"
                :class="listing.progressPercent === 100 ? 'bg-emerald-500' : 'bg-primary'"
                :style="{ width: `${listing.progressPercent}%` }"
              ></div>
            </div>
            <span class="text-[11px] font-semibold" :class="listing.progressPercent === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-fg-muted'">
              {{ listing.progressPercent }}% Complete
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions Right Bar -->
    <div class="flex items-center justify-end gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-border/50">
      <RouterLink
        v-if="isPublished"
        :to="`/properties/${listing.id}`"
        target="_blank"
        class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-semibold text-fg hover:bg-surface-raised hover:text-primary transition"
        title="View live listing on marketplace"
      >
        <ExternalLink class="h-3.5 w-3.5" />
        <span class="hidden sm:inline">Live Site</span>
      </RouterLink>

      <RouterLink :to="`${linkPath}${listing.id}`">
        <BaseButton size="sm" :variant="isSubmitted || isPublished ? 'secondary' : 'primary'" class="!rounded-xl shadow-xs">
          {{ actionButtonLabel }}
          <ArrowRight class="ml-1.5 h-3.5 w-3.5" />
        </BaseButton>
      </RouterLink>
    </div>
  </div>

  <!-- CARD VIEW (Rich Grid Card with Hero Image & Prominent Price) -->
  <div
    v-else
    class="group flex flex-col rounded-2xl border border-border/80 bg-surface overflow-hidden shadow-xs hover:shadow-xl hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1"
  >
    <!-- Top Hero Banner -->
    <div class="relative aspect-[16/10] w-full bg-surface-raised overflow-hidden border-b border-border">
      <img
        v-if="listing.primaryPhotoUrl"
        :src="formatPhotoUrl(listing.primaryPhotoUrl)"
        :alt="listing.address.address || 'Property Image'"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
      />
      <div v-else class="w-full h-full flex flex-col items-center justify-center text-fg-muted/40 gap-2 p-4 bg-gradient-to-br from-surface to-surface-raised">
        <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <Home class="h-6 w-6" />
        </div>
        <span class="text-xs text-fg-muted font-medium">Ready for Photography</span>
      </div>

      <!-- Scrim overlay on bottom for text contrast -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none"></div>

      <!-- Top Overlay: Reference & Status Badges -->
      <div class="absolute top-3 left-3 flex items-center gap-2 z-10">
        <span class="font-mono text-xs font-bold text-white bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-sm border border-white/10">
          {{ listing.referenceCode || `REO-${listing.id}` }}
        </span>
      </div>

      <div class="absolute top-3 right-3 z-10">
        <span class="bg-surface/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-sm flex items-center border border-border/40">
          <StatusBadge :status="listing.status" />
        </span>
      </div>

      <!-- Bottom Overlay: Prominent Price & Active Offers -->
      <div class="absolute bottom-3 left-3 right-3 flex items-end justify-between z-10">
        <div>
          <span v-if="formattedPrice" class="text-2xl font-black text-white tracking-tight drop-shadow-md block">
            {{ formattedPrice }}
          </span>
          <span v-else class="text-sm font-bold text-white/90 bg-slate-900/60 backdrop-blur-xs px-2 py-0.5 rounded-md">
            Price Pending
          </span>
        </div>

        <div
          v-if="listing.offersCount && listing.offersCount > 0"
          class="inline-flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg shadow-emerald-500/30 animate-pulse"
        >
          <Handshake class="h-3.5 w-3.5" />
          <span>{{ listing.offersCount }} Offer{{ listing.offersCount > 1 ? 's' : '' }}</span>
        </div>
      </div>
    </div>

    <!-- Card Content Body -->
    <div class="p-5 flex flex-col flex-1 justify-between gap-4">
      <div class="space-y-3">
        <!-- Title & Address -->
        <div>
          <h3 class="font-bold text-lg text-fg group-hover:text-primary transition-colors line-clamp-1 leading-snug">
            {{ listing.address.address || 'Address Pending Completion' }}
          </h3>
          <p class="text-xs text-fg-muted flex items-center gap-1.5 mt-1 font-medium">
            <MapPin class="h-3.5 w-3.5 text-primary/70 shrink-0" />
            <span>
              {{ listing.address.city ? `${listing.address.city}, ${listing.address.state} ${listing.address.zip}` : listing.address.zip }}
            </span>
          </p>
        </div>

        <!-- Property Specs Bar (Beds, Baths, Sqft, Type) -->
        <div class="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-surface-raised/70 border border-border/50 text-center">
          <div class="flex flex-col items-center">
            <span class="text-[10px] text-fg-muted font-medium flex items-center gap-1">
              <Bed class="h-3 w-3 text-primary/70" /> Beds
            </span>
            <span class="text-xs font-bold text-fg mt-0.5">
              {{ listing.bedrooms || '—' }}
            </span>
          </div>

          <div class="flex flex-col items-center border-x border-border/60">
            <span class="text-[10px] text-fg-muted font-medium flex items-center gap-1">
              <Bath class="h-3 w-3 text-primary/70" /> Baths
            </span>
            <span class="text-xs font-bold text-fg mt-0.5">
              {{ listing.bathrooms || '—' }}
            </span>
          </div>

          <div class="flex flex-col items-center">
            <span class="text-[10px] text-fg-muted font-medium flex items-center gap-1">
              <Maximize2 class="h-3 w-3 text-primary/70" /> Sq Ft
            </span>
            <span class="text-xs font-bold text-fg mt-0.5">
              {{ listing.squareFeet ? Number(listing.squareFeet).toLocaleString() : '—' }}
            </span>
          </div>
        </div>

        <!-- Package & Status details badge -->
        <div class="flex items-center justify-between text-xs pt-1">
          <span v-if="listing.packageName" class="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md truncate max-w-[190px]">
            {{ listing.packageName }}
          </span>
          <span v-else class="text-[11px] text-fg-muted">Standard MLS</span>

          <span v-if="propertyTypeLabel" class="text-[11px] text-fg-muted font-medium bg-surface-raised px-2 py-0.5 rounded-md border border-border/40">
            {{ propertyTypeLabel }}
          </span>
        </div>
      </div>

      <!-- Compliance & Workflow Progress -->
      <div class="pt-3 border-t border-border/60 space-y-2">
        <div class="flex items-center justify-between text-xs">
          <span class="text-fg-muted font-medium flex items-center gap-1">
            <ShieldCheck class="h-3.5 w-3.5 text-primary" />
            Compliance & Setup
          </span>
          <span class="font-bold" :class="listing.progressPercent === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-fg'">
            {{ listing.progressPercent }}%
          </span>
        </div>

        <div class="h-2 w-full overflow-hidden rounded-full bg-surface-raised border border-border/40">
          <div
            class="h-full rounded-full transition-all duration-300"
            :class="listing.progressPercent === 100 ? 'bg-emerald-500' : 'bg-primary'"
            :style="{ width: `${listing.progressPercent}%` }"
          ></div>
        </div>

        <div class="flex items-center justify-between text-[11px] text-fg-muted">
          <span>{{ listing.stepsCompleted }} of {{ listing.stepsTotal }} steps completed</span>
          <span>Updated {{ listing.updatedAt }}</span>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="pt-3 border-t border-border flex items-center justify-between gap-2">
        <RouterLink
          v-if="isPublished"
          :to="`/properties/${listing.id}`"
          target="_blank"
          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-semibold text-fg hover:bg-surface-raised hover:text-primary transition"
          title="Open live public marketplace page"
        >
          <ExternalLink class="h-3.5 w-3.5" />
          <span>Live Site</span>
        </RouterLink>

        <RouterLink :to="`${linkPath}${listing.id}`" class="flex-1">
          <BaseButton
            size="sm"
            class="w-full justify-center !rounded-xl font-semibold shadow-xs"
            :variant="isPublished || isSubmitted ? 'secondary' : 'primary'"
          >
            {{ actionButtonLabel }}
            <ArrowRight class="ml-1.5 h-3.5 w-3.5" />
          </BaseButton>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
