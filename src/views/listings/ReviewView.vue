<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight } from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import Alert from '@/components/ui/Alert.vue'
import Stepper from '@/components/listing/Stepper.vue'
import { useListingStore } from '@/stores/listing'
import { useWorkflowStore } from '@/stores/workflow'
import { useListingSteps } from '@/composables/useListingSteps'
import { useToastStore } from '@/stores/toast'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()
const listingId = computed(() => Number(route.params.listingId))

const listingStore = useListingStore()
const workflowStore = useWorkflowStore()
const { steps, routeFor } = useListingSteps(listingId.value)

const isSubmitting = ref(false)

const reviewSections = computed(() => [
  ...(workflowStore.workflow?.steps.map((step) => ({
    label: step.name,
    route: routeFor(step.id),
  })) ?? []),
  { label: 'Disclosures', route: routeFor('disclosures') },
  { label: 'Documents', route: routeFor('documents') },
])

onMounted(() => {
  if (!workflowStore.workflow) workflowStore.fetchWorkflow(listingId.value)
  if (!listingStore.activeListing) listingStore.fetchListing(listingId.value)
})

async function handleSubmit() {
  isSubmitting.value = true
  const success = await listingStore.submitListing(listingId.value)
  isSubmitting.value = false
  if (success) {
    const basePath = route.path.startsWith('/agent') ? '/agent' : ''
    router.push(`${basePath}/listings/${listingId.value}/submit`)
  } else {
    toast.error('Unable to submit your listing. Please try again.')
  }
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-4xl flex-col gap-6">
    <Stepper :steps="steps" @select="(id) => router.push(routeFor(id))" />

    <LoadingState v-if="workflowStore.status === 'loading'" :rows="4" label="Loading review" />

    <ErrorState
      v-else-if="workflowStore.status === 'error'"
      :description="workflowStore.error || undefined"
    >
      <template #action>
        <BaseButton size="sm" @click="workflowStore.fetchWorkflow(listingId)">Try Again</BaseButton>
      </template>
    </ErrorState>

    <BaseCard v-else>
      <h1 class="text-xl font-semibold text-fg">Review & Summary</h1>
      <p class="mt-1 mb-6 text-sm text-fg-muted">
        Confirm everything looks right before you submit your listing.
      </p>

      <ul class="divide-y divide-border border-y border-border">
        <li
          v-for="section in reviewSections"
          :key="section.label"
          class="flex items-center justify-between py-3"
        >
          <span class="text-sm font-medium text-fg">{{ section.label }}</span>
          <RouterLink :to="section.route" class="text-sm font-medium text-primary hover:underline">
            Edit
          </RouterLink>
        </li>
      </ul>

      <Alert variant="success" class="mt-6">
        <p>All required information completed</p>
        <p>Required documents uploaded</p>
        <p>Disclosure questions completed</p>
      </Alert>

      <template #footer>
        <div class="flex items-center justify-between">
          <RouterLink :to="routeFor('documents')">
            <BaseButton variant="secondary">Back</BaseButton>
          </RouterLink>
          <BaseButton :loading="isSubmitting" @click="handleSubmit">
            Submit Listing
            <ArrowRight class="ml-1.5 h-4 w-4" />
          </BaseButton>
        </div>
      </template>
    </BaseCard>
  </div>
</template>
