<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
import {
  fetchAdminDisclosures,
  createAdminDisclosure,
  updateAdminDisclosure,
  deleteAdminDisclosure,
  toggleAdminDisclosure,
  duplicateAdminDisclosure,
  type PropertyDisclosure,
  type DisclosureSection,
  type DisclosureField,
} from '@/services/adminDisclosureService'

const toast = useToastStore()

// State
const disclosures = ref<PropertyDisclosure[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const selectedState = ref('ALL')
const selectedPropertyType = ref('all')
const selectedStatus = ref('all')

// Modals
const isFormModalOpen = ref(false)
const isPreviewModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isSaving = ref(false)
const activeTab = ref<'info' | 'questions'>('info')

const editingDisclosure = ref<PropertyDisclosure | null>(null)
const previewingDisclosure = ref<PropertyDisclosure | null>(null)
const deletingDisclosure = ref<PropertyDisclosure | null>(null)

// Form state
interface FormState {
  title: string
  code: string
  state_code: string
  property_type: string
  category: string
  description: string
  order: number
  is_required: boolean
  is_active: boolean
  sections: DisclosureSection[]
}

const defaultForm = (): FormState => ({
  title: '',
  code: '',
  state_code: 'ALL',
  property_type: 'all',
  category: 'statutory',
  description: '',
  order: 1,
  is_required: true,
  is_active: true,
  sections: [
    {
      id: 'general_section_1',
      name: 'General Conditions',
      order: 1,
      fields: [
        {
          id: 'question_1',
          name: 'question_1',
          label: 'Are you aware of any material defects on the property?',
          type: 'select',
          required: true,
          placeholder: '',
          options: [
            { label: 'No', value: 'no' },
            { label: 'Yes (Explain below)', value: 'yes' },
            { label: 'Unknown', value: 'unknown' },
          ],
        },
      ],
    },
  ],
})

const form = ref<FormState>(defaultForm())

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

onMounted(() => {
  loadDisclosures()
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

// Open Create Modal
function openCreateModal() {
  editingDisclosure.value = null
  form.value = defaultForm()
  form.value.order = disclosures.value.length + 1
  activeTab.value = 'info'
  isFormModalOpen.value = true
}

// Open Edit Modal
function openEditModal(d: PropertyDisclosure) {
  editingDisclosure.value = d
  form.value = {
    title: d.title,
    code: d.code,
    state_code: d.state_code || 'ALL',
    property_type: d.property_type || 'all',
    category: d.category || 'statutory',
    description: d.description || '',
    order: d.order || 1,
    is_required: d.is_required,
    is_active: d.is_active,
    sections: JSON.parse(JSON.stringify(d.schema?.sections || [])),
  }
  activeTab.value = 'info'
  isFormModalOpen.value = true
}

// Save (Create or Update)
async function handleSave() {
  if (!form.value.title.trim()) {
    toast.error('Disclosure title is required.')
    return
  }

  isSaving.value = true
  try {
    const payload = {
      title: form.value.title.trim(),
      code: form.value.code.trim() || undefined,
      state_code: form.value.state_code === 'ALL' ? null : form.value.state_code,
      property_type: form.value.property_type === 'all' ? null : form.value.property_type,
      category: form.value.category,
      description: form.value.description,
      order: form.value.order,
      is_required: form.value.is_required,
      is_active: form.value.is_active,
      schema: {
        sections: form.value.sections,
      },
    }

    if (editingDisclosure.value) {
      await updateAdminDisclosure(editingDisclosure.value.id, payload)
      toast.success('Disclosure updated successfully.')
    } else {
      await createAdminDisclosure(payload)
      toast.success('New dynamic disclosure created successfully.')
    }

    isFormModalOpen.value = false
    await loadDisclosures()
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Failed to save disclosure.')
  } finally {
    isSaving.value = false
  }
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

// Section & Field Builder Helpers
function addSection() {
  const nextNum = form.value.sections.length + 1
  form.value.sections.push({
    id: `section_${nextNum}`,
    name: `New Section ${nextNum}`,
    order: nextNum,
    fields: [
      {
        id: `field_${Date.now()}`,
        label: 'New Disclosure Question',
        type: 'select',
        required: true,
        placeholder: '',
        options: [
          { label: 'No', value: 'no' },
          { label: 'Yes', value: 'yes' },
          { label: 'Unknown', value: 'unknown' },
        ],
      },
    ],
  })
}

function removeSection(index: number) {
  if (form.value.sections.length === 1) {
    toast.error('A disclosure must contain at least one section.')
    return
  }
  form.value.sections.splice(index, 1)
}

function addField(section: DisclosureSection) {
  const nextNum = section.fields.length + 1
  section.fields.push({
    id: `question_${Date.now()}_${nextNum}`,
    label: `Question ${nextNum}`,
    type: 'select',
    required: true,
    placeholder: '',
    options: [
      { label: 'No', value: 'no' },
      { label: 'Yes', value: 'yes' },
      { label: 'Unknown', value: 'unknown' },
    ],
  })
}

function removeField(section: DisclosureSection, index: number) {
  if (section.fields.length === 1) {
    toast.error('A section must have at least one question.')
    return
  }
  section.fields.splice(index, 1)
}

function addOption(field: DisclosureField) {
  if (!field.options) field.options = []
  field.options.push({ label: 'New Option', value: `option_${field.options.length + 1}` })
}

function removeOption(field: DisclosureField, index: number) {
  if (field.options && field.options.length > 1) {
    field.options.splice(index, 1)
  }
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
        <BaseButton variant="primary" @click="openCreateModal">
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
            <option value="MI">MI - Michigan</option>
            <option value="FL">FL - Florida</option>
            <option value="CA">CA - California</option>
            <option value="TX">TX - Texas</option>
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
            <BaseButton size="sm" @click="openCreateModal">Create Disclosure</BaseButton>
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

              <!-- Category Badge -->
              <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize bg-surface-raised border border-border text-fg-muted">
                {{ d.category }}
              </span>

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
              <span>&bull;</span>
              <span>Order: <strong>#{{ d.order }}</strong></span>
              <span v-if="d.is_required" class="text-rose-600 dark:text-rose-400 font-semibold">
                &bull; Mandatory for Publishing
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
              @click="openEditModal(d)"
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

    <!-- CREATE / EDIT FULL BUILDER MODAL -->
    <Teleport to="body">
      <div v-if="isFormModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" @click="isFormModalOpen = false"></div>

        <div class="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden">
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-6 border-b border-border bg-surface-raised/40">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {{ editingDisclosure ? 'Edit Dynamic Disclosure' : 'New Dynamic Disclosure' }}
                </span>
                <span class="text-xs text-fg-muted font-medium">Admin Controlled</span>
              </div>
              <h2 class="text-xl font-bold text-fg mt-1">
                {{ form.title || 'Untitled Property Disclosure' }}
              </h2>
            </div>
            <button class="p-1.5 rounded-lg hover:bg-surface-raised text-fg-muted hover:text-fg transition" @click="isFormModalOpen = false">
              <X class="h-5 w-5" />
            </button>
          </div>

          <!-- Tabs Navigation -->
          <div class="flex border-b border-border px-6 bg-surface">
            <button
              class="py-3 px-4 text-sm font-semibold border-b-2 transition"
              :class="activeTab === 'info' ? 'border-primary text-primary' : 'border-transparent text-fg-muted hover:text-fg'"
              @click="activeTab = 'info'"
            >
              1. General & Scope Configuration
            </button>
            <button
              class="py-3 px-4 text-sm font-semibold border-b-2 transition flex items-center gap-2"
              :class="activeTab === 'questions' ? 'border-primary text-primary' : 'border-transparent text-fg-muted hover:text-fg'"
              @click="activeTab = 'questions'"
            >
              <span>2. Sections & Questions Builder</span>
              <span class="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
                {{ form.sections.reduce((acc, s) => acc + s.fields.length, 0) }}
              </span>
            </button>
          </div>

          <!-- Modal Scrollable Body -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <!-- TAB 1: General Info & Scope -->
            <div v-if="activeTab === 'info'" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-fg mb-1">Disclosure Title <span class="text-rose-500">*</span></label>
                  <input
                    v-model="form.title"
                    type="text"
                    placeholder="e.g. Property Condition & Foundation Disclosures"
                    class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-fg mb-1">Unique Identifier Code</label>
                  <input
                    v-model="form.code"
                    type="text"
                    placeholder="e.g. mi_property_conditions"
                    class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg font-mono focus:border-primary focus:outline-none"
                  />
                  <p class="text-[11px] text-fg-muted mt-1">Leave blank to auto-generate from title.</p>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-fg mb-1">State Scope</label>
                  <select
                    v-model="form.state_code"
                    class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg focus:border-primary focus:outline-none"
                  >
                    <option value="ALL">All States (Universal)</option>
                    <option value="MI">Michigan (MI)</option>
                    <option value="FL">Florida (FL)</option>
                    <option value="CA">California (CA)</option>
                    <option value="TX">Texas (TX)</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-fg mb-1">Property Type Scope</label>
                  <select
                    v-model="form.property_type"
                    class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg focus:border-primary focus:outline-none"
                  >
                    <option value="all">All Property Types</option>
                    <option value="residential">Residential Only</option>
                    <option value="vacant_land">Vacant Land Only</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-fg mb-1">Category</label>
                  <select
                    v-model="form.category"
                    class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg focus:border-primary focus:outline-none"
                  >
                    <option value="statutory">Statutory Condition</option>
                    <option value="lead_paint">Lead-Based Paint</option>
                    <option value="environmental">Environmental / Soils</option>
                    <option value="hoa">HOA & Common Areas</option>
                    <option value="custom">Custom Questionnaire</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-fg mb-1">Description / Legal Note</label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  placeholder="Explain legal purpose, statutory code citation, or seller instructions..."
                  class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg focus:border-primary focus:outline-none"
                ></textarea>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border">
                <div>
                  <label class="block text-xs font-semibold text-fg mb-1">Step Order Position</label>
                  <input
                    v-model.number="form.order"
                    type="number"
                    min="1"
                    class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg focus:border-primary focus:outline-none"
                  />
                </div>

                <div class="flex items-center gap-3 pt-5">
                  <input
                    id="is_required_chk"
                    v-model="form.is_required"
                    type="checkbox"
                    class="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label for="is_required_chk" class="text-xs font-semibold text-fg">
                    Mandatory for Publishing
                  </label>
                </div>

                <div class="flex items-center gap-3 pt-5">
                  <input
                    id="is_active_chk"
                    v-model="form.is_active"
                    type="checkbox"
                    class="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label for="is_active_chk" class="text-xs font-semibold text-fg">
                    Active (Visible to Sellers)
                  </label>
                </div>
              </div>
            </div>

            <!-- TAB 2: Sections & Questions Builder -->
            <div v-else class="space-y-6">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="text-sm font-bold text-fg">Sections & Question Form Groups</h4>
                  <p class="text-xs text-fg-muted">Structure the questions sellers will fill out during listing creation.</p>
                </div>
                <BaseButton size="sm" variant="secondary" @click="addSection">
                  <Plus class="h-3.5 w-3.5 mr-1" />
                  Add Section
                </BaseButton>
              </div>

              <!-- Sections Accordions -->
              <div v-for="(section, sIndex) in form.sections" :key="section.id" class="rounded-xl border border-border bg-surface-raised/30 p-5 space-y-4">
                <div class="flex items-center justify-between gap-4 border-b border-border pb-3">
                  <div class="flex items-center gap-3 flex-1">
                    <span class="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                      Section {{ sIndex + 1 }}
                    </span>
                    <input
                      v-model="section.name"
                      type="text"
                      placeholder="Section Title (e.g. Roof & Structural)"
                      class="flex-1 rounded-md border border-border bg-surface px-2.5 py-1 text-sm font-semibold text-fg focus:border-primary focus:outline-none"
                    />
                  </div>

                  <button
                    class="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded hover:bg-rose-50"
                    @click="removeSection(sIndex)"
                  >
                    Delete Section
                  </button>
                </div>

                <!-- Questions inside Section -->
                <div class="space-y-3 pl-2">
                  <div
                    v-for="(field, fIndex) in section.fields"
                    :key="field.id"
                    class="rounded-lg border border-border bg-surface p-4 space-y-3 shadow-xs"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div class="flex items-center gap-2 flex-1">
                        <span class="text-xs font-mono font-bold text-fg-muted">Q{{ fIndex + 1 }}.</span>
                        <input
                          v-model="field.label"
                          type="text"
                          placeholder="Enter disclosure question or statement..."
                          class="flex-1 rounded border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-fg focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div class="flex items-center gap-2">
                        <!-- Input Type -->
                        <select
                          v-model="field.type"
                          class="rounded border border-border bg-surface px-2 py-1 text-xs text-fg focus:border-primary focus:outline-none"
                        >
                          <option value="select">Select (Dropdown)</option>
                          <option value="radio">Radio Buttons</option>
                          <option value="text">Short Text</option>
                          <option value="textarea">Long Explanation</option>
                          <option value="checkbox">Single Checkbox</option>
                        </select>

                        <!-- Required Toggle -->
                        <label class="flex items-center gap-1 text-[11px] font-medium text-fg cursor-pointer">
                          <input v-model="field.required" type="checkbox" class="h-3.5 w-3.5 rounded text-primary" />
                          Req
                        </label>

                        <button
                          class="text-fg-muted hover:text-rose-600 p-1 rounded"
                          @click="removeField(section, fIndex)"
                          title="Remove Question"
                        >
                          <X class="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <!-- Options Editor for Select & Radio -->
                    <div v-if="['select', 'radio'].includes(field.type)" class="bg-surface-raised/40 p-3 rounded-md space-y-2">
                      <div class="flex items-center justify-between">
                        <span class="text-[11px] font-semibold text-fg-muted uppercase tracking-wider">Answer Choices</span>
                        <button class="text-[11px] font-bold text-primary hover:underline" @click="addOption(field)">
                          + Add Option
                        </button>
                      </div>

                      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div
                          v-for="(opt, optIdx) in field.options"
                          :key="optIdx"
                          class="flex items-center gap-1 bg-surface border border-border rounded px-2 py-1"
                        >
                          <input
                            v-model="opt.label"
                            type="text"
                            placeholder="Choice Label"
                            class="flex-1 text-xs bg-transparent focus:outline-none"
                          />
                          <button class="text-fg-muted hover:text-rose-600" @click="removeOption(field, optIdx)">
                            &times;
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <BaseButton size="sm" variant="ghost" class="text-xs" @click="addField(section)">
                    <Plus class="h-3 w-3 mr-1" />
                    Add Question to {{ section.name }}
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="flex items-center justify-between p-4 border-t border-border bg-surface">
            <span class="text-xs text-fg-muted">
              {{ form.sections.reduce((acc, s) => acc + s.fields.length, 0) }} total questions configured
            </span>

            <div class="flex items-center gap-3">
              <BaseButton variant="ghost" @click="isFormModalOpen = false">Cancel</BaseButton>
              <BaseButton variant="primary" :disabled="isSaving" @click="handleSave">
                {{ isSaving ? 'Saving...' : editingDisclosure ? 'Update Disclosure' : 'Create Disclosure' }}
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

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
