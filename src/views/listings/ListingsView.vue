<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  ArrowRight,
  ArrowUpDown,
  Building,
  Building2,
  CheckCircle2,
  Clock,
  Filter,
  Grid,
  Handshake,
  Home,
  List,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import ListingCard from '@/components/listing/ListingCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import Tabs from '@/components/ui/Tabs.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import { useListingStore } from '@/stores/listing'
import { useAuthStore } from '@/stores/auth'

const listingStore = useListingStore()
const authStore = useAuthStore()

const createRoute = authStore.user?.role === 'agent' ? '/agent/listings/create' : '/listings/create'

// View & Filter States
const viewMode = ref<'card' | 'list'>('card')
const selectedStatus = ref<string>('all')
const searchQuery = ref<string>('')
const sortBy = ref<'updated' | 'price_desc' | 'price_asc' | 'progress' | 'address'>('updated')
const isRefreshing = ref(false)

onMounted(() => {
  listingStore.fetchListings()
})

async function refreshListings() {
  isRefreshing.value = true
  try {
    await listingStore.fetchListings()
  } finally {
    isRefreshing.value = false
  }
}

// Metrics computation
const metrics = computed(() => {
  const all = listingStore.listings
  return {
    total: all.length,
    published: all.filter((l) => l.status === 'published').length,
    inContract: all.filter((l) =>
      ['under_contract', 'ccs', 'contingent_continue_to_show'].includes(l.status),
    ).length,
    inProgress: all.filter((l) =>
      ['draft', 'in_progress', 'submitted', 'under_review'].includes(l.status),
    ).length,
    sold: all.filter((l) => l.status === 'sold').length,
  }
})

const statusTabs = computed(() => [
  { value: 'all', label: 'All Properties', count: metrics.value.total },
  { value: 'published', label: 'Published & MLS', count: metrics.value.published },
  { value: 'contract', label: 'In Contract / Escrow', count: metrics.value.inContract },
  { value: 'in_progress', label: 'In Setup & Draft', count: metrics.value.inProgress },
  { value: 'sold', label: 'Sold & Closed', count: metrics.value.sold },
])

const filteredListings = computed(() => {
  let items = listingStore.listings

  // Filter by status tab
  if (selectedStatus.value === 'published') {
    items = items.filter((l) => l.status === 'published')
  } else if (selectedStatus.value === 'contract') {
    items = items.filter((l) =>
      ['under_contract', 'ccs', 'contingent_continue_to_show'].includes(l.status),
    )
  } else if (selectedStatus.value === 'in_progress') {
    items = items.filter((l) =>
      ['draft', 'in_progress', 'submitted', 'under_review'].includes(l.status),
    )
  } else if (selectedStatus.value === 'sold') {
    items = items.filter((l) => l.status === 'sold')
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    items = items.filter((l) => {
      const addr = (l.address?.address || '').toLowerCase()
      const city = (l.address?.city || '').toLowerCase()
      const zip = (l.address?.zip || '').toLowerCase()
      const state = (l.address?.state || '').toLowerCase()
      const ref = (l.referenceCode || '').toLowerCase()
      const title = (l.listingTitle || '').toLowerCase()
      return (
        addr.includes(q) ||
        city.includes(q) ||
        zip.includes(q) ||
        state.includes(q) ||
        ref.includes(q) ||
        title.includes(q)
      )
    })
  }

  // Apply sorting
  const sorted = [...items]
  if (sortBy.value === 'price_desc') {
    sorted.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))
  } else if (sortBy.value === 'price_asc') {
    sorted.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))
  } else if (sortBy.value === 'progress') {
    sorted.sort((a, b) => (b.progressPercent || 0) - (a.progressPercent || 0))
  } else if (sortBy.value === 'address') {
    sorted.sort((a, b) => (a.address?.address || '').localeCompare(b.address?.address || ''))
  }

  return sorted
})

const hasActiveFilters = computed(() => {
  return selectedStatus.value !== 'all' || searchQuery.value.trim().length > 0
})

