<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Layers,
  Info,
  AlertCircle,
} from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import Stepper from '@/components/listing/Stepper.vue'
import DynamicField from '@/components/form/DynamicField.vue'
import { useListingSteps } from '@/composables/useListingSteps'
import { useToastStore } from '@/stores/toast'
import * as listingService from '@/services/listingService'
import type { AvailableDisclosure } from '@/services/listingService'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()

const listingId = computed(() => Number(route.params.listingId || route.params.id))
const { steps, routeFor, dynamicSteps } = useListingSteps(listingId.value)

const isLoading = ref(true)
const isSaving = ref(false)
const isUpdatingSelection = ref(false)
const errorMessage = ref<string | null>(null)

interface DisclosureStep {
  id: string
  name: string
  order: number
  description?: string
  sections: Array<{
    id: string
    name: string
    order: number
    fields: Array<any>
  }>
}

const availableDisclosures = ref<AvailableDisclosure[]>([])
const selectedCodes = ref<string[]>([])
const disclosureSteps = ref<DisclosureStep[]>([])
const answers = reactive<Record<string, Record<string, any>>>({})
const errors = reactive<Record<string, string>>({})

const totalQuestionsCount = computed(() => {
  let count = 0
  for (const step of disclosureSteps.value) {
    for (const section of step.sections || []) {
      count += (section.fields || []).length
    }
  }
  return count
})

async function loadDisclosures() {
  isLoading.value = true
  errorMessage.value = null
  try {
    const res = await listingService.fetchDisclosures(listingId.value)
    const payload = (res.data as any)?.data ?? res.data

    availableDisclosures.value = payload?.availableDisclosures || []
    selectedCodes.value = payload?.selectedDisclosures || []
    disclosureSteps.value = payload?.steps || []

    // Initialize answers from existing persisted values
    const existingAnswers = payload?.answers || {}
    for (const step of disclosureSteps.value) {
      answers[step.id] = { ...(existingAnswers[step.id] || {}) }
    }

    // Ensure selectedCodes is populated if steps exist
    if (selectedCodes.value.length === 0 && disclosureSteps.value.length > 0) {
      selectedCodes.value = disclosureSteps.value.map((s) => s.id)
    }
  } catch (err: any) {
    errorMessage.value = err?.response?.data?.message || 'Failed to load disclosure requirements.'
  } finally {
    isLoading.value = false
  }
}

function handleAutoFillAll() {
  for (const step of disclosureSteps.value) {
    if (!answers[step.id]) answers[step.id] = {}
    for (const section of step.sections || []) {
      for (const field of section.fields || []) {
        const type = field.fieldType || field.type || 'text'
        if (type === 'select' || type === 'radio') {
          const opts = field.options || []
          const safeOpt = opts.find((o: any) =>
            ['no', 'working', 'unknown', 'none', 'good', 'municipal'].includes(
              String(o.value).toLowerCase(),
            ),
          )
          answers[step.id][field.id] = safeOpt ? safeOpt.value : (opts[0]?.value ?? 'yes')
        } else if (type === 'checkbox') {
          answers[step.id][field.id] = true
        } else if (type === 'number') {
          answers[step.id][field.id] = 2018
        } else {
          answers[step.id][field.id] = 'In good working condition. No known adverse defects.'
        }
        delete errors[`${step.id}_${field.id}`]
      }
    }
  }
  toast.success('All disclosure questions auto-completed with standard representations.')
}

