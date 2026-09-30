<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight, Home } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import ListingCard from '@/components/listing/ListingCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import { useListingStore } from '@/stores/listing'
import { useAuthStore } from '@/stores/auth'

const listingStore = useListingStore()
const authStore = useAuthStore()

const createRoute = authStore.user?.role === 'agent' ? '/agent/listings/create' : '/listings/create'

onMounted(() => {
  listingStore.fetchListings()
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <PageHeader title="My Listings">
      <template #actions>
        <RouterLink :to="createRoute">
          <BaseButton>
            Start New Listing
            <ArrowRight class="ml-1.5 h-4 w-4" />
          </BaseButton>
        </RouterLink>
      </template>
    </PageHeader>

    <LoadingState
      v-if="listingStore.status === 'loading'"
      :rows="3"
      label="Loading your listings"
    />

    <ErrorState
      v-else-if="listingStore.status === 'error'"
      :description="listingStore.error || undefined"
    >
      <template #action>
        <BaseButton size="sm" @click="listingStore.fetchListings">Try Again</BaseButton>
      </template>
    </ErrorState>

    <EmptyState
      v-else-if="!listingStore.listings.length"
      :icon="Home"
      title="Ready to list your property?"
      description="Start a new listing and we'll guide you through every step."
    >
      <template #action>
        <RouterLink :to="createRoute">
          <BaseButton>
            Start New Listing
            <ArrowRight class="ml-1.5 h-4 w-4" />
          </BaseButton>
        </RouterLink>
      </template>
    </EmptyState>

    <ul v-else class="divide-y divide-border rounded-xl border border-border bg-surface">
      <li v-for="listing in listingStore.listings" :key="listing.id">
        <ListingCard :listing="listing" />
      </li>
    </ul>
  </div>
</template>
