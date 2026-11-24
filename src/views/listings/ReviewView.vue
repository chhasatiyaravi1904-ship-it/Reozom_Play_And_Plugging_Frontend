<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Mail,
  PenTool,
  RefreshCw,
  ShieldCheck,
} from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import Alert from '@/components/ui/Alert.vue'
import Stepper from '@/components/listing/Stepper.vue'
import EunoSignModal from '@/components/document/EunoSignModal.vue'
import SendToEmailModal from '@/components/document/SendToEmailModal.vue'
import { useListingStore } from '@/stores/listing'
import { useWorkflowStore } from '@/stores/workflow'
import { useDocumentStore } from '@/stores/document'
import { useListingSteps } from '@/composables/useListingSteps'
import { useToastStore } from '@/stores/toast'
import * as eunoService from '@/services/eunoService'
import type { EunoAgreementStatus } from '@/services/eunoService'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()
const listingId = computed(() => Number(route.params.listingId || route.params.id))

const listingStore = useListingStore()
const workflowStore = useWorkflowStore()
const documentStore = useDocumentStore()
const { steps, routeFor, dynamicSteps, hasDisclosureSteps } = useListingSteps(listingId.value)

const isSubmitting = ref(false)

// EunoDoc Signing Session State
const isEunoModalOpen = ref(false)
const currentSigningUrl = ref('')
const isInitiatingEuno = ref(false)
const isCheckingEunoStatus = ref(false)
const eunoAgreement = ref<EunoAgreementStatus | null>(null)

// Email Modal
const isSendEmailModalOpen = ref(false)
const targetEmailDoc = ref<any>(null)

const statutoryDocuments = computed(() =>
  documentStore.documents.filter((d) => d.category === 'statutory' || d.isSignable),
)

const unsignedStatutoryCount = computed(() => {
  return statutoryDocuments.value.filter((d) => d.status !== 'signed').length
})

const allStatutorySigned = computed(() =>
  statutoryDocuments.value.length > 0 && statutoryDocuments.value.every((d) => d.status === 'signed'),
)

const hasUnsignedDocuments = computed(() => unsignedStatutoryCount.value > 0)

const hasActiveAgreement = computed(() =>
  Boolean(
    eunoAgreement.value?.has_agreement &&
    !eunoAgreement.value?.is_completed &&
    eunoAgreement.value?.status === 'inprogress',
  ),
)

const reviewSections = computed(() => [
  ...dynamicSteps.value.map((step) => ({
    label: step.label,
    route: routeFor(step.id),
  })),
  // Disclosures are regular steps above when the process has disclosure steps
  ...(hasDisclosureSteps.value ? [] : [{ label: 'Property Disclosures', route: routeFor('disclosures') }]),
  { label: 'Documents & Agreements', route: routeFor('documents') },
])

const backRoute = computed(() => {
  return routeFor('documents')
})

const isPublished = computed(
  () => listingStore.activeListing?.status === 'published',
)

const isSubmitted = computed(
  () =>
    listingStore.activeListing?.status === 'published' ||
    listingStore.activeListing?.status === 'submitted',
)

async function checkEunoStatus(silent = false) {
  if (!listingId.value) return
  isCheckingEunoStatus.value = true
  try {
    const data = await eunoService.getListingSigningStatus(listingId.value)
    eunoAgreement.value = data
    if (data.signing_url) {
      currentSigningUrl.value = data.signing_url
    }
    if (data.is_completed) {
      await documentStore.fetchDocuments(listingId.value)
    }
    if (!silent && data.is_completed) {
      toast.success('Document packet verified and signed successfully!')
    }
  } catch {
    // Non-fatal
  } finally {
    isCheckingEunoStatus.value = false
  }
}

async function handleStartSigning() {
  if (!listingId.value) return
  isInitiatingEuno.value = true
  try {
    const res = await eunoService.initiateListingSigning(listingId.value)
    await checkEunoStatus(true)
    const url = res.signing_url || eunoAgreement.value?.signing_url
    if (url) {
      currentSigningUrl.value = url
      isEunoModalOpen.value = true
    } else {
      toast.error('Unable to retrieve EunoDoc signing URL.')
    }
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Failed to start EunoDoc signing.')
  } finally {
    isInitiatingEuno.value = false
  }
}

async function handleEunoModalClose() {
  isEunoModalOpen.value = false
  await checkEunoStatus()
  await documentStore.fetchDocuments(listingId.value)
}

function handleOpenAuditReport() {
  if (eunoAgreement.value?.agreement_id) {
    window.open(eunoService.getAuditReportUrl(eunoAgreement.value.agreement_id), '_blank')
  }
}

function handleOpenSendEmail(doc: any) {
  targetEmailDoc.value = doc
  isSendEmailModalOpen.value = true
}

