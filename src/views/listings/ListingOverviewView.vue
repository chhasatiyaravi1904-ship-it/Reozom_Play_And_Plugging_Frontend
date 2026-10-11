<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight, CheckCircle } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import Stepper from '@/components/listing/Stepper.vue'
import ListingImageManager from '@/components/listing/ListingImageManager.vue'
import { useListingStore } from '@/stores/listing'
import { useWorkflowStore } from '@/stores/workflow'
import { useListingSteps } from '@/composables/useListingSteps'

const route = useRoute()
const router = useRouter()
const listingId = Number(route.params.listingId)

const listingStore = useListingStore()
const workflowStore = useWorkflowStore()
const { steps, routeFor } = useListingSteps(listingId)

const isSubmitted = computed(() => listingStore.activeListing?.status === 'submitted')

const currentStep = computed(
  () => steps.value.find((s) => s.status === 'current') ?? steps.value[0],
)

onMounted(async () => {
  await Promise.all([listingStore.fetchListing(listingId), workflowStore.fetchWorkflow(listingId)])
})

function continueListing() {
  if (isSubmitted.value) {
    // For submitted listings, navigate to review/overview
    router.push(routeFor('review'))
  } else if (currentStep.value) {
    router.push(routeFor(currentStep.value.id))
  }
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-4xl flex-col gap-6">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-fg">
          {{ listingStore.activeListing?.address.address || 'Your Listing' }}
        </h1>
        <p class="text-sm text-fg-muted" v-if="listingStore.activeListing">
          {{ listingStore.activeListing.address.city }},
          {{ listingStore.activeListing.address.state }}
          {{ listingStore.activeListing.address.zip }}
        </p>
      </div>
      <div
        v-if="isSubmitted"
        class="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700"
      >
        <CheckCircle class="h-4 w-4" />
        Submitted
      </div>
    </div>

    <LoadingState
      v-if="listingStore.status === 'loading' || workflowStore.status === 'loading'"
      :rows="2"
    />

    <ErrorState
      v-else-if="listingStore.status === 'error' || workflowStore.status === 'error'"
      :description="listingStore.error || workflowStore.error || undefined"
    >
      <template #action>
        <BaseButton
          size="sm"
          @click="
            () => {
              listingStore.fetchListing(listingId)
              workflowStore.fetchWorkflow(listingId)
            }
          "
        >
          Try Again
        </BaseButton>
      </template>
    </ErrorState>

    <template v-else>
      <Stepper :steps="steps" @select="(id) => router.push(routeFor(id))" />

      <div
        class="flex items-center justify-between rounded-xl border border-border bg-surface p-4"
      >
        <p class="text-sm text-fg-muted">
          <template v-if="isSubmitted">
            Listing submitted — awaiting review
          </template>
          <template v-else>
            {{ listingStore.activeListing?.stepsCompleted || 0 }} of {{ steps.length }} steps
            completed
          </template>
        </p>
        <BaseButton
          :variant="isSubmitted ? 'secondary' : 'primary'"
          @click="continueListing"
        >
          {{ isSubmitted ? 'Review Submission' : 'Continue Your Listing' }}
          <ArrowRight class="ml-1.5 h-4 w-4" />
        </BaseButton>
      </div>

      <ListingImageManager :listing-id="listingId" />
    </template>
  </div>
</template>
