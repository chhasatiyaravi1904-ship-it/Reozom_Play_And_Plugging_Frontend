<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Mail,
  PenTool,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import Modal from '@/components/ui/Modal.vue'
import EunoSignModal from '@/components/document/EunoSignModal.vue'
import SendToEmailModal from '@/components/document/SendToEmailModal.vue'
import RenameDocumentModal from '@/components/document/RenameDocumentModal.vue'
import { useDocumentStore } from '@/stores/document'
import { useToastStore } from '@/stores/toast'
import * as documentService from '@/services/documentService'
import * as eunoService from '@/services/eunoService'
import type { EunoAgreementStatus } from '@/services/eunoService'
import type { DocumentRequirement } from '@/types/document'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()
const listingId = computed(() => Number(route.params.listingId || route.params.id))

const documentStore = useDocumentStore()

// Upload Form State
const selectedDocType = ref('deed')
const customDocName = ref('')
const selectedFile = ref<File | null>(null)
const isUploading = ref(false)

// Modals State
const isPreviewModalOpen = ref(false)
const previewHtml = ref('')
const previewTitle = ref('')
const isLoadingPreview = ref(false)

// EunoDoc Signing Session State
const isEunoModalOpen = ref(false)
const currentSigningUrl = ref('')
const isInitiatingEuno = ref(false)
const isCheckingEunoStatus = ref(false)
const eunoAgreement = ref<EunoAgreementStatus | null>(null)

// Email & Rename Modals State
const isSendEmailModalOpen = ref(false)
const targetEmailDoc = ref<DocumentRequirement | null>(null)
const isRenameModalOpen = ref(false)
const targetRenameDoc = ref<DocumentRequirement | null>(null)

// Supplementary Document Categories
const reozomDocumentTypes = [
  { value: 'deed', label: 'Property Deed / Title' },
  { value: 'id_proof', label: 'Government Photo ID' },
  { value: 'appraisal', label: 'Appraisal Report' },
  { value: 'survey', label: 'Property Survey' },
  { value: 'home_warranty', label: 'Home Warranty Policy' },
  { value: 'floor_plan', label: 'Floor Plan Architectural Drawing' },
  { value: 'hoa_rules', label: 'HOA / Condominium Bylaws' },
  { value: 'tax_record', label: 'Recent Property Tax Bill' },
  { value: 'water_report', label: 'Well Water Quality Test Report' },
  { value: 'lead_paint_report', label: 'Lead-Paint Inspection Report' },
  { value: 'pre_approval_letter', label: 'Mortgage Pre-Approval Letter' },
  { value: 'closing_documents', label: 'Closing Settlement Statements' },
  { value: 'other', label: 'Other Attachment' },
]

// Computed categorizations
const statutoryDocuments = computed(() =>
  documentStore.documents.filter((d) => d.category === 'statutory' || d.isSignable),
)

const uploadedSupplementaryDocuments = computed(() =>
  documentStore.documents.filter(
    (d) => (d.category !== 'statutory' && !d.isSignable) || d.fileName,
  ),
)

const allStatutorySigned = computed(() =>
  statutoryDocuments.value.length > 0 &&
  statutoryDocuments.value.every((d) => d.status === 'signed'),
)

const unsignedStatutoryCount = computed(() =>
  statutoryDocuments.value.filter((d) => d.status !== 'signed').length,
)

const hasUnsignedDocuments = computed(() => unsignedStatutoryCount.value > 0)

const hasActiveAgreement = computed(() =>
  Boolean(
    eunoAgreement.value?.has_agreement &&
    !eunoAgreement.value?.is_completed &&
    eunoAgreement.value?.status === 'inprogress',
  ),
)

// Agent listings have no statutory listing documents to sign (original Reozom)
const isAgentListing = computed(() => !!eunoAgreement.value?.is_agent_listing)

// Signers sign in order (owner first, then additional signers): only the next one may sign
const canSignNow = computed(() => !hasActiveAgreement.value || eunoAgreement.value?.can_sign_now !== false)
const signingOrder = computed(() => eunoAgreement.value?.signers ?? [])

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
    // Non-fatal if not yet created
  } finally {
    isCheckingEunoStatus.value = false
  }
}

/**
 * Reozom Main Signing Action (triggers EunoDoc packet initiation & opens embedded iframe or window)
 */