onMounted(() => {
  if (!workflowStore.workflow) workflowStore.fetchWorkflow(listingId.value)
  if (!listingStore.activeListing) listingStore.fetchListing(listingId.value)
  documentStore.fetchDocuments(listingId.value)
  checkEunoStatus(true)
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
    toast.error(listingStore.error || 'Unable to submit your listing. Please try again.')
  }
}

async function handleDownload(doc: any) {
  const docKey = doc.documentId || doc.id
  const success = await documentStore.download(listingId.value, docKey)
  if (!success) {
    toast.error(`Failed to download ${doc.label}. Please try again.`)
  }
}

</script>

<template>
  <div class="mx-auto flex w-full max-w-4xl flex-col gap-6 py-4">
    <Stepper :steps="steps" @select="(id) => router.push(routeFor(id))" />

    <LoadingState variant="detail" v-if="workflowStore.status === 'loading'" :rows="4" label="Loading review" />

    <ErrorState
      v-else-if="workflowStore.status === 'error'"
      :description="workflowStore.error || undefined"
    >
      <template #action>
        <BaseButton size="sm" @click="workflowStore.fetchWorkflow(listingId)">Try Again</BaseButton>
      </template>
    </ErrorState>

    <BaseCard v-else class="space-y-6">
      <!-- Status Notice if already published -->
      <div
        v-if="isPublished"
        class="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-950 dark:text-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
      >
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white font-bold">
            <CheckCircle2 class="h-6 w-6" />
          </div>
          <div>
            <div class="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
              Listing Status: Active & Published
            </div>
            <div class="text-xs text-emerald-800 dark:text-emerald-300">
              Reference: {{ listingStore.activeListing?.referenceCode || `REO-${listingId}` }} · All statutory disclosures and workflow steps are live.
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <RouterLink :to="`/properties/${listingId}`" target="_blank">
            <BaseButton size="sm" variant="primary">
              <ExternalLink class="mr-1.5 h-3.5 w-3.5" />
              View Live Listing
            </BaseButton>
          </RouterLink>
          <BaseButton
            size="sm"
            variant="secondary"
            @click="router.push(route.path.startsWith('/agent') ? '/agent/listings' : '/listings')"
          >
            My Listings
          </BaseButton>
        </div>
      </div>

      <div>
        <h1 class="text-xl font-semibold text-fg">Review & Final Submission</h1>
        <p class="mt-1 text-sm text-fg-muted">
          Confirm your listing details, disclosures questionnaire, and signed statutory agreements before submitting.
        </p>
      </div>

      <!-- Reozom Notice Alert Box on Review -->
      <div
        v-if="!hasActiveAgreement && hasUnsignedDocuments"
        class="rounded-xl border-2 border-amber-500/40 bg-amber-500/15 p-4 text-amber-950 dark:text-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
      >
        <div class="space-y-1 text-xs">
          <p class="font-semibold text-sm text-amber-900 dark:text-amber-200">
            There are unsigned documents by you and by additional signers.
          </p>
          <p>Documents have NOT been sent out for signature.</p>
          <p class="text-fg-muted">You can send them clicking on Sign Documents (below).</p>
        </div>

        <BaseButton
          variant="primary"
          size="md"
          class="shrink-0 font-bold px-5 shadow-md"
          :loading="isInitiatingEuno"
          @click="handleStartSigning()"
        >
          <PenTool class="mr-2 h-4 w-4" />
          Sign Documents
        </BaseButton>
      </div>

      <div
        v-else-if="hasActiveAgreement"
        class="rounded-xl border-2 border-amber-500/40 bg-amber-500/15 p-4 text-amber-950 dark:text-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
      >
        <div class="space-y-1 text-xs">
          <p class="font-semibold text-sm text-amber-900 dark:text-amber-200">
            There are unsigned documents by you or by additional signers.
          </p>
          <p>Documents have been sent out for signature.</p>
          <p class="text-fg-muted">You can check status of documents by clicking on Audit Report (below).</p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <BaseButton
            variant="primary"
            size="md"
            class="font-bold px-4 shadow-md"
            :loading="isInitiatingEuno"
            @click="handleStartSigning()"
          >
            <PenTool class="mr-1.5 h-4 w-4" />
            Sign
          </BaseButton>

          <BaseButton
            variant="secondary"
            size="md"
            @click="handleOpenAuditReport"
          >
            <ExternalLink class="mr-1.5 h-4 w-4" />
            Audit Report
          </BaseButton>

          <BaseButton
            variant="secondary"
            size="md"
            :loading="isCheckingEunoStatus"
            @click="checkEunoStatus(false)"
          >
            <RefreshCw class="mr-1.5 h-3.5 w-3.5" :class="{ 'animate-spin': isCheckingEunoStatus }" />
            Sync
          </BaseButton>
        </div>
      </div>

      <!-- Listing Steps Overview -->
      <div class="rounded-xl border border-border bg-surface-raised/10 p-4">
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
      <div class="rounded-xl border border-border bg-surface-raised/10 p-4">
        <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h2 class="text-sm font-semibold uppercase tracking-wider text-primary">Statutory Documents & Signatures</h2>
            <p class="text-xs text-fg-muted mt-0.5">Federal & State disclosures legally mandated prior to listing syndication.</p>
          </div>
          <div class="flex items-center gap-2">
            <BaseBadge :variant="allStatutorySigned ? 'success' : 'warning'">
              {{ allStatutorySigned ? 'All Documents Signed' : `${unsignedStatutoryCount} Signature(s) Required` }}
            </BaseBadge>
            <BaseButton
              v-if="!allStatutorySigned"
              size="sm"
              variant="primary"
              title="Sign all unsigned documents with EunoDoc"
              :loading="isInitiatingEuno"
              @click="handleStartSigning()"
            >
              <PenTool class="mr-1.5 h-3.5 w-3.5" />
              {{ `Sign Documents (${unsignedStatutoryCount})` }}
            </BaseButton>
          </div>
        </div>

        <div v-if="statutoryDocuments.length > 0" class="divide-y divide-border">
          <div
            v-for="doc in statutoryDocuments"
            :key="doc.id"
            class="flex items-center justify-between py-2.5 flex-wrap gap-3"
          >
            <div class="flex items-center gap-2.5">
              <FileText class="h-4 w-4 text-primary shrink-0" />
              <div>
                <div class="text-xs font-semibold text-fg">{{ doc.label }}</div>
                <div v-if="doc.signedAt" class="text-[11px] text-success flex items-center gap-1.5 mt-0.5">
                  <CheckCircle2 class="h-3 w-3 shrink-0" />
                  <span>Signed on {{ new Date(doc.signedAt).toLocaleDateString() }}</span>
                  <span v-if="doc.signedBy">by {{ doc.signedBy }}</span>
                </div>
                <div v-else class="text-[11px] text-warning flex items-center gap-1 mt-0.5">
                  <AlertCircle class="h-3 w-3 shrink-0" />
                  <span>Document is not signed</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <BaseBadge :variant="doc.status === 'signed' ? 'success' : 'warning'">
                {{ doc.status === 'signed' ? 'Signed' : 'Not Signed' }}
              </BaseBadge>

              <!-- Send to email -->
              <BaseButton
                v-if="doc.status === 'signed'"
                size="sm"
                variant="success"
                class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                title="Send document to email"
                @click="handleOpenSendEmail(doc)"
              >
                <Mail class="h-3.5 w-3.5" />
              </BaseButton>

              <!-- View / Download PDF Button -->
              <BaseButton
                v-if="doc.status === 'signed'"
                size="sm"
                variant="primary"
                title="View / Download PDF"
                class="inline-flex items-center gap-1 text-xs"
                @click="handleDownload(doc)"
              >
                <Download class="h-3.5 w-3.5" />
                View
              </BaseButton>

              <!-- Sign Button: like Reozom, all unsigned documents are signed together in EunoDoc -->
              <BaseButton
                v-if="doc.status !== 'signed'"
                size="sm"
                variant="primary"
                title="Sign with EunoDoc"
                class="inline-flex items-center gap-1 text-xs font-semibold"
                :loading="isInitiatingEuno"
                @click="handleStartSigning()"
              >
                <PenTool class="h-3 w-3" />
                Sign
              </BaseButton>
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
          <BaseButton variant="primary" :loading="isSubmitting" class="font-bold px-6 shadow-sm" @click="handleSubmit">
            {{ isPublished ? 'Update & Publish Listing' : 'Publish Listing' }}
            <ArrowRight class="ml-1.5 h-4 w-4" />
          </BaseButton>
        </div>
      </template>
    </BaseCard>

    <!-- Reozom EunoDoc Embedded Signing Modal -->
    <EunoSignModal
      v-model="isEunoModalOpen"
      :signing-url="currentSigningUrl"
      :is-syncing="isCheckingEunoStatus"
      @close="handleEunoModalClose"
      @sync="checkEunoStatus(false)"
    />

    <!-- Send to Email Modal -->
    <SendToEmailModal
      v-model="isSendEmailModalOpen"
      :listing-id="listingId"
      :document-id="targetEmailDoc?.documentId || targetEmailDoc?.id || ''"
      :document-name="targetEmailDoc?.fileName || targetEmailDoc?.label || 'Document'"
    />
  </div>
</template>
