<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight, CheckCircle2, AlertCircle, FileText, PenTool } from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import Alert from '@/components/ui/Alert.vue'
import Stepper from '@/components/listing/Stepper.vue'
import { useListingStore } from '@/stores/listing'
import { useWorkflowStore } from '@/stores/workflow'
import { useDocumentStore } from '@/stores/document'
import { useListingSteps } from '@/composables/useListingSteps'
import { useToastStore } from '@/stores/toast'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()
const listingId = computed(() => Number(route.params.listingId))

const listingStore = useListingStore()
const workflowStore = useWorkflowStore()
const documentStore = useDocumentStore()
const { steps, routeFor } = useListingSteps(listingId.value)

const isSubmitting = ref(false)

const statutoryDocuments = computed(() =>
  documentStore.documents.filter((d) => d.category === 'statutory' || d.isSignable),
)

const allStatutorySigned = computed(() =>
  statutoryDocuments.value.length > 0 && statutoryDocuments.value.every((d) => d.status === 'signed'),
)

const reviewSections = computed(() => [
  ...(workflowStore.workflow?.steps.map((step) => ({
    label: step.name,
    route: routeFor(step.id),
  })) ?? []),
  { label: 'Property Disclosures', route: routeFor('disclosures') },
  { label: 'Documents & Agreements', route: routeFor('documents') },
])

const lastWorkflowStep = computed(() => {
  const steps = workflowStore.workflow?.steps ?? []
  return steps[steps.length - 1]
})

const backRoute = computed(() => {
  return routeFor('documents')
})

const isSubmittedRoute = computed(
  () =>
    route.path.endsWith('/submit') ||
    listingStore.activeListing?.status === 'published' ||
    listingStore.activeListing?.status === 'submitted',
)

onMounted(() => {
  if (!workflowStore.workflow) workflowStore.fetchWorkflow(listingId.value)
  if (!listingStore.activeListing) listingStore.fetchListing(listingId.value)
  documentStore.fetchDocuments(listingId.value)
})

async function handleSubmit() {
  isSubmitting.value = true
  const success = await listingStore.submitListing(listingId.value)
  isSubmitting.value = false
  if (success) {
    toast.success('Listing submitted successfully.')
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

    <!-- Submission Confirmed State -->
    <BaseCard v-else-if="isSubmittedRoute" class="text-center p-8 space-y-4">
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
        <span class="material-symbols-outlined text-3xl">check_circle</span>
      </div>
      <h1 class="text-2xl font-semibold text-fg">Listing Submitted Successfully</h1>
      <p class="text-sm text-fg-muted max-w-md mx-auto">
        Your property listing has passed automated validation checks.
        <span v-if="listingStore.activeListing?.status === 'published'" class="font-medium text-success block mt-1">
          Status: Published to Public Property Search
        </span>
        <span v-else class="text-fg-muted block mt-1">
          Status: Under Administrative Review
        </span>
      </p>

      <div class="pt-4 flex justify-center gap-3">
        <BaseButton
          variant="primary"
          @click="router.push(route.path.startsWith('/agent') ? '/agent/listings' : '/listings')"
        >
          View All Listings
        </BaseButton>
      </div>
    </BaseCard>

    <BaseCard v-else class="space-y-6">
      <div>
        <h1 class="text-xl font-semibold text-fg">Review & Final Submission</h1>
        <p class="mt-1 text-sm text-fg-muted">
          Confirm your listing details, disclosures questionnaire, and signed statutory agreements before submitting.
        </p>
      </div>

      <!-- Listing Steps Overview -->
      <div class="rounded-xl border border-border bg-bg-muted/10 p-4">
        <h2 class="text-sm font-semibold uppercase tracking-wider text-primary mb-3">Listing Workflow Sections</h2>
        <ul class="divide-y divide-border">
          <li
            v-for="section in reviewSections"
            :key="section.label"
            class="flex items-center justify-between py-2.5"
          >
            <div class="flex items-center gap-2">
              <CheckCircle2 class="h-4 w-4 text-success" />
              <span class="text-sm font-medium text-fg">{{ section.label }}</span>
            </div>
            <RouterLink :to="section.route" class="text-xs font-semibold text-primary hover:underline">
              Review / Edit
            </RouterLink>
          </li>
        </ul>
      </div>

      <!-- Statutory Agreements & Disclosures Status (Reozom Standard) -->
      <div class="rounded-xl border border-border bg-bg-muted/10 p-4">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-primary">Statutory Documents & Signatures</h2>
          <BaseBadge :variant="allStatutorySigned ? 'success' : 'warning'">
            {{ allStatutorySigned ? 'All Documents Signed' : 'Signatures Outstanding' }}
          </BaseBadge>
        </div>

        <div v-if="statutoryDocuments.length > 0" class="divide-y divide-border">
          <div
            v-for="doc in statutoryDocuments"
            :key="doc.id"
            class="flex items-center justify-between py-2.5"
          >
            <div class="flex items-center gap-2.5">
              <FileText class="h-4 w-4 text-primary" />
              <div>
                <div class="text-xs font-semibold text-fg">{{ doc.label }}</div>
                <div v-if="doc.signedAt" class="text-[11px] text-success">
                  Signed by {{ doc.signedBy }} on {{ new Date(doc.signedAt).toLocaleDateString() }}
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <BaseBadge :variant="doc.status === 'signed' ? 'success' : 'warning'">
                {{ doc.status === 'signed' ? 'Signed' : 'Signature Required' }}
              </BaseBadge>
              <RouterLink
                v-if="doc.status !== 'signed'"
                :to="routeFor('documents')"
                class="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/20"
              >
                <PenTool class="h-3 w-3" />
                Sign Now
              </RouterLink>
            </div>
          </div>
        </div>
        <div v-else class="text-xs text-fg-muted py-2">
          Statutory documents will be generated upon saving disclosures in the Disclosures step.
        </div>
      </div>

      <Alert v-if="!allStatutorySigned" variant="warning">
        <p class="font-medium text-xs">
          Notice: State and federal law require statutory listing agreements and disclosures to be electronically signed prior to MLS syndication.
        </p>
      </Alert>
      <Alert v-else variant="success">
        <p class="font-medium text-xs">
          All required listing specifications, statutory property condition disclosures, and listing agreements are verified and signed.
        </p>
      </Alert>

      <template #footer>
        <div class="flex items-center justify-between">
          <RouterLink :to="backRoute">
            <BaseButton variant="secondary">Back to Documents</BaseButton>
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