async function handleStartSigning(doc?: DocumentRequirement) {
  if (!listingId.value) return
  if (currentSigningUrl.value) {
    isEunoModalOpen.value = true
    return
  }
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
    toast.error(err?.response?.data?.message || 'Failed to initiate signing session.')
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

function handleOpenSignedDoc() {
  if (eunoAgreement.value?.agreement_id) {
    window.open(eunoService.getSignedDocUrl(eunoAgreement.value.agreement_id), '_blank')
  }
}

// Send to Email Trigger
// Templates can't reach the global `document`, so the scroll lives here.
function scrollToUploadSection() {
  document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })
}

function handleOpenSendEmail(doc: DocumentRequirement) {
  targetEmailDoc.value = doc
  isSendEmailModalOpen.value = true
}

// Rename Document Trigger
function handleOpenRename(doc: DocumentRequirement) {
  targetRenameDoc.value = doc
  isRenameModalOpen.value = true
}

// Upload Supplementary
function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
  }
}

async function handleUploadSupplementary() {
  if (!selectedFile.value) {
    toast.error('Please choose a file to upload.')
    return
  }

  isUploading.value = true
  try {
    const success = await documentStore.upload(
      listingId.value,
      selectedDocType.value,
      selectedFile.value,
      selectedDocType.value === 'other' ? customDocName.value : undefined,
    )
    if (success) {
      toast.success('Document uploaded successfully.')
      selectedFile.value = null
      customDocName.value = ''
    } else {
      toast.error('Failed to upload document.')
    }
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Upload failed.')
  } finally {
    isUploading.value = false
  }
}

async function handleRegenerate(doc: DocumentRequirement) {
  if (doc.status === 'signed' && !confirm('If your answers changed since signing, this document will need to be signed again. Continue?')) return
  try {
    await documentService.regenerateDocument(listingId.value, doc.documentId || doc.id)
    toast.success(`${doc.label} updated from your current answers.`)
    documentStore.fetchDocuments(listingId.value)
  } catch (e: any) {
    toast.error(e?.response?.data?.message || 'Failed to regenerate the document.')
  }
}

// Preview Modal
async function handleOpenPreview(doc: DocumentRequirement) {
  previewTitle.value = doc.label
  isPreviewModalOpen.value = true
  isLoadingPreview.value = true
  try {
    const res = await documentService.previewDocument(listingId.value, doc.documentId || doc.id)
    previewHtml.value = res.data.data.html
  } catch {
    toast.error('Failed to generate document preview.')
    isPreviewModalOpen.value = false
  } finally {
    isLoadingPreview.value = false
  }
}

// View PDF inline in new tab (never direct download)
async function handleView(doc: DocumentRequirement) {
  const docKey = doc.documentId || doc.id
  const success = await documentStore.view(listingId.value, docKey)
  if (!success) {
    toast.error(`Failed to open ${doc.label || 'document'} PDF in new tab.`)
  }
}

// Download
async function handleDownload(doc: DocumentRequirement) {
  const docKey = doc.documentId || doc.id
  const success = await documentStore.download(listingId.value, docKey)
  if (!success) {
    toast.error(`Failed to download ${doc.label}. Please try again.`)
  } else {
    toast.success(`Downloaded ${doc.label}`)
  }
}

// Remove
async function handleRemove(doc: DocumentRequirement) {
  if (confirm(`Are you sure you want to delete ${doc.fileName || doc.label}?`)) {
    await documentStore.remove(listingId.value, doc.documentId || doc.id)
    toast.success('Document removed.')
  }
}

onMounted(() => {
  if (listingId.value) {
    documentStore.fetchDocuments(listingId.value)
    checkEunoStatus(true)
  }
})

// Documents is a listing management page, as in Reozom (Edit Listing → Documents), not a wizard step
const listingOverviewPath = computed(
  () => `${route.path.startsWith('/agent') ? '/agent' : ''}/listings/${listingId.value}`,
)
</script>

