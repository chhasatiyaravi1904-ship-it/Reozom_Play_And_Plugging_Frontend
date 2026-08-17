<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight, Check, Home } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import ProgressRing from '@/components/ui/ProgressRing.vue'
import ListingCard from '@/components/listing/ListingCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import { useListingStore } from '@/stores/listing'
import { useWorkflowStore } from '@/stores/workflow'
import { useListingSteps } from '@/composables/useListingSteps'
import { useAuth } from '@/composables/useAuth'

const listingStore = useListingStore()
const workflowStore = useWorkflowStore()
const { user } = useAuth()

const firstName = computed(() => user.value?.fullName.split(' ')[0] || 'there')
const listing = computed(() => listingStore.activeListing)

// listingId isn't known synchronously (fetched on mount), but `steps` doesn't depend on it —
// only `routeFor` does, and Dashboard links to the listing overview page instead of using it.
const { steps } = useListingSteps(0)

const nextStep = computed(() => steps.value.find((s) => s.status === 'current'))

onMounted(async () => {
  await listingStore.fetchListings()
  if (listing.value) workflowStore.fetchWorkflow(listing.value.id)
})
</script>

<template>
  <div class="flex flex-col gap-8">
    <section class="rounded-xl border border-border bg-primary-soft px-6 py-6 md:px-8">
      <p class="text-sm font-medium text-fg-muted">Welcome back, {{ firstName }} 👋</p>
      <h1 class="mt-1 max-w-xl text-xl font-semibold text-fg md:text-2xl">
        Let's get your property listed, the smart way.
      </h1>
      <p class="mt-2 max-w-xl text-sm text-fg-muted">
        Complete your listing in a few simple steps.
      </p>
      <RouterLink
        :to="listing ? `/listings/${listing.id}` : '/listings/create'"
        class="mt-4 inline-block"
      >
        <BaseButton>
          {{ listing ? 'Continue Listing' : 'Start New Listing' }}
          <ArrowRight class="ml-1.5 h-4 w-4" />
        </BaseButton>
      </RouterLink>
    </section>

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
      v-else-if="!listing"
      :icon="Home"
      title="Ready to list your property?"
      description="Start a new listing and we'll guide you through every step."
    >
      <template #action>
        <RouterLink to="/listings/create">
          <BaseButton>
            Start New Listing
            <ArrowRight class="ml-1.5 h-4 w-4" />
          </BaseButton>
        </RouterLink>
      </template>
    </EmptyState>

    <div v-else class="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <section class="lg:col-span-3">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-fg">Your Listing</h2>
          <span class="text-sm text-fg-muted">1 Active Listing</span>
        </div>
        <div class="rounded-xl border border-border bg-surface">
          <ListingCard :listing="listing" />
        </div>
      </section>

      <section class="lg:col-span-2">
        <h2 class="mb-3 text-lg font-semibold text-fg">Your Progress</h2>
        <div class="rounded-xl border border-border bg-surface p-4">
          <div class="flex flex-col items-center gap-3">
            <ProgressRing :percent="listing.progressPercent" />
            <p class="text-sm font-medium text-fg">
              {{ listing.stepsCompleted }} of {{ listing.stepsTotal }} Steps Completed
            </p>
          </div>

          <LoadingState
            v-if="workflowStore.status === 'loading'"
            :rows="4"
            class="mt-5 border-t border-border pt-4"
          />

          <template v-else>
            <ul class="mt-5 flex flex-col gap-2.5 border-t border-border pt-4">
              <li v-for="step in steps" :key="step.id" class="flex items-center gap-2 text-sm">
                <Check v-if="step.status === 'completed'" class="h-3.5 w-3.5 shrink-0 text-success" />
                <span v-else class="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                  <span
                    class="h-2 w-2 rounded-full"
                    :class="step.status === 'current' ? 'bg-primary' : 'border border-border'"
                  ></span>
                </span>
                <span
                  :class="
                    step.status === 'current'
                      ? 'font-medium text-primary'
                      : step.status === 'upcoming'
                        ? 'text-fg-muted'
                        : 'text-fg'
                  "
                >
                  {{ step.label }}
                </span>
              </li>
            </ul>

            <div
              v-if="nextStep"
              class="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4"
            >
              <div class="min-w-0">
                <p class="text-xs text-fg-muted">Next step</p>
                <p class="truncate text-sm font-medium text-fg">{{ nextStep.label }}</p>
              </div>
              <RouterLink :to="`/listings/${listing.id}`" class="shrink-0">
                <BaseButton size="sm">
                  Continue
                  <ArrowRight class="ml-1 h-3.5 w-3.5" />
                </BaseButton>
              </RouterLink>
            </div>
          </template>
        </div>
      </section>
    </div>
  </div>
</template>
