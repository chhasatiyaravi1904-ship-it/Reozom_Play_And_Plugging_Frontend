<script setup lang="ts">
import { computed, onMounted, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight, Check } from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import Stepper from '@/components/listing/Stepper.vue'
import DynamicWorkflow from '@/components/listing/DynamicWorkflow.vue'
import { useWorkflowStore } from '@/stores/workflow'
import { useListingStore } from '@/stores/listing'
import { useListingSteps } from '@/composables/useListingSteps'
import { useAutoSave } from '@/composables/useAutoSave'
import type { FieldValue } from '@/types/field'

const route = useRoute()
const router = useRouter()
const listingId = computed(() => Number(route.params.listingId))
const stepId = computed(() => String(route.params.stepId))

const workflowStore = useWorkflowStore()
const listingStore = useListingStore()
const { steps, routeFor, dynamicSteps } = useListingSteps(listingId.value)

const errors = reactive<Record<string, string>>({})

const currentStep = computed(() => workflowStore.workflow?.steps.find((s) => s.id === stepId.value))

const { state: saveState, schedule } = useAutoSave(() =>
  workflowStore.saveStep(listingId.value, stepId.value),
)

onMounted(() => {
  if (!workflowStore.workflow) workflowStore.fetchWorkflow(listingId.value)
  if (!listingStore.activeListing) listingStore.fetchListing(listingId.value)
})

const isLastDynamicStep = computed(() => {
  const index = dynamicSteps.value.findIndex((s) => s.id === stepId.value)
  return index === dynamicSteps.value.length - 1
})

watch(stepId, () => {
  Object.keys(errors).forEach((key) => delete errors[key])
})

function handleFieldUpdate(fieldId: string, value: FieldValue) {
  workflowStore.setValue(fieldId, value)
  delete errors[fieldId]
  schedule()
}

function validate(): boolean {
  Object.keys(errors).forEach((key) => delete errors[key])
  if (!currentStep.value) return false
  for (const section of currentStep.value.sections) {
    for (const field of section.fields) {
      if (field.required && !workflowStore.values[field.id]) {
        errors[field.id] = `${field.label} is required.`
      }
    }
  }
  return Object.keys(errors).length === 0
}

async function handleBack() {
  const index = dynamicSteps.value.findIndex((s) => s.id === stepId.value)
  const previous = dynamicSteps.value[index - 1]
  if (index > 0 && previous) router.push(routeFor(previous.id))
}

async function handleContinue() {
  if (!validate()) return
  await workflowStore.saveStep(listingId.value, stepId.value)
  const index = dynamicSteps.value.findIndex((s) => s.id === stepId.value)
  const next = dynamicSteps.value[index + 1]
  if (next) {
    router.push(routeFor(next.id))
  } else {
    // All dynamic steps done — proceed to review
    router.push(routeFor('review'))
  }
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-[1000px] flex-col gap-6 py-6 md:py-10">
    
    <!-- Page Header -->
    <div class="mb-4">
      <a href="#" @click.prevent="router.push('/listings')" class="text-secondary text-label-sm font-label-sm hover:underline mb-8 inline-flex items-center gap-1">
        <span class="material-symbols-outlined text-[16px]">arrow_back</span>
        Back to Dashboard
      </a>
      <div class="flex items-end justify-between">
        <div>
          <span class="text-outline-variant font-label-sm text-label-sm uppercase tracking-wider mb-2 block">Create Your Listing</span>
          <h1 class="text-headline-md font-headline-md text-primary">{{ currentStep?.name || 'Loading...' }}</h1>
        </div>
        <div class="text-right">
          <span class="text-primary font-label-md text-label-md block">Step {{ dynamicSteps.findIndex(s => s.id === stepId) + 1 }} of {{ dynamicSteps.length }}</span>
        </div>
      </div>
    </div>

    <Stepper :steps="steps" @select="(id) => router.push(routeFor(id))" />

    <LoadingState v-if="workflowStore.status === 'loading'" :rows="4" label="Loading listing process..." />

    <ErrorState
      v-else-if="workflowStore.status === 'error'"
      :description="workflowStore.error || undefined"
    >
      <template #action>
        <button class="px-6 py-3 bg-secondary text-surface-container-lowest rounded-lg font-label-lg" @click="workflowStore.fetchWorkflow(listingId)">Try Again</button>
      </template>
    </ErrorState>

    <div v-else-if="currentStep" class="bg-surface-container-lowest shadow-sm border border-outline-variant/40 rounded-2xl p-6 md:p-10">
      <div class="mb-10 pb-6 border-b border-outline-variant/30 flex items-start justify-between gap-4">
        <div>
          <h2 class="text-headline-sm font-headline-sm text-primary">{{ currentStep.name }}</h2>
          <p v-if="currentStep.description" class="mt-2 text-body-lg font-body-lg text-on-surface-variant">
            {{ currentStep.description }}
          </p>
        </div>
        <span class="flex shrink-0 items-center gap-1.5 text-xs text-secondary bg-surface-container py-1.5 px-3 rounded-full">
          <span v-if="saveState === 'saving'" class="font-medium">Saving...</span>
          <span v-else-if="saveState === 'saved'" class="flex items-center gap-1 font-medium">
            <span class="material-symbols-outlined text-[14px]">check_circle</span>
            Saved
          </span>
        </span>
      </div>

      <DynamicWorkflow
        :step="currentStep"
        :values="workflowStore.values"
        :errors="errors"
        @update:field="handleFieldUpdate"
      />

      <div class="mt-12 pt-6 border-t border-outline-variant/30 flex items-center justify-between">
        <button 
          @click="handleBack" 
          class="px-6 h-12 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors font-label-lg text-label-lg"
          :class="dynamicSteps.findIndex((s) => s.id === stepId) === 0 ? 'invisible' : ''"
        >
          ← Back
        </button>
        <button 
          @click="handleContinue" 
          class="px-8 h-12 rounded-lg bg-secondary hover:bg-on-secondary-container text-surface-container-lowest transition-colors font-label-lg text-label-lg font-bold flex items-center gap-2 shadow-sm"
        >
          {{ isLastDynamicStep ? 'Review Listing' : 'Save & Continue' }}
          <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>
  </div>
</template>
