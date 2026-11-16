<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Copy,
  Edit2,
  Trash2,
  Eye,
  Sliders,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  AlertCircle,
  X,
} from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useToastStore } from '@/stores/toast'
import { fetchPublicStates, type PublicState } from '@/services/publicGeographyService'
import { fetchDocumentTemplates, type DocumentTemplateOption } from '@/services/listingProcessService'
import {
  fetchAdminDisclosures,
  deleteAdminDisclosure,
  toggleAdminDisclosure,
  duplicateAdminDisclosure,
  type PropertyDisclosure,
} from '@/services/adminDisclosureService'

const toast = useToastStore()
const router = useRouter()

// State
const disclosures = ref<PropertyDisclosure[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const selectedState = ref('ALL')
const selectedPropertyType = ref('all')
const selectedStatus = ref('all')

// Modals
const isPreviewModalOpen = ref(false)
const isDeleteModalOpen = ref(false)

const previewingDisclosure = ref<PropertyDisclosure | null>(null)
const deletingDisclosure = ref<PropertyDisclosure | null>(null)

// Load disclosures
async function loadDisclosures() {
  isLoading.value = true
  try {
    const res = await fetchAdminDisclosures()
    disclosures.value = Array.isArray(res) ? res : res.data || []
  } catch (err: any) {
    toast.error('Failed to load disclosures: ' + (err?.response?.data?.message || err.message))
  } finally {
    isLoading.value = false
  }
}

// Document templates, to show which documents each disclosure's answers produce
const documentTemplates = ref<DocumentTemplateOption[]>([])

function documentsFor(code: string) {
  return documentTemplates.value.filter((t) => (t.disclosure_codes || []).includes(code))
}

const states = ref<PublicState[]>([])

onMounted(async () => {
  loadDisclosures()
  fetchPublicStates()
    .then((res: any) => {
      const data = res?.data
      states.value = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
    })
    .catch(() => {
      states.value = []
    })
  try {
    documentTemplates.value = (await fetchDocumentTemplates()).data || []
  } catch {
    documentTemplates.value = []
  }
})

// Metrics
const totalQuestions = computed(() => {
  return disclosures.value.reduce((acc, d) => {
    const secs = d.schema?.sections || []
    return acc + secs.reduce((sAcc, s) => sAcc + (s.fields?.length || 0), 0)
  }, 0)
})

const activeDisclosuresCount = computed(() => {
  return disclosures.value.filter((d) => d.is_active).length
})

const uniqueStatesCount = computed(() => {
  const states = new Set(
    disclosures.value.map((d) => d.state_code).filter((s) => s && s !== 'ALL'),
  )
  return states.size
})

// Filtered list
const filteredDisclosures = computed(() => {
  return disclosures.value.filter((d) => {
    // Search
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      const match =
        d.title.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q))
      if (!match) return false
    }

    // State filter
    if (selectedState.value !== 'ALL') {
      if (d.state_code && d.state_code !== 'ALL' && d.state_code !== selectedState.value) {
        return false
      }
    }

    // Property type filter
    if (selectedPropertyType.value !== 'all') {
      if (d.property_type && d.property_type !== 'all' && d.property_type !== selectedPropertyType.value) {
        return false
      }
    }

    // Status filter
    if (selectedStatus.value !== 'all') {
      const isActive = selectedStatus.value === 'active'
      if (d.is_active !== isActive) return false
    }

    return true
  })
})

// Navigate to the full-page builder
function openCreatePage() {
  router.push({ name: 'admin-disclosure-create' })
}

function openEditPage(d: PropertyDisclosure) {
  router.push({ name: 'admin-disclosure-edit', params: { id: d.id } })
}

// Toggle status
async function handleToggle(d: PropertyDisclosure) {
  try {
    await toggleAdminDisclosure(d.id)
    d.is_active = !d.is_active
    toast.success(`Disclosure ${d.is_active ? 'activated' : 'moved to draft'}.`)
  } catch (err: any) {
    toast.error('Failed to change status.')
  }
}

