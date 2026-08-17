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
import { useListingSteps } from '@/composables/useListingSteps'
import { useAutoSave } from '@/composables/useAutoSave'
import type { FieldValue } from '@/types/field'

const route = useRoute()
const router = useRouter()
const listingId = computed(() => Number(route.params.listingId))
const stepId = computed(() => String(route.params.stepId))

const workflowStore = useWorkflowStore()
const { steps, routeFor } = useListingSteps(listingId.value)

const errors = reactive<Record<string, string>>({})

const currentStep = computed(() => workflowStore.workflow?.steps.find((s) => s.id === stepId.value))

const { state: saveState, schedule } = useAutoSave(() =>
  workflowStore.saveStep(listingId.value, stepId.value),
)

onMounted(() => {
  if (!workflowStore.workflow) workflowStore.fetchWorkflow(listingId.value)
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
  const index = steps.value.findIndex((s) => s.id === stepId.value)
  const previous = steps.value[index - 1]
  if (index > 0 && previous) router.push(routeFor(previous.id))
}

async function handleContinue() {
  if (!validate()) return
  await workflowStore.saveStep(listingId.value, stepId.value)
  const index = steps.value.findIndex((s) => s.id === stepId.value)
  const next = steps.value[index + 1]
  if (next) router.push(routeFor(next.id))
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-4xl flex-col gap-6">
    <Stepper :steps="steps" @select="(id) => router.push(routeFor(id))" />

    <LoadingState v-if="workflowStore.status === 'loading'" :rows="4" label="Loading workflow" />

    <ErrorState
      v-else-if="workflowStore.status === 'error'"
      :description="workflowStore.error || undefined"
    >
      <template #action>
        <BaseButton size="sm" @click="workflowStore.fetchWorkflow(listingId)">Try Again</BaseButton>
      </template>
    </ErrorState>

    <BaseCard v-else-if="currentStep">
      <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 class="text-xl font-semibold text-fg">{{ currentStep.name }}</h1>
          <p v-if="currentStep.description" class="mt-1 text-sm text-fg-muted">
            {{ currentStep.description }}
          </p>
        </div>
        <span class="flex shrink-0 items-center gap-1 text-xs text-fg-muted">
          <span v-if="saveState === 'saving'">Saving…</span>
          <span v-else-if="saveState === 'saved'" class="flex items-center gap-1">
            <Check class="h-3.5 w-3.5 text-success" />
            Saved just now
          </span>
        </span>
      </div>

      <DynamicWorkflow
        :step="currentStep"
        :values="workflowStore.values"
        :errors="errors"
        @update:field="handleFieldUpdate"
      />

      <template #footer>
        <div class="flex items-center justify-between">
          <BaseButton variant="secondary" @click="handleBack">Back</BaseButton>
          <BaseButton @click="handleContinue">
            Save & Continue
            <ArrowRight class="ml-1.5 h-4 w-4" />
          </BaseButton>
        </div>
      </template>
    </BaseCard>
  </div>
</template>