async function handleToggleDisclosure(disclosure: AvailableDisclosure) {
  const code = disclosure.code
  const isCurrentlySelected = selectedCodes.value.includes(code)

  if (isCurrentlySelected && disclosure.is_mandatory) {
    toast.info('This disclosure is legally required by state statute or by your listing process package.')
  }

  const updatedCodes = isCurrentlySelected
    ? selectedCodes.value.filter((c) => c !== code)
    : [...selectedCodes.value, code]

  if (updatedCodes.length === 0) {
    toast.error('At least one disclosure document must remain selected.')
    return
  }

  isUpdatingSelection.value = true
  try {
    const res = await listingService.selectDisclosures(listingId.value, updatedCodes)
    const payload = (res.data as any)?.data ?? res.data

    selectedCodes.value = payload?.selectedDisclosures || updatedCodes
    disclosureSteps.value = payload?.steps || []
    availableDisclosures.value = payload?.availableDisclosures || availableDisclosures.value

    // Re-verify answers mapping for newly included steps
    for (const step of disclosureSteps.value) {
      if (!answers[step.id]) {
        answers[step.id] = {}
      }
    }

    toast.success(
      isCurrentlySelected
        ? `Removed "${disclosure.title}" from required documents.`
        : `Added "${disclosure.title}" to required documents.`
    )
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Failed to update disclosure selection.')
  } finally {
    isUpdatingSelection.value = false
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
  let firstErrorId: string | null = null

  for (const step of disclosureSteps.value) {
    const stepAnswers = answers[step.id] || {}
    for (const section of step.sections || []) {
      for (const field of section.fields || []) {
        if (field.required) {
          const val = stepAnswers[field.id]
          const isEmpty =
            val === undefined ||
            val === null ||
            val === '' ||
            (Array.isArray(val) && val.length === 0)

          if (isEmpty) {
            const errKey = `${step.id}_${field.id}`
            errors[errKey] = `${field.label || field.name} is required.`
            if (!firstErrorId) {
              firstErrorId = errKey
            }
            isValid = false
          }
        }
      }
    }
  }

  if (firstErrorId) {
    const el = document.getElementById(firstErrorId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
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

  const codesToSave = selectedCodes.value.length > 0
    ? selectedCodes.value
    : disclosureSteps.value.map((s) => s.id)

  isSaving.value = true
  try {
    await listingService.saveDisclosures(listingId.value, answers, codesToSave)
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

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <PageHeader
        title="Property Condition & Statutory Disclosures"
        description="Select and complete the required statutory property condition disclosures. Answers are recorded as official representations and generate legal listing documents."
      />
      <BaseButton
        size="sm"
        variant="secondary"
        class="shrink-0 text-xs self-start sm:self-auto font-medium"
        title="Quickly fill all questions with standard representations"
        @click="handleAutoFillAll"
      >
        <CheckCircle2 class="mr-1.5 h-3.5 w-3.5 text-primary" />
        Fill All Questions
      </BaseButton>
    </div>

    <div v-if="isLoading" class="p-8">
      <LoadingState label="Loading listing process disclosures..." />
    </div>

    <div v-else-if="errorMessage" class="p-8">
      <ErrorState :description="errorMessage" @retry="loadDisclosures" />
    </div>

    <div v-else class="space-y-6">
      <!-- 1. Required Disclosure Documents Selection Panel -->
      <BaseCard class="border-2 border-primary/20 bg-gradient-to-br from-surface to-primary/5 p-6 shadow-sm">
        <div class="mb-4 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div class="flex items-center gap-2.5">
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Layers class="h-5 w-5" />
            </div>
            <div>
              <h2 class="text-base font-bold text-fg">Required Disclosure Documents Selection</h2>
              <p class="text-xs text-fg-muted">
                Choose which disclosure forms apply to this property. Forms required by law or your listing process are pre-selected.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 self-start md:self-auto">
            <span class="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <CheckCircle2 class="h-3.5 w-3.5" />
              {{ selectedCodes.length }} of {{ availableDisclosures.length }} Selected
            </span>
          </div>
        </div>

        <!-- Disclosure Selection Grid -->
        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <div
            v-for="d in availableDisclosures"
            :key="d.code"
            class="group relative flex cursor-pointer flex-col justify-between rounded-xl border p-4 transition-all"
            :class="[
              selectedCodes.includes(d.code)
                ? 'border-primary bg-surface shadow-xs ring-1 ring-primary/30'
                : 'border-border/60 bg-surface/50 opacity-75 hover:border-border hover:opacity-100',
              isUpdatingSelection ? 'pointer-events-none' : ''
            ]"
            @click="handleToggleDisclosure(d)"
          >
            <div>
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-2">
                  <div
                    class="flex h-5 w-5 items-center justify-center rounded border transition-colors"
                    :class="selectedCodes.includes(d.code) ? 'border-primary bg-primary text-white' : 'border-border bg-white'"
                  >
                    <CheckCircle2 v-if="selectedCodes.includes(d.code)" class="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                  <span class="text-sm font-semibold text-fg">{{ d.title }}</span>
                </div>

                <div class="flex items-center gap-1 shrink-0">
                  <BaseBadge
                    v-if="d.is_mandatory"
                    variant="primary"
                    size="sm"
                    class="text-[10px] uppercase font-bold"
                  >
                    <Lock class="mr-1 h-2.5 w-2.5" />
                    Mandatory
                  </BaseBadge>
                  <BaseBadge
                    v-else
                    variant="neutral"
                    size="sm"
                    class="text-[10px] font-medium"
                  >
                    Optional
                  </BaseBadge>
                </div>
              </div>

              <p class="mt-2 text-xs leading-relaxed text-fg-muted line-clamp-2">
                {{ d.description || 'Statutory representations regarding property fixtures, defects, and environmental condition.' }}
              </p>
            </div>

            <div class="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-fg-muted">
              <span>{{ d.questions_count }} Questions</span>
              <span v-if="d.state_code" class="font-mono uppercase font-semibold text-primary">State: {{ d.state_code }}</span>
              <span v-else class="font-mono text-fg-muted">Federal / All</span>
            </div>
          </div>
        </div>

        <div class="mt-4 flex items-center justify-between rounded-lg bg-surface/80 p-3 text-xs text-fg-muted border border-border/50">
          <div class="flex items-center gap-2">
            <Info class="h-4 w-4 text-primary shrink-0" />
            <span>Unchecking an optional disclosure removes its questions from the questionnaire and excludes it from required closing documents.</span>
          </div>
          <span class="font-semibold text-fg shrink-0">{{ totalQuestionsCount }} Questions Total</span>
        </div>
      </BaseCard>

      <!-- 2. Questionnaires for Selected Disclosures -->
      <div v-if="disclosureSteps.length === 0" class="rounded-xl border border-dashed border-border p-12 text-center">
        <AlertCircle class="mx-auto h-8 w-8 text-fg-muted" />
        <h3 class="mt-3 text-base font-semibold text-fg">No Disclosures Selected</h3>
        <p class="mt-1 text-xs text-fg-muted">Please select at least one disclosure document from the panel above to complete the required questions.</p>
      </div>

      <BaseCard
        v-for="step in disclosureSteps"
        :key="step.id"
        class="p-6 transition-all"
      >
        <div class="mb-6 flex items-center gap-3 border-b border-border pb-4">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck class="h-5 w-5" />
          </div>
          <div>
            <h2 class="text-lg font-semibold text-fg">{{ step.name }}</h2>
            <p class="text-xs text-fg-muted">{{ step.description || 'Statutory compliance verification representation' }}</p>
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
                :id="`${step.id}_${field.id}`"
                class="flex flex-col gap-1.5 transition-all rounded-lg p-1"
                :class="errors[`${step.id}_${field.id}`] ? 'bg-danger/5 ring-1 ring-danger' : ''"
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

        <BaseButton
          variant="primary"
          size="md"
          class="font-semibold px-6 shadow-sm"
          :loading="isSaving"
          :disabled="isSaving"
          @click="handleContinue"
        >
          Save Disclosures & Continue
          <ArrowRight class="ml-2 h-4 w-4" />
        </BaseButton>
      </div>
    </div>
  </div>
</template>