function clearAllFilters() {
  selectedStatus.value = 'all'
  searchQuery.value = ''
  sortBy.value = 'updated'
}
</script>

<template>
  <div class="flex flex-col gap-6 max-w-7xl mx-auto w-full">
    <!-- Modern Hero Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/70">
      <div>
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary uppercase tracking-wider">
            <Building2 class="h-3.5 w-3.5" />
            Agent MLS Control Center
          </span>
          <span class="text-xs text-fg-muted">Real-time Portfolio</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-fg tracking-tight mt-1.5">
          My Properties & Listings
        </h1>
        <p class="text-sm text-fg-muted mt-1 max-w-2xl">
          Track MLS syndication status, review statutory disclosures, complete compliance workflows, and manage incoming buyer purchase offers.
        </p>
      </div>

      <!-- Header CTAs -->
      <div class="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          class="p-2.5 rounded-xl border border-border bg-surface text-fg-muted hover:text-fg hover:bg-surface-raised transition shadow-xs"
          title="Refresh listings"
          :disabled="isRefreshing"
          @click="refreshListings"
        >
          <RefreshCw class="h-4 w-4" :class="{ 'animate-spin': isRefreshing }" />
        </button>

        <RouterLink :to="createRoute">
          <BaseButton class="!rounded-xl shadow-sm font-semibold hover:shadow-md transition">
            <Plus class="mr-1.5 h-4 w-4" />
            Start New Listing
          </BaseButton>
        </RouterLink>
      </div>
    </div>

    <!-- Interactive KPI Metric Cards (Clickable Quick Filters) -->
    <div v-if="listingStore.listings.length > 0" class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <!-- 1. Total Properties -->
      <button
        type="button"
        class="text-left p-4 rounded-2xl border transition-all duration-200 group relative overflow-hidden"
        :class="
          selectedStatus === 'all'
            ? 'bg-primary/5 border-primary shadow-sm ring-2 ring-primary/20'
            : 'bg-surface border-border hover:border-primary/40 hover:bg-surface-raised/40 hover:shadow-xs'
        "
        @click="selectedStatus = 'all'"
      >
        <div class="flex items-center justify-between">
          <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Building class="h-5 w-5" />
          </div>
          <span
            v-if="selectedStatus === 'all'"
            class="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full"
          >
            Active Filter
          </span>
        </div>
        <div class="mt-3">
          <span class="text-xs text-fg-muted font-medium block">Total Properties</span>
          <span class="text-2xl font-black text-fg mt-0.5 block tracking-tight">{{ metrics.total }}</span>
          <span class="text-[11px] text-fg-muted mt-1 block">Full agency portfolio</span>
        </div>
      </button>

      <!-- 2. Active & Published -->
      <button
        type="button"
        class="text-left p-4 rounded-2xl border transition-all duration-200 group relative overflow-hidden"
        :class="
          selectedStatus === 'published'
            ? 'bg-emerald-500/5 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
            : 'bg-surface border-border hover:border-emerald-500/40 hover:bg-surface-raised/40 hover:shadow-xs'
        "
        @click="selectedStatus = 'published'"
      >
        <div class="flex items-center justify-between">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 class="h-5 w-5" />
          </div>
          <span class="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live MLS
          </span>
        </div>
        <div class="mt-3">
          <span class="text-xs text-fg-muted font-medium block">Active & Published</span>
          <span class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block tracking-tight">{{ metrics.published }}</span>
          <span class="text-[11px] text-fg-muted mt-1 block">Syndicated on marketplace</span>
        </div>
      </button>

      <!-- 3. In Contract / CCS -->
      <button
        type="button"
        class="text-left p-4 rounded-2xl border transition-all duration-200 group relative overflow-hidden"
        :class="
          selectedStatus === 'contract'
            ? 'bg-amber-500/5 border-amber-500 shadow-sm ring-2 ring-amber-500/20'
            : 'bg-surface border-border hover:border-amber-500/40 hover:bg-surface-raised/40 hover:shadow-xs'
        "
        @click="selectedStatus = 'contract'"
      >
        <div class="flex items-center justify-between">
          <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
            <Handshake class="h-5 w-5" />
          </div>
          <span
            v-if="selectedStatus === 'contract'"
            class="text-[11px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full"
          >
            Active Filter
          </span>
        </div>
        <div class="mt-3">
          <span class="text-xs text-fg-muted font-medium block">Under Contract / CCS</span>
          <span class="text-2xl font-black text-amber-600 mt-0.5 block tracking-tight">{{ metrics.inContract }}</span>
          <span class="text-[11px] text-fg-muted mt-1 block">Offers accepted / Escrow</span>
        </div>
      </button>

      <!-- 4. In Setup & Draft -->
      <button
        type="button"
        class="text-left p-4 rounded-2xl border transition-all duration-200 group relative overflow-hidden"
        :class="
          selectedStatus === 'in_progress'
            ? 'bg-sky-500/5 border-sky-500 shadow-sm ring-2 ring-sky-500/20'
            : 'bg-surface border-border hover:border-sky-500/40 hover:bg-surface-raised/40 hover:shadow-xs'
        "
        @click="selectedStatus = 'in_progress'"
      >
        <div class="flex items-center justify-between">
          <div class="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center shrink-0">
            <Clock class="h-5 w-5" />
          </div>
          <span
            v-if="selectedStatus === 'in_progress'"
            class="text-[11px] font-bold text-sky-600 bg-sky-100 dark:bg-sky-950 px-2 py-0.5 rounded-full"
          >
            Active Filter
          </span>
        </div>
        <div class="mt-3">
          <span class="text-xs text-fg-muted font-medium block">Setup & Drafts</span>
          <span class="text-2xl font-black text-sky-600 mt-0.5 block tracking-tight">{{ metrics.inProgress }}</span>
          <span class="text-[11px] text-fg-muted mt-1 block">Pending compliance / photos</span>
        </div>
      </button>
    </div>

    <!-- Filter, Search, Sort & View Mode Toolbar -->
    <div
      v-if="listingStore.listings.length > 0"
      class="p-4 rounded-2xl border border-border bg-surface shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
    >
      <!-- Status Tabs -->
      <div class="overflow-x-auto min-w-0">
        <Tabs
          :tabs="statusTabs"
          :model-value="selectedStatus"
          @update:model-value="(val) => (selectedStatus = val)"
        />
      </div>

      <!-- Controls Right: Search + Sort + Layout Toggle -->
      <div class="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto shrink-0">
        <!-- Search Input -->
        <div class="w-full sm:w-64 min-w-[200px]">
          <SearchInput
            :model-value="searchQuery"
            placeholder="Search address, ZIP, code..."
            @update:model-value="(val) => (searchQuery = val)"
          />
        </div>

        <!-- Sort Select -->
        <div class="relative shrink-0">
          <select
            v-model="sortBy"
            class="focus-ring h-9 pl-3 pr-8 rounded-xl border border-border bg-surface text-xs font-semibold text-fg appearance-none cursor-pointer hover:bg-surface-raised transition shadow-xs"
          >
            <option value="updated">Recently Updated</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="progress">Setup Progress %</option>
            <option value="address">Address (A-Z)</option>
          </select>
          <ArrowUpDown class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-fg-muted" />
        </div>

        <!-- View Switcher (Card vs Row) -->
        <div class="flex items-center rounded-xl border border-border bg-surface-raised p-1 shrink-0">
          <button
            type="button"
            class="p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            :class="viewMode === 'card' ? 'bg-surface text-primary shadow-xs' : 'text-fg-muted hover:text-fg'"
            title="Card View (Grid)"
            @click="viewMode = 'card'"
          >
            <Grid class="h-4 w-4" />
            <span class="hidden sm:inline">Cards</span>
          </button>
          <button
            type="button"
            class="p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            :class="viewMode === 'list' ? 'bg-surface text-primary shadow-xs' : 'text-fg-muted hover:text-fg'"
            title="List View"
            @click="viewMode = 'list'"
          >
            <List class="h-4 w-4" />
            <span class="hidden sm:inline">List</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Active Filter Indicators & Results Count -->
    <div
      v-if="hasActiveFilters && listingStore.listings.length > 0"
      class="flex items-center justify-between text-xs px-1 text-fg-muted"
    >
      <div class="flex items-center gap-2 flex-wrap">
        <span>Showing <strong>{{ filteredListings.length }}</strong> of <strong>{{ listingStore.listings.length }}</strong> properties</span>
        <span v-if="selectedStatus !== 'all'" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-raised border border-border text-fg">
          Filter: <span class="capitalize font-semibold">{{ selectedStatus.replace(/_/g, ' ') }}</span>
          <button type="button" class="hover:text-primary ml-1" @click="selectedStatus = 'all'">
            <X class="h-3 w-3" />
          </button>
        </span>
        <span v-if="searchQuery.trim()" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-raised border border-border text-fg">
          Search: "{{ searchQuery }}"
          <button type="button" class="hover:text-primary ml-1" @click="searchQuery = ''">
            <X class="h-3 w-3" />
          </button>
        </span>
      </div>

      <button
        type="button"
        class="text-xs font-semibold text-primary hover:underline"
        @click="clearAllFilters"
      >
        Clear all filters
      </button>
    </div>

    <!-- Loading State -->
    <LoadingState
      v-if="listingStore.status === 'loading'"
      :rows="3"
      label="Loading your property portfolio..."
    />

    <!-- Error State -->
    <ErrorState
      v-else-if="listingStore.status === 'error'"
      :description="listingStore.error || undefined"
    >
      <template #action>
        <BaseButton size="sm" @click="listingStore.fetchListings">Try Again</BaseButton>
      </template>
    </ErrorState>

    <!-- Global Empty State -->
    <EmptyState
      v-else-if="!listingStore.listings.length"
      :icon="Home"
      title="Ready to list your first property?"
      description="Start a new listing and our compliance engine will guide you through statutory seller disclosures, MLS syndication, and high-resolution photo uploads."
    >
      <template #action>
        <RouterLink :to="createRoute">
          <BaseButton class="!rounded-xl shadow-sm">
            Start New Listing
            <ArrowRight class="ml-1.5 h-4 w-4" />
          </BaseButton>
        </RouterLink>
      </template>
    </EmptyState>

    <!-- Filter Empty State -->
    <div
      v-else-if="filteredListings.length === 0"
      class="text-center py-16 bg-surface rounded-2xl border border-dashed border-border"
    >
      <Building class="mx-auto h-12 w-12 text-fg-muted/40" />
      <h3 class="mt-3 text-base font-bold text-fg">No matching properties</h3>
      <p class="mt-1 text-xs text-fg-muted max-w-sm mx-auto">
        No properties in your portfolio match the selected filters or search keyword "{{ searchQuery }}".
      </p>
      <button
        type="button"
        class="mt-4 px-4 py-2 bg-surface-raised border border-border rounded-xl text-xs font-semibold text-primary hover:bg-surface-raised/80 transition shadow-xs"
        @click="clearAllFilters"
      >
        Clear All Filters
      </button>
    </div>

    <!-- CARD VIEW (Default Responsive Grid) -->
    <div
      v-else-if="viewMode === 'card'"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <ListingCard
        v-for="listing in filteredListings"
        :key="listing.id"
        :listing="listing"
        layout="card"
      />
    </div>

    <!-- LIST VIEW (Compact List) -->
    <div
      v-else
      class="space-y-4"
    >
      <ListingCard
        v-for="listing in filteredListings"
        :key="listing.id"
        :listing="listing"
        layout="row"
      />
    </div>
  </div>
</template>
