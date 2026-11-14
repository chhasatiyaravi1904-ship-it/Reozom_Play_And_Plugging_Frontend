<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { PartyPopper, CheckCircle, ExternalLink } from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useListingStore } from '@/stores/listing'

const route = useRoute()
const listingId = computed(() => Number(route.params.listingId))
const listingStore = useListingStore()

const isAgent = computed(() => route.path.startsWith('/agent'))
const basePath = computed(() => isAgent.value ? '/agent' : '')

const viewListingPath = computed(() => `${basePath.value}/listings/${listingId.value}`)
const publicListingPath = computed(() => `/properties/${listingId.value}`)
const dashboardPath = computed(() => isAgent.value ? '/agent/dashboard' : '/dashboard')

onMounted(() => {
  if (!listingStore.activeListing) {
    listingStore.fetchListing(listingId.value)
  }
})
</script>

<template>
  <div class="mx-auto max-w-lg py-8">
    <BaseCard>
      <div class="flex flex-col items-center gap-3 py-6 text-center">
        <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
          <PartyPopper class="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 class="text-2xl font-bold text-fg">Listing Published!</h1>
        <p class="text-sm text-fg-muted max-w-md">
          Your property listing has bypassed review and is now live and published on the marketplace.
        </p>

        <p class="mt-2 rounded-lg bg-surface-raised px-4 py-2 text-sm font-mono font-bold text-primary border border-border">
          Reference: {{ listingStore.activeListing?.referenceCode || `REO-${listingId}` }}
        </p>

        <p class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 mt-1">
          <CheckCircle class="h-4 w-4" />
          Status: Active & Published
        </p>

        <div class="mt-6 flex flex-col gap-3 sm:flex-row">
          <RouterLink :to="publicListingPath" target="_blank">
            <BaseButton variant="primary">
              <ExternalLink class="mr-1.5 h-4 w-4" />
              View Public Page
            </BaseButton>
          </RouterLink>
          <RouterLink :to="viewListingPath">
            <BaseButton variant="secondary">Manage Listing</BaseButton>
          </RouterLink>
          <RouterLink :to="dashboardPath">
            <BaseButton variant="secondary">Dashboard</BaseButton>
          </RouterLink>
        </div>
      </div>
    </BaseCard>
  </div>
</template>