<template>
  <div class="mx-auto flex w-full max-w-4xl flex-col gap-6 py-4">
    <button
      type="button"
      class="inline-flex w-fit items-center gap-1 text-sm font-medium text-primary hover:underline"
      @click="router.push(listingOverviewPath)"
    >
      <ArrowLeft class="h-4 w-4" />
      Back to listing
    </button>

    <!-- Top Header matching Reozom -->
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-fg uppercase">DOCUMENTS</h1>
        <p class="text-xs text-fg-muted mt-0.5">
          Review, sign statutory listing disclosures, and manage all property documents.
        </p>
      </div>

      <BaseButton
        variant="secondary"
        size="sm"
        @click="scrollToUploadSection"
      >
        <Upload class="mr-1.5 h-3.5 w-3.5" />
        Upload more documents
      </BaseButton>
    </div>

    <LoadingState v-if="documentStore.status === 'loading'" :rows="4" />

    <ErrorState
      v-else-if="documentStore.status === 'error'"
      :description="documentStore.error || undefined"
      @retry="documentStore.fetchDocuments(listingId)"
    />

    <div v-else class="space-y-6">
      <!-- Reozom Warning Notice Box 1 -->
      <div
        v-if="hasUnsignedDocuments"
        class="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-900 dark:text-amber-200"
      >
        <div class="flex items-start gap-2.5">
          <AlertTriangle class="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
          <div class="space-y-1">
            <p class="font-medium">
              Documents may take up to 3 minutes to process after you have signed.
            </p>
            <p class="font-semibold text-amber-800 dark:text-amber-300">
              NOTE: By clicking on SIGN you will have the ability to review the documents before signing.
            </p>
          </div>
        </div>
      </div>

      <!-- Reozom Notice Box 2: Document Agreement State & Primary Action -->
      <!-- Case A: Documents NOT yet sent out for signature -->
      <div
        v-if="!hasActiveAgreement && hasUnsignedDocuments"
        class="rounded-xl border-2 border-amber-500/40 bg-amber-500/15 p-5 text-amber-950 dark:text-amber-100 shadow-sm"
      >
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="space-y-1 text-xs">
            <p class="font-semibold text-sm text-amber-900 dark:text-amber-200">
              There are unsigned documents by you and by additional signers.
            </p>
            <p>Documents have NOT been sent out for signature.</p>
            <p class="text-fg-muted">You can send them clicking on Sign Documents (below).</p>
            <template v-if="signingOrder.length > 1">
              <p class="pt-1">
                You must sign the documents first. After you sign, the documents are sent to each
                Additional Signer, one after another, in this order:
              </p>
              <ol class="list-decimal pl-5">
                <li v-for="s in signingOrder" :key="s.email">{{ s.name }} — <strong>{{ s.email }}</strong></li>
              </ol>
            </template>
          </div>

          <BaseButton
            variant="primary"
            size="md"
            class="shrink-0 font-bold px-6 shadow-md"
            :loading="isInitiatingEuno"
            @click="handleStartSigning()"
          >
            <PenTool class="mr-2 h-4 w-4" />
            Sign Documents
          </BaseButton>
        </div>
      </div>

      <!-- Case B: Documents HAVE been sent out for signature (In-Progress) -->
      <div
        v-else-if="hasActiveAgreement"
        class="rounded-xl border-2 border-amber-500/40 bg-amber-500/15 p-5 text-amber-950 dark:text-amber-100 shadow-sm"
      >
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="space-y-1 text-xs">
            <p class="font-semibold text-sm text-amber-900 dark:text-amber-200">
              There are unsigned documents by you or by additional signers.
            </p>
            <p>Documents have been sent out for signature.</p>
            <p class="text-fg-muted">You can check status of documents by clicking on Audit Report (below).</p>
            <template v-if="signingOrder.length">
              <p class="pt-1 font-semibold">Signing order:</p>
              <ol class="list-decimal pl-5">
                <li v-for="s in signingOrder" :key="s.email">
                  {{ s.name }} — <strong>{{ s.email }}</strong>
                  <span v-if="s.signed" class="text-emerald-700 dark:text-emerald-300"> · Signed</span>
                  <span v-else-if="s.is_next" class="font-semibold"> · Signing now</span>
                  <span v-else class="text-fg-muted"> · Waiting</span>
                </li>
              </ol>
            </template>
            <p v-if="!canSignNow && eunoAgreement?.next_signer" class="pt-1 font-semibold">
              Waiting for {{ eunoAgreement.next_signer }} to sign.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2 shrink-0">
            <BaseButton
              v-if="canSignNow"
              variant="primary"
              size="md"
              class="font-bold px-5 shadow-md"
              :loading="isInitiatingEuno"
              @click="handleStartSigning()"
            >
              <PenTool class="mr-2 h-4 w-4" />
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
              title="Sync latest status from EunoDoc"
              @click="checkEunoStatus(false)"
            >
              <RefreshCw class="mr-1.5 h-4 w-4" :class="{ 'animate-spin': isCheckingEunoStatus }" />
              Sync Status
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Case C: All Documents Executed & Completed -->
      <div
        v-else-if="allStatutorySigned"
        class="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-950 dark:text-emerald-100 shadow-sm"
      >
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success text-white">
              <CheckCircle2 class="h-6 w-6" />
            </div>
            <div>
              <p class="font-semibold text-sm text-emerald-900 dark:text-emerald-200">
                All statutory listing documents are signed & verified.
              </p>
              <p class="text-xs text-fg-muted mt-0.5">
                The listing documents packet has been executed via EunoDoc with a certified legal audit trail.
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 shrink-0">
            <BaseButton
              v-if="eunoAgreement?.has_audit_pdf || eunoAgreement?.agreement_id"
              variant="secondary"
              size="sm"
              @click="handleOpenAuditReport"
            >
              <ExternalLink class="mr-1.5 h-3.5 w-3.5" />
              Audit Report
            </BaseButton>

            <BaseButton
              v-if="eunoAgreement?.has_signed_pdf"
              variant="secondary"
              size="sm"
              @click="handleOpenSignedDoc"
            >
              <Download class="mr-1.5 h-3.5 w-3.5" />
              Signed Packet PDF
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Agent listings: no statutory documents to sign (original Reozom) -->
      <div
        v-if="isAgentListing"
        class="rounded-xl border border-border bg-surface-raised p-4 text-xs text-fg-muted"
      >
        This listing was created by an agent, so there are no listing documents to sign.
        You can upload and manage your own documents below.
      </div>

      <!-- Section: Statutory Documents List (Matching Reozom documentsList) -->
      <BaseCard v-else class="p-6">
        <div class="mb-4 flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 class="text-base font-semibold text-fg">Statutory Disclosures & Agreements</h2>
            <p class="text-xs text-fg-muted">
              Michigan & federal statutory documents generated from your disclosures answers.
            </p>
          </div>
          <BaseBadge :variant="allStatutorySigned ? 'success' : 'warning'">
            {{ allStatutorySigned ? 'All Signed' : `${unsignedStatutoryCount} Not Signed` }}
          </BaseBadge>
        </div>

        <ul class="divide-y divide-border">
          <li
            v-for="doc in statutoryDocuments"
            :key="doc.id"
            class="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <!-- Left Info -->
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <FileText class="h-4 w-4 text-primary shrink-0" />
                <button
                  type="button"
                  class="font-semibold text-fg text-sm hover:text-primary transition-colors hover:underline text-left flex items-center gap-1.5"
                  title="Open PDF in new tab"
                  @click="handleView(doc)"
                >
                  {{ doc.label }}
                  <ExternalLink class="h-3 w-3 text-fg-muted" />
                </button>
              </div>
              <p class="text-xs text-fg-muted">
                {{ doc.description }}
              </p>
              <p class="text-xs">
                <span v-if="doc.status === 'signed'" class="text-success font-medium flex items-center gap-1.5">
                  <CheckCircle2 class="h-3.5 w-3.5" />
                  Signed on {{ doc.signedAt ? new Date(doc.signedAt).toLocaleString() : 'Verified' }}
                  <span v-if="doc.signedBy">by {{ doc.signedBy }}</span>
                </span>
                <span v-else class="text-warning font-medium">
                  Document is not signed.
                </span>
              </p>
            </div>

            <!-- Right Actions (Matching Reozom buttons) -->
            <div class="flex flex-wrap items-center gap-2 shrink-0">
              <template v-if="doc.status === 'signed'">
                <!-- Send to Email Button (Green matching Reozom) -->
                <BaseButton
                  size="sm"
                  variant="success"
                  class="font-medium text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  title="Send this signed document to email"
                  @click="handleOpenSendEmail(doc)"
                >
                  <Mail class="mr-1.5 h-3.5 w-3.5" />
                  Send to email
                </BaseButton>

                <!-- View PDF in New Tab (Blue button matching Reozom) -->
                <BaseButton
                  size="sm"
                  variant="primary"
                  class="text-xs"
                  title="View PDF in new tab"
                  @click="handleView(doc)"
                >
                  <Eye class="mr-1.5 h-3.5 w-3.5" />
                  View
                </BaseButton>

                <!-- Download PDF -->
                <BaseButton
                  size="sm"
                  variant="secondary"
                  class="text-xs"
                  title="Download PDF to device"
                  @click="handleDownload(doc)"
                >
                  <Download class="mr-1.5 h-3.5 w-3.5" />
                  Download
                </BaseButton>

                <!-- Re-Sign Option -->
                <BaseButton
                  size="sm"
                  variant="secondary"
                  class="text-xs"
                  title="Re-sign document"
                  @click="handleStartSigning(doc)"
                >
                  <PenTool class="mr-1 h-3 w-3" />
                  Re-Sign
                </BaseButton>
              </template>

              <template v-else>
                <!-- View PDF in New Tab (Available before signing, matching Reozom) -->
                <BaseButton
                  size="sm"
                  variant="primary"
                  class="text-xs"
                  title="View PDF in new tab"
                  @click="handleView(doc)"
                >
                  <Eye class="mr-1.5 h-3.5 w-3.5" />
                  View
                </BaseButton>

                <!-- Sign Button (Primary Blue matching Reozom) -->
                <BaseButton
                  v-if="canSignNow"
                  size="sm"
                  variant="secondary"
                  class="text-xs font-semibold px-4 border-primary/50 text-primary hover:bg-primary/10"
                  :loading="isInitiatingEuno"
                  title="Sign Document"
                  @click="handleStartSigning(doc)"
                >
                  <PenTool class="mr-1.5 h-3.5 w-3.5" />
                  Sign
                </BaseButton>

                <!-- Preview Document Button -->
                <BaseButton
                  size="sm"
                  variant="secondary"
                  class="text-xs"
                  title="Preview document content"
                  @click="handleOpenPreview(doc)"
                >
                  <FileText class="mr-1 h-3.5 w-3.5" />
                  Preview
                </BaseButton>

                <!-- Re-render a generated document from the current listing answers -->
                <BaseButton
                  v-if="doc.isGenerated"
                  size="sm"
                  variant="ghost"
                  class="text-xs"
                  title="Update this document from your current listing answers"
                  @click="handleRegenerate(doc)"
                >
                  Regenerate
                </BaseButton>
              </template>
            </div>
          </li>
        </ul>
      </BaseCard>

      <!-- Section: Uploaded Documents (Matching Reozom uploadedDocuments) -->
      <BaseCard v-if="uploadedSupplementaryDocuments.length > 0" class="p-6">
        <div class="mb-4 border-b border-border pb-3">
          <h2 class="text-base font-semibold text-fg">Uploaded Documents</h2>
          <p class="text-xs text-fg-muted">
            Uploaded supplementary property documentation, surveys, deeds, and attachments.
          </p>
        </div>

        <ul class="divide-y divide-border">
          <li
            v-for="doc in uploadedSupplementaryDocuments"
            :key="doc.id"
            class="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="space-y-1">
              <button
                type="button"
                class="font-medium text-fg text-sm hover:text-primary transition-colors hover:underline text-left flex items-center gap-1.5"
                title="Open PDF in new tab"
                @click="handleView(doc)"
              >
                {{ doc.fileName || doc.label }}
                <ExternalLink class="h-3 w-3 text-fg-muted" />
              </button>
              <p class="text-xs text-fg-muted">
                Uploaded on {{ doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Recent' }}
                <span v-if="doc.label && doc.fileName">({{ doc.label }})</span>
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2 shrink-0">
              <!-- Send to email -->
              <BaseButton
                size="sm"
                variant="success"
                class="font-medium text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                title="Send document to email"
                @click="handleOpenSendEmail(doc)"
              >
                <Mail class="mr-1.5 h-3.5 w-3.5" />
                Send to email
              </BaseButton>

              <!-- View (Opens in new tab) -->
              <BaseButton
                size="sm"
                variant="primary"
                class="text-xs"
                title="View PDF in new tab"
                @click="handleView(doc)"
              >
                <Eye class="mr-1.5 h-3.5 w-3.5" />
                View
              </BaseButton>

              <!-- Download (Direct download to device) -->
              <BaseButton
                size="sm"
                variant="secondary"
                class="text-xs"
                title="Download file to device"
                @click="handleDownload(doc)"
              >
                <Download class="mr-1.5 h-3.5 w-3.5" />
                Download
              </BaseButton>

              <!-- Rename -->
              <BaseButton
                size="sm"
                variant="secondary"
                class="text-xs"
                @click="handleOpenRename(doc)"
              >
                <Edit3 class="mr-1.5 h-3.5 w-3.5" />
                Rename
              </BaseButton>

              <!-- Delete -->
              <BaseButton
                size="sm"
                variant="danger"
                class="text-xs"
                @click="handleRemove(doc)"
              >
                <Trash2 class="mr-1.5 h-3.5 w-3.5" />
                Delete
              </BaseButton>
            </div>
          </li>
        </ul>
      </BaseCard>

      <!-- Section: Upload More Documents (Matching Reozom uploadDocuments) -->
      <BaseCard id="upload-section" class="p-6">
        <div class="mb-4 border-b border-border pb-3">
          <h2 class="text-base font-semibold text-fg">Upload More Documents</h2>
          <p class="text-xs text-fg-muted">
            Upload supporting records like Property Deed, Survey, Home Warranty, HOA Bylaws, or Water Tests.
          </p>
        </div>

        <div class="rounded-xl border border-border bg-surface-raised/30 p-4">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
            <div class="md:col-span-5">
              <label class="block text-xs font-semibold text-fg mb-1">Document Category *</label>
              <select
                v-model="selectedDocType"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg focus:border-primary focus:outline-none"
              >
                <option v-for="type in reozomDocumentTypes" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
            </div>

            <div v-if="selectedDocType === 'other'" class="md:col-span-3">
              <label class="block text-xs font-semibold text-fg mb-1">Custom Document Name *</label>
              <input
                v-model="customDocName"
                type="text"
                placeholder="e.g. Well Inspection"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg focus:border-primary focus:outline-none"
              />
            </div>

            <div :class="selectedDocType === 'other' ? 'md:col-span-4' : 'md:col-span-7'" class="flex gap-2">
              <div class="flex-1">
                <label class="block text-xs font-semibold text-fg mb-1">Select File (PDF, Image, Doc) *</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  class="w-full text-xs text-fg file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-hover cursor-pointer"
                  @change="handleFileSelect"
                />
              </div>

              <BaseButton
                :disabled="!selectedFile || isUploading"
                :loading="isUploading"
                variant="primary"
                size="sm"
                class="self-end"
                @click="handleUploadSupplementary"
              >
                <Upload class="mr-1 h-3.5 w-3.5" />
                Upload
              </BaseButton>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Reozom EunoDoc Embedded Signing Modal (documentsView.blade.php) -->
    <EunoSignModal
      v-model="isEunoModalOpen"
      :signing-url="currentSigningUrl"
      :is-syncing="isCheckingEunoStatus"
      @close="handleEunoModalClose"
      @sync="checkEunoStatus(false)"
    />

    <!-- Reozom Send to Email Modal -->
    <SendToEmailModal
      v-model="isSendEmailModalOpen"
      :listing-id="listingId"
      :document-id="targetEmailDoc?.documentId || targetEmailDoc?.id || ''"
      :document-name="targetEmailDoc?.fileName || targetEmailDoc?.label || 'Document'"
    />

    <!-- Reozom Rename Document Modal -->
    <RenameDocumentModal
      v-model="isRenameModalOpen"
      :listing-id="listingId"
      :document-id="targetRenameDoc?.documentId || targetRenameDoc?.id || ''"
      :current-name="targetRenameDoc?.fileName || targetRenameDoc?.label || ''"
      @renamed="documentStore.fetchDocuments(listingId)"
    />

    <!-- Preview Modal -->
    <Modal
      v-model="isPreviewModalOpen"
      :title="previewTitle"
      size="xl"
    >
      <div v-if="isLoadingPreview" class="flex h-64 items-center justify-center">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
      <div
        v-else
        class="max-h-[70vh] overflow-y-auto rounded-lg border border-border bg-white p-6 text-black"
        v-html="previewHtml"
      />
      <template #footer>
        <BaseButton variant="secondary" @click="isPreviewModalOpen = false">Close</BaseButton>
      </template>
    </Modal>
  </div>
</template>
