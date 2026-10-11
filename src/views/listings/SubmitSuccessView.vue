<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PartyPopper } from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useListingStore } from '@/stores/listing'

const route = useRoute()
const router = useRouter()
const listingId = computed(() => Number(route.params.listingId))
const listingStore = useListingStore()

const isAgent = computed(() => route.path.startsWith('/agent'))
const basePath = computed(() => isAgent.value ? '/agent' : '')

const viewListingPath = computed(() => `${basePath.value}/listings/${listingId.value}`)
const dashboardPath = computed(() => isAgent.value ? '/agent/dashboard' : '/dashboard')

onMounted(() => {
  if (!listingStore.activeListing) {
    listingStore.fetchListing(listingId.value)
  }
})
</script>

<template>
  <div class="mx-auto max-w-lg">
    <BaseCard>
      <div class="flex flex-col items-center gap-3 py-6 text-center">
        <PartyPopper class="h-9 w-9 text-primary" aria-hidden="true" />
        <h1 class="text-2xl font-semibold text-fg">Listing Submitted!</h1>
        <p class="text-sm text-fg-muted">
          Your listing information has been successfully submitted for review.
        </p>

        <p class="mt-2 rounded-lg bg-surface-raised px-4 py-2 text-sm font-medium text-fg">
          Reference: {{ listingStore.activeListing?.referenceCode || `REO-${listingId}` }}
        </p>

        <p class="mt-2 text-sm text-fg-muted">Our team will review your submission shortly.</p>

        <div class="mt-6 flex flex-col gap-3 sm:flex-row">
          <RouterLink :to="viewListingPath">
            <BaseButton variant="secondary">View Listing</BaseButton>
          </RouterLink>
          <RouterLink :to="dashboardPath">
            <BaseButton>Go to Dashboard</BaseButton>
          </RouterLink>
        </div>
      </div>
    </BaseCard>
  </div>
</template>
