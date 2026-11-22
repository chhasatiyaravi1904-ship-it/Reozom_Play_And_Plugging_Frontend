<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight, Check } from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import Stepper from '@/components/listing/Stepper.vue'
import DynamicWorkflow from '@/components/listing/DynamicWorkflow.vue'
import MapPicker from '@/components/listing/MapPicker.vue'
import ListingImageManager from '@/components/listing/ListingImageManager.vue'
import { conditionMatches } from '@/utils/conditions'
import { useWorkflowStore } from '@/stores/workflow'
import { useListingStore } from '@/stores/listing'
import { useListingSteps } from '@/composables/useListingSteps'
import { useAutoSave } from '@/composables/useAutoSave'
import type { FieldValue } from '@/types/field'
import * as paymentService from '@/services/paymentService'
import { useToastStore } from '@/stores/toast'

const route = useRoute()
const router = useRouter()
const listingId = computed(() => Number(route.params.listingId))
const stepId = computed(() => String(route.params.stepId))

const workflowStore = useWorkflowStore()
const listingStore = useListingStore()
const toast = useToastStore()
const { steps, routeFor, dynamicSteps } = useListingSteps(listingId.value)

const errors = reactive<Record<string, string>>({})
const formError = ref<string>('')
const isSaving = ref<boolean>(false)

const currentStep = computed(() => workflowStore.workflow?.steps.find((s) => s.id === stepId.value))

// "Pictures & Virtual Tours": photos are uploaded straight to the listing by ListingImageManager,
// so the step's file field is replaced by the uploader and at least one saved photo is required.
const MEDIA_IMAGES_FIELD = 'property_images'
const isMediaStep = computed(() => currentStep.value?.kind === 'media')
const imageCount = ref(0)
const mediaFormStep = computed(() => {
  if (!currentStep.value) return currentStep.value
  return {
    ...currentStep.value,
    sections: currentStep.value.sections.map((section) => ({
      ...section,
      fields: section.fields.filter((field) => field.id !== MEDIA_IMAGES_FIELD),
    })),
  }
})

function handleImageCount(count: number) {
  imageCount.value = count
  if (count > 0) delete errors[MEDIA_IMAGES_FIELD]
}

const { state: saveState, schedule } = useAutoSave(() =>
  workflowStore.saveStep(listingId.value, stepId.value),
)

onMounted(() => {
  if (!workflowStore.workflow) workflowStore.fetchWorkflow(listingId.value)
  if (!listingStore.activeListing) listingStore.fetchListing(listingId.value)
})

// Address typed in the "Property Type & Address" step, falling back to the listing record
const mapAddress = computed(() => {
  const v = workflowStore.values
  const a = listingStore.activeListing?.address
  return [v.street_address ?? a?.address, v.city ?? a?.city, v.state ?? a?.state, v.zip ?? a?.zip]
    .filter((part) => part !== undefined && part !== null && String(part).trim() !== '')
    .join(', ')
})

function handleMapUpdate(latitude: string, longitude: string) {
  handleFieldUpdate('latitude', latitude)
  handleFieldUpdate('longitude', longitude)
}

const packagePriceText = computed(() => {
  const price = listingStore.activeListing?.packagePrice
  if (price === null || price === undefined) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
})

// --- Payment step (Stripe Checkout) ---
const paymentStatus = ref<paymentService.ListingPaymentStatus | null>(null)
const isLoadingPayment = ref(false)
const isStartingPayment = ref(false)
const paymentBlocked = computed(
  () => currentStep.value?.kind === 'payment' && !!paymentStatus.value?.required && !paymentStatus.value?.paid,
)

async function loadPaymentStatus() {
  if (currentStep.value?.kind !== 'payment' || !listingId.value) return
  isLoadingPayment.value = true
  try {
    paymentStatus.value = await paymentService.fetchListingPaymentStatus(listingId.value)
  } catch {
    paymentStatus.value = null
  } finally {
    isLoadingPayment.value = false
  }
}

watch(() => [currentStep.value?.kind, listingId.value], loadPaymentStatus, { immediate: true })

async function handlePay() {
  isStartingPayment.value = true
  formError.value = ''
  try {
    // Save the step first so nothing typed is lost while the seller is on Stripe
    await workflowStore.saveStep(listingId.value, stepId.value)
    const checkout = await paymentService.startListingCheckout(listingId.value)
    paymentService.redirectToCheckout(checkout.checkout_url)
  } catch (err: any) {
    formError.value = err?.response?.data?.message || err?.message || 'Could not start the payment.'
    isStartingPayment.value = false
  }
}

const isLastDynamicStep = computed(() => {
  const index = dynamicSteps.value.findIndex((s) => s.id === stepId.value)
  return index === dynamicSteps.value.length - 1
})

