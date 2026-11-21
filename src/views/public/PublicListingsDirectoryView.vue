<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 min-h-screen flex flex-col">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-neutral-900">Property Directory</h1>
      <p class="text-neutral-500 mt-2">Explore available properties dynamically configured by our agents.</p>
    </div>

    <!-- Loading State -->
    <div v-if="store.status === 'loading'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="bg-white rounded-xl border border-neutral-200 h-80 flex flex-col overflow-hidden">
        <div class="skeleton h-48 rounded-t-xl" aria-hidden="true"></div>
        <div class="p-5 flex flex-col gap-3">
          <div class="skeleton h-6 rounded w-3/4"></div>
          <div class="skeleton h-5 rounded w-1/2"></div>
          <div class="skeleton h-4 rounded w-full mt-4"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="store.status === 'error'" class="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-neutral-200 text-center flex-1">
      <p class="text-neutral-900 font-medium mb-4">Unable to load listings</p>
      <button @click="loadListings()" class="px-4 py-2 bg-primary text-white text-sm font-medium rounded hover:bg-primary/90 transition">
        Retry
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="store.listings.length === 0" class="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-neutral-200 text-center flex-1">
      <p class="text-neutral-500 font-medium">No listings available</p>
    </div>

    <!-- Grid -->
    <div v-else class="flex-1 flex flex-col">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PublicListingCard v-for="listing in store.listings" :key="listing.id" :listing="listing" />
      </div>

      <!-- Pagination -->
      <div class="mt-12 flex items-center justify-center gap-2" v-if="store.meta.last_page > 1">
        <button 
          :disabled="store.meta.current_page === 1"
          @click="loadListings(store.meta.current_page - 1)"
          class="px-3 py-1.5 border border-neutral-300 rounded text-sm disabled:opacity-50 hover:bg-neutral-50"
          aria-label="Previous page"
        >
          Previous
        </button>
        <span class="text-sm text-neutral-600 px-4">
          Page {{ store.meta.current_page }} of {{ store.meta.last_page }}
        </span>
        <button 
          :disabled="store.meta.current_page === store.meta.last_page"
          @click="loadListings(store.meta.current_page + 1)"
          class="px-3 py-1.5 border border-neutral-300 rounded text-sm disabled:opacity-50 hover:bg-neutral-50"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { usePublicListingStore } from '@/stores/publicListing'
import PublicListingCard from '@/components/listing/PublicListingCard.vue'

const store = usePublicListingStore()

const loadListings = (page = 1) => {
  store.fetchListings(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  loadListings()
})
</script>
