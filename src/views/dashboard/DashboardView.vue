<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import {
  ArrowRight,
  Building,
  Check,
  Grid,
  Home,
  Plus,
  Sliders,
} from 'lucide-vue-next'
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

// Dashboard tab: 'overview' (current active listing & progress) vs 'listings' (all listings in card view)
const dashboardTab = ref<'overview' | 'listings'>('overview')

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
    <!-- Welcome Header Banner -->
    <section class="rounded-2xl border border-border bg-gradient-to-r from-primary-soft to-surface-raised px-6 py-6 md:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <p class="text-sm font-medium text-fg-muted">Welcome back, {{ firstName }} 👋</p>
        <h1 class="mt-1 max-w-xl text-xl font-bold text-fg md:text-2xl">
          Let's get your property listed, the smart way.
        </h1>
        <p class="mt-1.5 max-w-xl text-xs sm:text-sm text-fg-muted">
          Track statutory MLS compliance, manage documents, and negotiate buyer offers.
        </p>
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <RouterLink to="/listings">
          <BaseButton variant="secondary" class="!rounded-xl shadow-xs font-semibold">
            Browse & Make Offers
          </BaseButton>
        </RouterLink>
        <RouterLink to="/listings/create">
          <BaseButton class="!rounded-xl shadow-sm font-semibold">
            <Plus class="mr-1.5 h-4 w-4" />
            Start New Listing
          </BaseButton>
        </RouterLink>
      </div>
    </section>

    <!-- Loading State -->
    <LoadingState
      v-if="listingStore.status === 'loading'"
      :rows="3"
      label="Loading your listings"
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

    <!-- Empty State -->
    <EmptyState
      v-else-if="!listing && listingStore.listings.length === 0"
      :icon="Home"
      title="Ready to list your property?"
      description="Start a new listing and we'll guide you through every statutory step and MLS requirement."
    >
      <template #action>
        <RouterLink to="/listings/create">
          <BaseButton class="!rounded-xl">
            Start New Listing
            <ArrowRight class="ml-1.5 h-4 w-4" />
          </BaseButton>
        </RouterLink>
      </template>
    </EmptyState>

    <!-- Dashboard Content when listings exist -->
    <div v-else class="space-y-6">
      <!-- Tabs Navigation Bar: Active Workflow vs All Listings Card View -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-3">
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded-xl text-sm font-semibold transition"
            :class="dashboardTab === 'overview' ? 'bg-primary text-white shadow-sm' : 'bg-surface-raised text-fg-muted hover:text-fg'"
            @click="dashboardTab = 'overview'"
          >
            Active Setup & Progress
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition"
            :class="dashboardTab === 'listings' ? 'bg-primary text-white shadow-sm' : 'bg-surface-raised text-fg-muted hover:text-fg'"
            @click="dashboardTab = 'listings'"
          >
            <Grid class="h-4 w-4" />
            <span>All Properties in Card View ({{ listingStore.listings.length }})</span>
          </button>
        </div>

        <RouterLink
          to="/listings"
          class="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
        >
          <span>Open Full Listings Tab</span>
          <ArrowRight class="h-3.5 w-3.5" />
        </RouterLink>
      </div>

      <!-- TAB 1: ACTIVE OVERVIEW & STEPPER PROGRESS -->
      <div v-if="dashboardTab === 'overview'" class="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <section class="lg:col-span-3 space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-base font-bold text-fg">Active Selected Property</h2>
            <span class="text-xs text-fg-muted">{{ listingStore.listings.length }} Total Listing(s)</span>
          </div>

          <!-- Active Property Card -->
          <div v-if="listing">
            <ListingCard :listing="listing" layout="card" />
          </div>
        </section>

        <!-- Right Side: Workflow Progress Stepper -->
        <section v-if="listing" class="lg:col-span-2">
          <h2 class="mb-4 text-base font-bold text-fg">Statutory Setup Progress</h2>
          <div class="rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <div class="flex flex-col items-center gap-3">
              <ProgressRing :percent="listing.progressPercent" />
              <p class="text-sm font-bold text-fg">
                {{ listing.stepsCompleted }} of {{ listing.stepsTotal }} Steps Completed
              </p>
            </div>

            <LoadingState variant="lines"
              v-if="workflowStore.status === 'loading'"
              :rows="4"
              class="mt-5 border-t border-border pt-4"
            />

            <template v-else>
              <ul class="mt-5 flex flex-col gap-2.5 border-t border-border pt-4">
                <li v-for="step in steps" :key="step.id" class="flex items-center gap-2 text-xs">
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
                        ? 'font-bold text-primary'
                        : step.status === 'upcoming'
                          ? 'text-fg-muted'
                          : 'text-fg font-medium'
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
                  <p class="text-[11px] text-fg-muted font-medium">Next compliance step</p>
                  <p class="truncate text-xs font-bold text-fg">{{ nextStep.label }}</p>
                </div>
                <RouterLink :to="`/listings/${listing.id}`" class="shrink-0">
                  <BaseButton size="sm" class="!rounded-xl text-xs">
                    Continue
                    <ArrowRight class="ml-1 h-3.5 w-3.5" />
                  </BaseButton>
                </RouterLink>
              </div>
            </template>
          </div>
        </section>
      </div>

      <!-- TAB 2: ALL LISTINGS IN CARD VIEW (Responsive Grid) -->
      <div v-else class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-bold text-fg">All Registered Properties</h2>
            <p class="text-xs text-fg-muted">Manage active MLS syndication, offers, and legal documentation in card view.</p>
          </div>
          <RouterLink to="/listings/create">
            <BaseButton size="sm" class="!rounded-xl">
              <Plus class="mr-1 h-3.5 w-3.5" />
              New Property
            </BaseButton>
          </RouterLink>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ListingCard
            v-for="item in listingStore.listings"
            :key="item.id"
            :listing="item"
            layout="card"
          />
        </div>
      </div>
    </div>
  </div>
</template>