// A paid service package publishes the listing when the payment is confirmed, so the last step
// needs no "Submit Listing" button then (it stays for free packages)
const isListingPublished = computed(() => listingStore.activeListing?.status === 'published')
const paymentPublishes = computed(
  () => currentStep.value?.kind === 'payment' && isLastDynamicStep.value && !!paymentStatus.value?.required,
)
const listingOverviewPath = computed(
  () => `${route.path.startsWith('/agent') ? '/agent' : ''}/listings/${listingId.value}`,
)

watch(stepId, () => {
  Object.keys(errors).forEach((key) => delete errors[key])
  formError.value = ''
})

function handleFieldUpdate(fieldId: string, value: FieldValue) {
  workflowStore.setValue(fieldId, value)
  delete errors[fieldId]
  if (Object.keys(errors).length === 0) {
    formError.value = ''
  }
  schedule()
}

function isFieldVisible(field: any, section: any): boolean {
  return conditionMatches(section?.showIf, workflowStore.values) && conditionMatches(field?.showIf, workflowStore.values)
}

function validate(): boolean {
  Object.keys(errors).forEach((key) => delete errors[key])
  formError.value = ''
  if (!currentStep.value) return false

  for (const section of currentStep.value.sections) {
    for (const field of section.fields) {
      if (!isFieldVisible(field, section)) continue
      if (isMediaStep.value && field.id === MEDIA_IMAGES_FIELD) continue

      const val = workflowStore.values[field.id]
      const isEmpty = val === undefined || val === null || (typeof val === 'string' && val.trim() === '')
      if (field.required && isEmpty) {
        errors[field.id] = `${field.label} is required.`
      }
    }
  }

  if (isMediaStep.value && imageCount.value === 0) {
    errors[MEDIA_IMAGES_FIELD] = 'Please upload at least one property photo.'
  }

  const hasErrors = Object.keys(errors).length > 0
  if (hasErrors) {
    const count = Object.keys(errors).length
    const firstKey = Object.keys(errors)[0]
    formError.value = `Please complete all required fields (${count} remaining) before continuing.`

    setTimeout(() => {
      const el = document.getElementById(firstKey) || 
                 document.querySelector(`[name="${firstKey}"]`) ||
                 document.querySelector(`label[for="${firstKey}"]`) ||
                 document.querySelector('.border-error')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 80)
  }

  return !hasErrors
}

async function handleBack() {
  const index = dynamicSteps.value.findIndex((s) => s.id === stepId.value)
  const previous = dynamicSteps.value[index - 1]
  if (index > 0 && previous) router.push(routeFor(previous.id))
}

async function handleContinue() {
  if (!validate()) return

  if (paymentBlocked.value) {
    formError.value = 'Please complete the payment for your service package before continuing.'
    return
  }

  isSaving.value = true
  formError.value = ''

  try {
    // Record how many photos the listing has (the photos themselves are already saved)
    if (isMediaStep.value) workflowStore.setValue(MEDIA_IMAGES_FIELD, imageCount.value)

    const saved = await workflowStore.saveStep(listingId.value, stepId.value)
    if (!saved) {
      formError.value = workflowStore.error || 'Unable to save step. Please check your connection and try again.'
      return
    }

    const index = dynamicSteps.value.findIndex((s) => s.id === stepId.value)
    const next = dynamicSteps.value[index + 1]
    if (next) {
      router.push(routeFor(next.id))
      return
    }

    // Last process step: submit the listing
    const submitted = await listingStore.submitListing(listingId.value)
    if (!submitted) {
      formError.value = listingStore.error || 'Unable to submit your listing. Please try again.'
      return
    }
    toast.success('Listing submitted successfully.')
    const basePath = route.path.startsWith('/agent') ? '/agent' : ''
    router.push(`${basePath}/listings/${listingId.value}/submit`)
  } catch (err: any) {
    formError.value = err?.response?.data?.message || err?.message || 'Failed to save step.'
  } finally {
    isSaving.value = false
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
          <h1 v-if="currentStep?.name" class="text-headline-md font-headline-md text-primary">{{ currentStep.name }}</h1>
          <div v-else class="skeleton h-8 w-64 max-w-full rounded" role="status" aria-label="Loading step"></div>
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

      <!-- Form Validation or Save Error Banner -->
      <div v-if="formError" class="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
        <span class="material-symbols-outlined text-red-600 shrink-0 mt-0.5">error</span>
        <div class="text-sm">
          <div class="font-bold">Required Fields Incomplete</div>
          <div>{{ formError }}</div>
        </div>
      </div>

      <!-- Payment step: pay the service package with Stripe Checkout -->
      <div v-if="currentStep.kind === 'payment'" class="space-y-4">
        <div class="rounded-xl border border-outline-variant/40 p-5 flex items-center justify-between gap-4">
          <div>
            <div class="text-label-sm font-label-sm uppercase tracking-wider text-outline-variant">Service Package</div>
            <div class="text-headline-sm font-headline-sm text-primary mt-1">
              {{ paymentStatus?.package?.name || listingStore.activeListing?.packageName || 'Selected package' }}
            </div>
          </div>
          <div class="text-right">
            <div class="text-label-sm font-label-sm uppercase tracking-wider text-outline-variant">Price</div>
            <div class="text-headline-sm font-headline-sm text-primary mt-1">
              {{ paymentStatus ? (paymentStatus.required ? paymentService.formatMoney(paymentStatus.amount, paymentStatus.currency) : 'Free') : packagePriceText }}
            </div>
          </div>
        </div>

        <p v-if="isLoadingPayment" class="text-body-md font-body-md text-on-surface-variant">Checking payment status…</p>

        <div
          v-else-if="paymentStatus?.required && paymentStatus.paid"
          class="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800"
        >
          <span class="material-symbols-outlined text-green-600">check_circle</span>
          <div class="text-sm font-medium flex-1">
            {{ isListingPublished ? 'Paid. Your listing is published.' : 'Paid. Your listing will be published shortly.' }}
          </div>
          <button
            type="button"
            class="text-sm font-bold underline hover:no-underline"
            @click="router.push(`${listingOverviewPath}/documents`)"
          >
            Sign documents
          </button>
          <button
            type="button"
            class="text-sm font-bold underline hover:no-underline"
            @click="router.push(listingOverviewPath)"
          >
            View listing
          </button>
        </div>

        <div v-else-if="paymentStatus?.required" class="space-y-3">
          <p class="text-body-md font-body-md text-on-surface-variant">
            Pay for your service package to publish your listing. You'll pay on Stripe's secure page, and your listing is published as soon as the payment is confirmed.
          </p>
          <p v-if="!paymentStatus.payment_available" class="text-sm text-red-700">
            Online payment isn't set up yet. Please contact support.
          </p>
          <p v-else-if="!paymentStatus.can_pay" class="text-sm text-on-surface-variant">
            The listing owner needs to complete this payment.
          </p>
          <button
            v-else
            type="button"
            :disabled="isStartingPayment"
            class="px-6 h-12 rounded-lg bg-primary text-surface-container-lowest font-label-lg text-label-lg font-bold inline-flex items-center gap-2 shadow-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="handlePay"
          >
            <span class="material-symbols-outlined text-[18px]">lock</span>
            {{ isStartingPayment ? 'Opening secure payment…' : `Pay ${paymentService.formatMoney(paymentStatus.amount, paymentStatus.currency)}` }}
          </button>
          <p class="text-xs text-on-surface-variant">Card details are handled by Stripe and never stored on this site.</p>
        </div>

        <p v-else-if="paymentStatus" class="text-body-md font-body-md text-on-surface-variant">
          This package is free. Continue to finish your listing.
        </p>
      </div>

      <!-- Location on the Map step: Google Map pin picker -->
      <MapPicker
        v-else-if="currentStep.kind === 'map'"
        :latitude="workflowStore.values.latitude as any"
        :longitude="workflowStore.values.longitude as any"
        :address="mapAddress"
        :errors="errors"
        @update="handleMapUpdate"
      />

      <!-- Pictures & Virtual Tours: real uploader (saved to the listing), then tour link + terms -->
      <div v-else-if="isMediaStep" class="space-y-6">
        <div :id="MEDIA_IMAGES_FIELD">
          <ListingImageManager :listing-id="listingId" @count="handleImageCount" />
          <p v-if="errors[MEDIA_IMAGES_FIELD]" class="mt-2 text-sm text-red-700" role="alert">
            {{ errors[MEDIA_IMAGES_FIELD] }}
          </p>
        </div>
        <DynamicWorkflow
          v-if="mediaFormStep"
          :step="mediaFormStep"
          :values="workflowStore.values"
          :errors="errors"
          @update:field="handleFieldUpdate"
        />
      </div>

      <DynamicWorkflow
        v-else
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
          v-if="!paymentPublishes"
          @click="handleContinue"
          :disabled="isSaving"
          class="px-8 h-12 rounded-lg bg-secondary hover:bg-on-secondary-container text-surface-container-lowest transition-colors font-label-lg text-label-lg font-bold flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isSaving" class="inline-block animate-spin mr-1">⌛</span>
          {{ isSaving ? 'Saving...' : (isLastDynamicStep ? 'Submit Listing' : 'Save & Continue') }}
          <span v-if="!isSaving" class="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>
  </div>
</template>
