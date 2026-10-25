<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  PenTool,
  Printer,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import Stepper from '@/components/listing/Stepper.vue'
import Modal from '@/components/ui/Modal.vue'
import { useDocumentStore } from '@/stores/document'
import { useListingSteps } from '@/composables/useListingSteps'
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
const { steps, routeFor } = useListingSteps(listingId.value)

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

const isSignModalOpen = ref(false)
const documentToSign = ref<DocumentRequirement | null>(null)
const signerFullName = ref('')
const isSigning = ref(false)

// Reozom Supplementary Document Types
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

// Filter documents by category
const statutoryDocuments = computed(() =>
  documentStore.documents.filter((d) => d.category === 'statutory' || d.isSignable),
)

const uploadedSupplementaryDocuments = computed(() =>
  documentStore.documents.filter(
    (d) => (d.category !== 'statutory' && !d.isSignable) || d.fileName,
  ),
)

const allStatutorySigned = computed(() =>
  statutoryDocuments.value.every((d) => d.status === 'signed'),
)

// EunoDoc Agreement Flow State
const eunoAgreement = ref<EunoAgreementStatus | null>(null)
const isInitiatingEuno = ref(false)
const isCheckingEunoStatus = ref(false)

async function checkEunoStatus() {
  if (!listingId.value) return
  isCheckingEunoStatus.value = true
  try {
    const data = await eunoService.getListingSigningStatus(listingId.value)
    eunoAgreement.value = data
    if (data.is_completed) {
      documentStore.fetchDocuments(listingId.value)
    }
  } catch {
    // Gracefully handle if not yet initiated
  } finally {
    isCheckingEunoStatus.value = false
  }
}