// Duplicate
async function handleDuplicate(d: PropertyDisclosure) {
  try {
    await duplicateAdminDisclosure(d.id)
    toast.success('Disclosure duplicated as draft.')
    await loadDisclosures()
  } catch (err: any) {
    toast.error('Failed to duplicate disclosure.')
  }
}

// Delete
function openDeleteModal(d: PropertyDisclosure) {
  deletingDisclosure.value = d
  isDeleteModalOpen.value = true
}

async function confirmDelete() {
  if (!deletingDisclosure.value) return
  try {
    await deleteAdminDisclosure(deletingDisclosure.value.id)
    toast.success('Disclosure deleted successfully.')
    isDeleteModalOpen.value = false
    deletingDisclosure.value = null
    await loadDisclosures()
  } catch (err: any) {
    toast.error('Failed to delete disclosure.')
  }
}

// Open Preview Modal
function openPreview(d: PropertyDisclosure) {
  previewingDisclosure.value = d
  isPreviewModalOpen.value = true
}

</script>

<template>
  <div class="mx-auto flex w-full max-w-7xl flex-col gap-6 py-6 px-4 sm:px-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-border">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
            <ShieldCheck class="h-3.5 w-3.5" />
            ADMIN EXCLUSIVE
          </span>
          <span class="text-xs text-fg-muted font-medium">Dynamic Disclosures Engine</span>
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-fg">Statutory Property Disclosures</h1>
        <p class="text-sm text-fg-muted mt-1">
          Dynamically configure and govern property condition questionnaires, lead paint notices, and statutory disclosures required for all seller listings.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <BaseButton variant="primary" @click="openCreatePage">
          <Plus class="h-4 w-4 mr-1.5" />
          New Disclosure
        </BaseButton>
      </div>
    </div>

    <!-- Metrics Stats Bar -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <BaseCard class="p-4 flex flex-col justify-between">
        <span class="text-xs text-fg-muted font-medium uppercase tracking-wider">Total Disclosures</span>
        <span class="text-2xl font-bold text-fg mt-1">{{ disclosures.length }}</span>
      </BaseCard>

      <BaseCard class="p-4 flex flex-col justify-between">
        <span class="text-xs text-fg-muted font-medium uppercase tracking-wider">Active Disclosures</span>
        <span class="text-2xl font-bold text-emerald-600 mt-1">{{ activeDisclosuresCount }}</span>
      </BaseCard>

      <BaseCard class="p-4 flex flex-col justify-between">
        <span class="text-xs text-fg-muted font-medium uppercase tracking-wider">Total Questions</span>
        <span class="text-2xl font-bold text-indigo-600 mt-1">{{ totalQuestions }}</span>
      </BaseCard>

      <BaseCard class="p-4 flex flex-col justify-between">
        <span class="text-xs text-fg-muted font-medium uppercase tracking-wider">States Scoped</span>
        <span class="text-2xl font-bold text-fg mt-1">{{ uniqueStatesCount > 0 ? `${uniqueStatesCount} + All-States` : 'All-States' }}</span>
      </BaseCard>
    </div>

    <!-- Filter & Search Controls -->
    <BaseCard class="p-4">
      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <!-- Search bar -->
        <div class="relative flex-1">
          <Search class="h-4 w-4 text-fg-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search disclosures by title, code, or description..."
            class="w-full rounded-lg border border-border bg-surface pl-9 pr-4 py-2 text-sm text-fg placeholder:text-fg-muted/60 focus:border-primary focus:outline-none"
          />
        </div>

        <!-- Filter Selectors -->
        <div class="flex items-center gap-3 flex-wrap">
          <div class="flex items-center gap-1.5 text-xs text-fg-muted font-medium">
            <Sliders class="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>

          <!-- State -->
          <select
            v-model="selectedState"
            class="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-fg font-medium focus:border-primary focus:outline-none"
          >
            <option value="ALL">All States</option>
            <option v-for="s in states" :key="s.code" :value="s.code">{{ s.code }} - {{ s.name }}</option>
          </select>

          <!-- Property Type -->
          <select
            v-model="selectedPropertyType"
            class="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-fg font-medium focus:border-primary focus:outline-none"
          >
            <option value="all">All Property Types</option>
            <option value="residential">Residential Only</option>
            <option value="vacant_land">Vacant Land Only</option>
          </select>

          <!-- Status -->
          <select
            v-model="selectedStatus"
            class="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-fg font-medium focus:border-primary focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="draft">Draft Only</option>
          </select>
        </div>
      </div>
    </BaseCard>

    <!-- Disclosures List View -->
    <LoadingState v-if="isLoading" :rows="3" label="Loading dynamic disclosures..." />

    <div v-else-if="filteredDisclosures.length === 0">
      <BaseCard class="p-8 text-center">
        <EmptyState
          :icon="FileText"
          title="No disclosures match your filters"
          description="Try adjusting your search criteria or create a new statutory disclosure."
        >
          <template #action>
            <BaseButton size="sm" @click="openCreatePage">Create Disclosure</BaseButton>
          </template>
        </EmptyState>
      </BaseCard>
    </div>

    <div v-else class="space-y-4">
      <BaseCard
        v-for="d in filteredDisclosures"
        :key="d.id"
        class="p-6 transition hover:border-primary/40 shadow-xs"
        :class="{ 'border-l-4 border-l-primary': d.is_active, 'opacity-70 bg-surface-raised/40': !d.is_active }"
      >
        <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <!-- Main Content -->
          <div class="space-y-2 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                {{ d.code }}
              </span>

              <h3 class="text-base font-bold text-fg">{{ d.title }}</h3>

              <!-- State Badge -->
              <span
                class="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                :class="d.state_code ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' : 'bg-surface-raised text-fg-muted'"
              >
                {{ d.state_code ? `${d.state_code} Only` : 'All States' }}
              </span>

              <!-- Property Type Badge -->
              <span
                class="text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize"
                :class="d.property_type && d.property_type !== 'all' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' : 'bg-surface-raised text-fg-muted'"
              >
                {{ d.property_type ? d.property_type.replace('_', ' ') : 'All Types' }}
              </span>

              <!-- Status Badge -->
              <span
                class="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
                :class="d.is_active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'"
              >
                <CheckCircle2 v-if="d.is_active" class="h-3 w-3" />
                <XCircle v-else class="h-3 w-3" />
                {{ d.is_active ? 'Active' : 'Draft' }}
              </span>
            </div>

            <!-- Documents generated from this disclosure's answers -->
            <div v-if="documentsFor(d.code).length" class="flex items-center gap-1.5 flex-wrap text-[11px]">
              <span class="text-fg-muted">Generates:</span>
              <span
                v-for="t in documentsFor(d.code)"
                :key="t.code"
                class="px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 font-semibold"
              >{{ t.state_code }} · {{ t.name }}</span>
            </div>

            <p class="text-xs text-fg-muted max-w-3xl">
              {{ d.description || 'Statutory legal disclosure questionnaire.' }}
            </p>

            <!-- Metrics details -->
            <div class="flex items-center gap-4 text-xs text-fg-muted pt-1">
              <span><strong>{{ d.schema?.sections?.length || 0 }}</strong> Sections</span>
              <span>&bull;</span>
              <span>
                <strong>
                  {{ (d.schema?.sections || []).reduce((acc, s) => acc + (s.fields?.length || 0), 0) }}
                </strong> Questions
              </span>
            </div>
          </div>

          <!-- Action Controls -->
          <div class="flex items-center gap-2 shrink-0">
            <!-- Preview questions -->
            <button
              class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium text-fg hover:bg-surface-raised transition"
              @click="openPreview(d)"
              title="Preview Questions"
            >
              <Eye class="h-3.5 w-3.5" />
              <span>Preview</span>
            </button>

            <!-- Toggle Active / Draft -->
            <button
              class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition"
              :class="d.is_active ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100' : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'"
              @click="handleToggle(d)"
            >
              {{ d.is_active ? 'Set Draft' : 'Activate' }}
            </button>

            <!-- Duplicate -->
            <button
              class="p-1.5 rounded-lg border border-border text-fg-muted hover:text-fg hover:bg-surface-raised transition"
              @click="handleDuplicate(d)"
              title="Clone as new disclosure"
            >
              <Copy class="h-4 w-4" />
            </button>

            <!-- Edit -->
            <button
              class="p-1.5 rounded-lg border border-border text-indigo-600 hover:bg-indigo-50 transition"
              @click="openEditPage(d)"
              title="Edit Configuration & Questions"
            >
              <Edit2 class="h-4 w-4" />
            </button>

            <!-- Delete -->
            <button
              class="p-1.5 rounded-lg border border-border text-rose-600 hover:bg-rose-50 transition"
              @click="openDeleteModal(d)"
              title="Delete Disclosure"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- PREVIEW MODAL -->
    <Teleport to="body">
      <div v-if="isPreviewModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" @click="isPreviewModalOpen = false"></div>

        <div class="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-border bg-surface shadow-xl overflow-hidden">
          <div class="flex items-center justify-between p-5 border-b border-border">
            <div>
              <span class="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                {{ previewingDisclosure?.code }}
              </span>
              <h3 class="text-lg font-bold text-fg mt-1">{{ previewingDisclosure?.title }}</h3>
            </div>
            <button class="p-1 rounded-lg hover:bg-surface-raised text-fg-muted" @click="isPreviewModalOpen = false">
              <X class="h-5 w-5" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <div v-for="sec in previewingDisclosure?.schema?.sections" :key="sec.id" class="space-y-4">
              <h4 class="text-sm font-bold text-fg border-b border-border pb-1">{{ sec.name }}</h4>

              <div class="space-y-3">
                <div v-for="q in sec.fields" :key="q.id" class="rounded-lg border border-border p-3.5 bg-surface-raised/20 space-y-2">
                  <div class="flex items-start justify-between gap-2">
                    <label class="text-xs font-semibold text-fg">
                      {{ q.label }}
                      <span v-if="q.required" class="text-rose-500">*</span>
                    </label>
                    <span class="text-[10px] font-mono text-fg-muted uppercase">{{ q.type }}</span>
                  </div>

                  <!-- Visual preview controls -->
                  <div v-if="q.type === 'select'" class="w-full">
                    <select disabled class="w-full rounded border border-border bg-surface px-2.5 py-1.5 text-xs text-fg-muted">
                      <option v-for="opt in q.options" :key="opt.value">{{ opt.label }}</option>
                    </select>
                  </div>
                  <div v-else-if="q.type === 'radio'" class="flex gap-4">
                    <label v-for="opt in q.options" :key="opt.value" class="text-xs text-fg-muted flex items-center gap-1">
                      <input type="radio" disabled />
                      {{ opt.label }}
                    </label>
                  </div>
                  <div v-else-if="q.type === 'textarea'">
                    <textarea disabled rows="2" class="w-full rounded border border-border bg-surface p-2 text-xs text-fg-muted" placeholder="Seller notes..."></textarea>
                  </div>
                  <div v-else>
                    <input disabled type="text" class="w-full rounded border border-border bg-surface px-2 py-1 text-xs text-fg-muted" placeholder="Seller text..." />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="p-4 border-t border-border flex justify-end">
            <BaseButton variant="secondary" size="sm" @click="isPreviewModalOpen = false">Close Preview</BaseButton>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- DELETE CONFIRMATION MODAL -->
    <Teleport to="body">
      <div v-if="isDeleteModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" @click="isDeleteModalOpen = false"></div>

        <div class="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl space-y-4">
          <div class="flex items-center gap-3 text-rose-600">
            <AlertCircle class="h-6 w-6 shrink-0" />
            <h3 class="text-lg font-bold text-fg">Confirm Deletion</h3>
          </div>

          <p class="text-sm text-fg-muted">
            Are you sure you want to permanently delete the disclosure:
            <strong class="text-fg block mt-1 font-semibold">{{ deletingDisclosure?.title }}</strong>
            <span class="text-xs text-rose-500 block mt-2">
              Warning: Sellers of matching states/property types will no longer be prompted for this disclosure.
            </span>
          </p>

          <div class="flex items-center justify-end gap-3 pt-2">
            <BaseButton variant="ghost" size="sm" @click="isDeleteModalOpen = false">Cancel</BaseButton>
            <BaseButton variant="danger" size="sm" @click="confirmDelete">
              Delete Disclosure
            </BaseButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
