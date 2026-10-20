<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import Stepper from '@/components/listing/Stepper.vue'
import DynamicField from '@/components/form/DynamicField.vue'
import { useListingSteps } from '@/composables/useListingSteps'
import { useToastStore } from '@/stores/toast'
import * as listingService from '@/services/listingService'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()

const listingId = computed(() => Number(route.params.listingId || route.params.id))
const { steps, routeFor, dynamicSteps } = useListingSteps(listingId.value)

const isLoading = ref(true)
const isSaving = ref(false)
const errorMessage = ref<string | null>(null)

interface DisclosureStep {
  id: string
  name: string
  order: number
  sections: Array<{
    id: string
    name: string
    order: number
    fields: Array<any>
  }>
}

const disclosureSteps = ref<DisclosureStep[]>([])
const answers = reactive<Record<string, Record<string, any>>>({})
const errors = reactive<Record<string, string>>({})

async function loadDisclosures() {
  isLoading.value = true
  errorMessage.value = null
  try {
    const res = await listingService.fetchDisclosures(listingId.value)
    const payload = (res.data as any)?.data ?? res.data
    disclosureSteps.value = payload?.steps || []
    
    // Initialize answers from existing persisted values
    const existingAnswers = payload?.answers || {}
    for (const step of disclosureSteps.value) {
      answers[step.id] = { ...(existingAnswers[step.id] || {}) }
    }
  } catch (err: any) {
    errorMessage.value = err?.response?.data?.message || 'Failed to load disclosure requirements.'
  } finally {
    isLoading.value = false
  }
}

function handleFieldChange(stepId: string, fieldId: string, value: any) {
  if (!answers[stepId]) {
    answers[stepId] = {}
  }
  answers[stepId][fieldId] = value
  delete errors[`${stepId}_${fieldId}`]
}

function validate(): boolean {
  Object.keys(errors).forEach((key) => delete errors[key])
  let isValid = true

  for (const step of disclosureSteps.value) {
    const stepAnswers = answers[step.id] || {}
    for (const section of step.sections || []) {
      for (const field of section.fields || []) {
        if (field.required) {
          const val = stepAnswers[field.id]
          if (val === undefined || val === null || val === '') {
            errors[`${step.id}_${field.id}`] = `${field.label || field.name} is required.`
            isValid = false
          }
        }
      }
    }
  }

  return isValid
}

function handleBack() {
  const previousStep = dynamicSteps.value[dynamicSteps.value.length - 1]
  if (previousStep) {
    router.push(routeFor(previousStep.id))
  } else {
    const isAgent = route.path.startsWith('/agent')
    router.push(isAgent ? '/agent/listings' : '/listings')
  }
}

async function handleContinue() {
  if (!validate()) {
    toast.error('Please complete all required disclosure questions before continuing.')
    return
  }

  isSaving.value = true
  try {
    await listingService.saveDisclosures(listingId.value, answers)
    toast.success('Statutory property disclosures saved successfully.')
    router.push(routeFor('documents'))
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Failed to save disclosures.')
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  if (listingId.value) {
    loadDisclosures()
  }
})
</script>

<template>
  <div class="mx-auto flex w-full max-w-4xl flex-col gap-6 py-4">
    <Stepper :steps="steps" @select="(id) => router.push(routeFor(id))" />

    <PageHeader
      title="Property Condition & Statutory Disclosures"
      description="Complete and verify legally mandated property condition disclosures. Answers are recorded as official representations."
    />

    <div v-if="isLoading" class="p-8">
      <LoadingState label="Loading statutory disclosures..." />
    </div>

    <div v-else-if="errorMessage" class="p-8">
      <ErrorState :description="errorMessage" @retry="loadDisclosures" />
    </div>

    <div v-else class="space-y-6">
      <BaseCard v-for="step in disclosureSteps" :key="step.id" class="p-6">
        <div class="mb-6 flex items-center gap-3 border-b border-border pb-4">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck class="h-5 w-5" />
          </div>
          <div>
            <h2 class="text-lg font-semibold text-fg">{{ step.name }}</h2>
            <p class="text-xs text-fg-muted">Statutory compliance verification</p>
          </div>
        </div>

        <div class="space-y-8">
          <div
            v-for="section in step.sections"
            :key="section.id"
            class="space-y-4 rounded-lg bg-bg-muted/20 p-4"
          >
            <h3 class="text-sm font-semibold uppercase tracking-wider text-primary">
              {{ section.name }}
            </h3>

            <div class="grid gap-6">
              <div
                v-for="field in section.fields"
                :key="field.id"
                class="flex flex-col gap-1.5"
              >
                <DynamicField
                  :field="field"
                  :model-value="answers[step.id]?.[field.id] ?? ''"
                  :error="errors[`${step.id}_${field.id}`]"
                  @update:model-value="(val) => handleFieldChange(step.id, field.id, val)"
                />
              </div>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Footer Action Navigation -->
      <div class="flex items-center justify-between pt-4">
        <BaseButton variant="secondary" :disabled="isSaving" @click="handleBack">
          <ArrowLeft class="mr-2 h-4 w-4" />
          Back
        </BaseButton>

        <BaseButton :loading="isSaving" @click="handleContinue">
          Save Disclosures & Continue
          <ArrowRight class="ml-2 h-4 w-4" />
        </BaseButton>
      </div>
    </div>
  </div>
</template>