async function handleInitiateEunoSign() {
  if (!listingId.value) return
  isInitiatingEuno.value = true
  try {
    const res = await eunoService.initiateListingSigning(listingId.value)
    toast.success('EunoDoc agreement created! Opening secure e-signing...')
    await checkEunoStatus()
    if (res.signing_url) {
      window.open(res.signing_url, '_blank')
    }
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Failed to start EunoDoc signing flow.')
  } finally {
    isInitiatingEuno.value = false
  }
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

onMounted(() => {
  if (listingId.value) {
    documentStore.fetchDocuments(listingId.value)
    checkEunoStatus()
  }
})

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

async function handleOpenPreview(doc: DocumentRequirement) {
  previewTitle.value = doc.label
  isPreviewModalOpen.value = true
  isLoadingPreview.value = true
  try {
    const res = await documentService.previewDocument(listingId.value, doc.documentId || doc.id)
    previewHtml.value = res.data.data.html
  } catch (err: any) {
    toast.error('Failed to generate document preview.')
    isPreviewModalOpen.value = false
  } finally {
    isLoadingPreview.value = false
  }
}

function handleOpenSign(doc: DocumentRequirement) {
  documentToSign.value = doc
  signerFullName.value = doc.signedBy || ''
  isSignModalOpen.value = true
}

async function handleConfirmSign() {
  if (!documentToSign.value) return
  if (!signerFullName.value.trim()) {
    toast.error('Please enter your full legal name to electronically sign.')
    return
  }

  isSigning.value = true
  try {
    const success = await documentStore.sign(
      listingId.value,
      documentToSign.value.documentId || documentToSign.value.id,
      signerFullName.value.trim(),
    )
    if (success) {
      toast.success(`${documentToSign.value.label} successfully signed!`)
      isSignModalOpen.value = false
      documentToSign.value = null
    } else {
      toast.error('Signing failed. Please try again.')
    }
  } finally {
    isSigning.value = false
  }
}

async function handleDownload(doc: DocumentRequirement) {
  const success = await documentStore.download(listingId.value, doc.documentId || doc.id)
  if (!success) toast.error('Failed to download document.')
}

async function handleRemove(doc: DocumentRequirement) {
  if (confirm(`Are you sure you want to delete ${doc.fileName || doc.label}?`)) {
    await documentStore.remove(listingId.value, doc.documentId || doc.id)
    toast.success('Document removed.')
  }
}

function handleBack() {
  router.push(routeFor('disclosures'))
}

function handleContinue() {
  if (!allStatutorySigned.value) {
    if (!confirm('Some statutory disclosures are still unsigned. Do you want to proceed to review anyway?')) {
      return
    }
  }
  router.push(routeFor('review'))
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-4xl flex-col gap-6 py-4">
    <Stepper :steps="steps" @select="(id) => router.push(routeFor(id))" />

    <PageHeader
      title="Listing Documents & Agreements"
      description="Review, digitally e-sign statutory listing agreements, and upload supplementary property documentation."
    />

    <LoadingState v-if="documentStore.status === 'loading'" :rows="4" />

    <ErrorState
      v-else-if="documentStore.status === 'error'"
      :description="documentStore.error || undefined"
      @retry="documentStore.fetchDocuments(listingId)"
    />

    <div v-else class="space-y-6">
      <!-- EunoDoc Official Electronic Signature Flow Card -->
      <BaseCard class="border-primary/20 bg-primary/5 p-6 shadow-sm">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-start gap-3">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
              <ShieldCheck class="h-6 w-6" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-semibold text-fg">EunoDoc™ Official Electronic Signature</h3>
                <BaseBadge v-if="eunoAgreement?.is_completed" variant="success">Executed & Verified</BaseBadge>
                <BaseBadge v-else-if="eunoAgreement?.status === 'inprogress'" variant="warning">In Progress</BaseBadge>
                <BaseBadge v-else variant="secondary">Ready for E-Sign</BaseBadge>
              </div>
              <p class="text-xs text-fg-muted mt-1 max-w-xl">
                Electronically sign the complete statutory listing disclosure packet via Reozom's proprietary EunoDoc engine with legal coordinate tagging, multi-party tracking, and encrypted audit trails.
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 sm:shrink-0">
            <BaseButton
              v-if="!eunoAgreement?.is_completed"
              variant="primary"
              :loading="isInitiatingEuno"
              @click="handleInitiateEunoSign"
            >
              <PenTool class="mr-2 h-4 w-4" />
              {{ eunoAgreement?.has_agreement ? 'Resume Signing via EunoDoc' : 'Sign Packet via EunoDoc' }}
            </BaseButton>

            <BaseButton
              v-if="eunoAgreement?.has_agreement"
              variant="secondary"
              size="sm"
              :loading="isCheckingEunoStatus"
              title="Sync latest signature status from EunoDoc"
              @click="checkEunoStatus"
            >
              <RefreshCw class="mr-1.5 h-3.5 w-3.5" :class="{ 'animate-spin': isCheckingEunoStatus }" />
              Sync Status
            </BaseButton>

            <BaseButton
              v-if="eunoAgreement?.has_signed_pdf"
              variant="secondary"
              size="sm"
              @click="handleOpenSignedDoc"
            >
              <Download class="mr-1.5 h-3.5 w-3.5" />
              Signed PDF
            </BaseButton>

            <BaseButton
              v-if="eunoAgreement?.has_audit_pdf"
              variant="secondary"
              size="sm"
              @click="handleOpenAuditReport"
            >
              <ExternalLink class="mr-1.5 h-3.5 w-3.5" />
              Audit Report
            </BaseButton>
          </div>
        </div>
      </BaseCard>

      <!-- Section 1: Statutory Listing Agreements & Disclosures -->
      <BaseCard class="p-6">
        <div class="mb-4 flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 class="text-base font-semibold text-fg">Statutory Agreements & Disclosures</h2>
            <p class="text-xs text-fg-muted">
              Mandated by state and federal law. Generated from your property disclosures questionnaire.
            </p>
          </div>
          <BaseBadge :variant="allStatutorySigned ? 'success' : 'warning'">
            {{ allStatutorySigned ? 'All Signed' : 'Signatures Required' }}
          </BaseBadge>
        </div>

        <div class="divide-y divide-border">
          <div
            v-for="doc in statutoryDocuments"
            :key="doc.id"
            class="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <FileText class="h-4 w-4 text-primary" />
                <span class="font-medium text-fg text-sm">{{ doc.label }}</span>
                <span v-if="doc.required" class="text-xs font-bold text-danger">*</span>
              </div>
              <p class="text-xs text-fg-muted">{{ doc.description }}</p>
              <div v-if="doc.signedAt" class="text-[11px] text-success flex items-center gap-1 font-medium">
                <CheckCircle2 class="h-3 w-3" />
                Signed by {{ doc.signedBy }} on {{ new Date(doc.signedAt).toLocaleDateString() }}
              </div>
            </div>

            <div class="flex items-center gap-2">
              <BaseBadge :variant="doc.status === 'signed' ? 'success' : 'warning'">
                {{ doc.status === 'signed' ? 'Signed' : 'Not Signed' }}
              </BaseBadge>

              <BaseButton
                size="sm"
                variant="secondary"
                title="Preview Document Content"
                @click="handleOpenPreview(doc)"
              >
                <Eye class="mr-1 h-3.5 w-3.5" />
                Preview
              </BaseButton>

              <BaseButton
                v-if="doc.status !== 'signed'"
                size="sm"
                variant="primary"
                title="E-Sign Document"
                @click="handleOpenSign(doc)"
              >
                <PenTool class="mr-1 h-3.5 w-3.5" />
                Sign
              </BaseButton>

              <BaseButton
                size="sm"
                variant="secondary"
                title="Download Document"
                @click="handleDownload(doc)"
              >
                <Download class="h-3.5 w-3.5" />
              </BaseButton>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Section 2: Supplementary Document Uploads -->
      <BaseCard class="p-6">
        <div class="mb-4 border-b border-border pb-3">
          <h2 class="text-base font-semibold text-fg">Upload Supplementary Property Documents</h2>
          <p class="text-xs text-fg-muted">
            Upload supporting records like Property Deed, Survey, Home Warranty, HOA Bylaws, or Water Tests.
          </p>
        </div>

        <!-- Upload Widget -->
        <div class="rounded-xl border border-border bg-bg-muted/30 p-4 mb-6">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
            <div class="md:col-span-5">
              <label class="block text-xs font-semibold text-fg mb-1">Document Category *</label>
              <select
                v-model="selectedDocType"
                class="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-fg focus:border-primary focus:outline-none"
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
                class="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-fg focus:border-primary focus:outline-none"
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
                class="shrink-0"
                @click="handleUploadSupplementary"
              >
                <Upload class="mr-1 h-3.5 w-3.5" />
                Upload
              </BaseButton>
            </div>
          </div>
        </div>

        <!-- Uploaded Documents Table -->
        <div v-if="uploadedSupplementaryDocuments.length === 0" class="text-center py-6 text-xs text-fg-muted">
          No supplementary documents uploaded yet. Upload deeds, surveys, or inspection reports above.
        </div>

        <div v-else class="divide-y divide-border">
          <div
            v-for="doc in uploadedSupplementaryDocuments"
            :key="doc.id"
            class="flex items-center justify-between py-3"
          >
            <div class="flex items-center gap-3">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-muted text-fg-muted">
                <FileCheck class="h-4 w-4" />
              </div>
              <div>
                <div class="font-medium text-xs text-fg">{{ doc.fileName || doc.label }}</div>
                <div class="text-[11px] text-fg-muted flex items-center gap-2">
                  <span>{{ doc.label }}</span>
                  <span v-if="doc.fileSize">â€¢ {{ Math.round(doc.fileSize / 1024) }} KB</span>
                  <span v-if="doc.uploadedAt">â€¢ {{ new Date(doc.uploadedAt).toLocaleDateString() }}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <BaseBadge
                :variant="doc.verificationStatus === 'approved' ? 'success' : doc.verificationStatus === 'rejected' ? 'danger' : 'info'"
              >
                {{ (doc.verificationStatus || 'Uploaded').toUpperCase() }}
              </BaseBadge>

              <BaseButton size="sm" variant="secondary" title="Download" @click="handleDownload(doc)">
                <Download class="h-3.5 w-3.5" />
              </BaseButton>

              <BaseButton size="sm" variant="danger" title="Remove" @click="handleRemove(doc)">
                <Trash2 class="h-3.5 w-3.5" />
              </BaseButton>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Navigation Bar -->
      <div class="flex items-center justify-between pt-4">
        <BaseButton variant="secondary" @click="handleBack">
          <ArrowLeft class="mr-2 h-4 w-4" />
          Back to Disclosures
        </BaseButton>

        <BaseButton @click="handleContinue">
          Save & Continue to Review
          <ArrowRight class="ml-2 h-4 w-4" />
        </BaseButton>
      </div>
    </div>

    <!-- Document Preview Modal (Reozom iframe/HTML view) -->
    <Modal v-model="isPreviewModalOpen" size="lg" :title="`Preview: ${previewTitle}`">
      <div v-if="isLoadingPreview" class="p-8 text-center">
        <LoadingState label="Rendering statutory document preview..." />
      </div>
      <div v-else class="space-y-4">
        <div class="max-h-[650px] overflow-y-auto rounded-lg border border-border bg-white p-2">
          <div v-html="previewHtml"></div>
        </div>
        <div class="flex justify-end gap-2 pt-2 border-t border-border">
          <BaseButton variant="secondary" @click="isPreviewModalOpen = false">Close</BaseButton>
        </div>
      </div>
    </Modal>

    <!-- E-Sign Document Modal -->
    <Modal v-model="isSignModalOpen" size="md" :title="`Electronic Signature: ${documentToSign?.label}`">
      <div v-if="documentToSign" class="space-y-4">
        <p class="text-sm text-fg-muted">
          Under statutory law, by clicking <strong>Confirm & Sign</strong> below, you certify that the statements in
          <strong class="text-fg">{{ documentToSign.label }}</strong> are accurate and legally binding.
        </p>

        <div>
          <label class="block text-xs font-semibold text-fg mb-1">Full Legal Name (Electronic Signature) *</label>
          <input
            v-model="signerFullName"
            type="text"
            placeholder="e.g. Jane Doe"
            class="w-full rounded border border-border bg-bg p-2.5 text-sm font-medium text-fg focus:border-primary focus:outline-none"
          />
        </div>

        <div class="rounded-lg bg-bg-muted/40 p-3 text-xs text-fg-muted">
          Your signature will be timestamped with your name, user ID, and IP address for audit and MLS compliance.
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t border-border">
          <BaseButton variant="secondary" :disabled="isSigning" @click="isSignModalOpen = false">
            Cancel
          </BaseButton>
          <BaseButton :loading="isSigning" :disabled="!signerFullName.trim()" @click="handleConfirmSign">
            <PenTool class="mr-1.5 h-3.5 w-3.5" />
            Confirm & Sign
          </BaseButton>
        </div>
      </div>
    </Modal>
  </div>
</template>
