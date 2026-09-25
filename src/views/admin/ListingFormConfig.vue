<template>
  <div class="flex h-screen bg-white font-sans text-neutral-900 relative overflow-hidden">
    <!-- Mobile Sidebar Overlay -->
    <div 
      v-if="mobileMenuOpen" 
      class="fixed inset-0 bg-black/50 z-30 md:hidden" 
      @click="mobileMenuOpen = false"
    ></div>

    <!-- Sidebar -->
    <div :class="[
      'absolute inset-y-0 left-0 z-40 transform transition-transform duration-300 md:relative md:translate-x-0 h-full',
      mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
    ]">
      <Sidebar
        :steps="formStore.steps"
        :active-step-id="formStore.activeStepId"
        @select-step="handleSelectStep"
        @add-step="handleAddStep"
        @edit-step="handleEditStep"
        @delete-step="handleConfirmDeleteStep"
        @drag-step="handleDragStep"
      />
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-w-0 w-full">
      <!-- Header -->
      <header class="border-b border-neutral-300 bg-white px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-10 shrink-0">
        <div class="flex items-center gap-3">
          <button 
            class="md:hidden p-1.5 text-neutral-500 hover:text-primary hover:bg-neutral-100 rounded transition"
            @click="mobileMenuOpen = true"
          >
            <IconMenu2 :size="24" />
          </button>
          <h1 class="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight truncate max-w-[200px] md:max-w-none">{{ currentProcess?.name || 'Listing Form' }}</h1>
        </div>
        <div class="flex items-center gap-2 md:gap-4">
          <button
            @click="handlePreview"
            class="hidden md:block px-4 py-2 text-sm font-medium text-primary bg-primary-soft hover:bg-primary/10 rounded transition"
          >
            Preview Wizard
          </button>
          <button
            @click="formStore.saveAll"
            class="px-3 md:px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            :disabled="!formStore.hasChanges"
          >
            Save All
          </button>
          <button
            @click="formStore.discardChanges"
            class="hidden md:block px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!formStore.hasChanges"
          >
            Discard
          </button>
          <button
            @click="handleResetDefaults"
            class="hidden md:block px-4 py-2 text-sm font-medium text-danger bg-red-50 hover:bg-red-100 rounded transition"
          >
            Reset to Defaults
          </button>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="flex-1 overflow-y-auto p-4 md:p-6 bg-neutral-50/50">
        <div v-if="activeStep" class="max-w-4xl mx-auto">
          <!-- Step Header -->
          <div class="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 class="text-xl md:text-2xl font-bold text-neutral-900">{{ activeStep.name }}</h2>
              <p class="text-sm text-neutral-500 mt-1" v-if="activeStep.description">{{ activeStep.description }}</p>
            </div>
            
            <button
              @click="handleAddSection"
              class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded transition shrink-0 self-start md:self-auto"
            >
              <IconPlus :size="16" /> Add Section
            </button>
          </div>

          <!-- Tabs -->
          <div class="flex items-center gap-4 mb-6 border-b border-neutral-200 overflow-x-auto pb-px">
            <button
              v-for="tab in ['all', 'active', 'issues']"
              :key="tab"
              @click="activeTab = tab"
              :class="[
                'px-4 py-3 text-sm font-medium transition whitespace-nowrap border-b-2',
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              ]"
            >
              {{ getTabLabel(tab) }}
            </button>
          </div>

          <!-- Empty State -->
          <div
            v-if="!activeStep.sections || activeStep.sections.length === 0"
            class="text-center py-12 bg-white rounded-lg border border-neutral-200 border-dashed"
          >
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-soft text-primary mb-4">
              <IconPlus :size="24" />
            </div>
            <h3 class="text-lg font-medium text-neutral-900 mb-1">No sections yet</h3>
            <p class="text-sm text-neutral-500 mb-4 max-w-sm mx-auto">
              Create a section to group your fields.
            </p>
            <button
              @click="handleAddSection"
              class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary-soft hover:bg-primary/20 rounded transition"
            >
              <IconPlus :size="16" /> Add First Section
            </button>
          </div>

          <!-- Sections List -->
          <div v-else class="space-y-6">
            <div 
              v-for="section in activeStep.sections" 
              :key="section.id"
              class="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden"
              draggable="true"
              @dragstart="handleSectionDragStart($event, section)"
              @dragover.prevent
              @drop="handleSectionDrop($event, section)"
            >
              <!-- Section Header -->
              <div class="px-6 py-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between cursor-grab active:cursor-grabbing">
                <div class="flex items-center gap-3">
                  <div class="text-neutral-400">
                    <IconGripVertical :size="20" />
                  </div>
                  <div>
                    <h3 class="text-base font-semibold text-neutral-900">{{ section.name }}</h3>
                    <p class="text-xs text-neutral-500" v-if="section.description">{{ section.description }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    @click.stop="handleAddField(section.id)"
                    class="p-2 text-primary hover:bg-primary-soft rounded transition"
                    title="Add Field to Section"
                  >
                    <IconPlus :size="18" />
                  </button>
                  <button
                    @click.stop="handleEditSection(section)"
                    class="p-2 text-neutral-400 hover:text-primary hover:bg-neutral-100 rounded transition"
                    title="Edit Section"
                  >
                    <IconEdit :size="18" />
                  </button>
                  <button
                    @click.stop="handleConfirmDeleteSection(section)"
                    class="p-2 text-neutral-400 hover:text-danger hover:bg-red-50 rounded transition"
                    title="Delete Section"
                  >
                    <IconTrash :size="18" />
                  </button>
                </div>
              </div>

              <!-- Fields Table -->
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr class="bg-white border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      <th class="w-10 px-4 py-3 text-center"></th>
                      <th class="px-4 py-3">Field Name</th>
                      <th class="px-4 py-3">Type</th>
                      <th class="w-24 px-4 py-3 text-center">Required</th>
                      <th class="w-24 px-4 py-3 text-center">Active</th>
                      <th class="w-24 px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <FieldTableRow
                      v-for="field in getFilteredFields(section.fields)"
                      :key="field.id"
                      :field="field"
                      draggable="true"
                      @dragstart="handleFieldDragStart($event, field, section.id)"
                      @dragover.prevent
                      @drop.stop="handleFieldDrop($event, field, section.id)"
                      @toggle-required="updateField(section.id, field.id, { required: $event })"
                      @toggle-active="updateField(section.id, field.id, { active: $event })"
                      @edit="handleEditField(field, section.id)"
                      @delete="handleConfirmDeleteField(field, section.id)"
                    />
                    <tr v-if="getFilteredFields(section.fields).length === 0">
                      <td colspan="6" class="px-4 py-8 text-center text-sm text-neutral-500 bg-neutral-50">
                        No fields in this section matching the current view.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="flex h-full items-center justify-center">
          <p class="text-neutral-500">Select a step from the sidebar</p>
        </div>
      </main>
    </div>

    <!-- Field Modal -->
    <FieldModal
      :is-open="fieldModalOpen"
      :is-editing="editingField !== null"
      :field-data="editingField"
      :available-parent-fields="availableParentFields"
      @close="fieldModalOpen = false"
      @save="handleSaveField"
    />

    <!-- Step Modal -->
    <StepModal
      :is-open="stepModalOpen"
      :is-editing="editingStep !== null"
      :step-data="editingStep"
      @close="stepModalOpen = false"
      @save="handleSaveStep"
    />

    <!-- Section Modal -->
    <SectionModal
      :is-open="sectionModalOpen"
      :is-editing="editingSection !== null"
      :section-data="editingSection"
      @close="sectionModalOpen = false"
      @save="handleSaveSection"
    />

    <!-- Preview Modal -->
    <PreviewModal
      :is-open="previewModalOpen"
      :active-step="previewActiveStep"
      :has-previous="hasPrevPreviewStep"
      :has-next="hasNextPreviewStep"
      @close="previewModalOpen = false"
      @next="handleNextPreviewStep"
      @prev="handlePrevPreviewStep"
    />

    <!-- Confirmation Dialog -->
    <ConfirmDialog
      v-if="deleteConfirm.open"
      :title="deleteConfirm.title"
      :message="deleteConfirm.message"
      @confirm="deleteConfirm.onConfirm"
      @cancel="deleteConfirm.open = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useFormConfigStore } from '../../stores/formConfig'
import { useProcessStore } from '../../stores/processStore'
import { IconPlus, IconMenu2, IconGripVertical, IconEdit, IconTrash } from '@tabler/icons-vue'
import Sidebar from '../../components/Sidebar.vue'
import FieldTableRow from '../../components/FieldTableRow.vue'
import FieldModal from '../../components/FieldModal.vue'
import StepModal from '../../components/StepModal.vue'
import SectionModal from '../../components/SectionModal.vue'
import PreviewModal from '../../components/PreviewModal.vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'

const formStore = useFormConfigStore()
const processStore = useProcessStore()
const router = useRouter()
const route = useRoute()
const activeTab = ref('all')
const mobileMenuOpen = ref(false)

onMounted(async () => {
  const processId = route.params.id
  if (!processId || processId === 'undefined') {
    console.error('Invalid process ID:', processId)
    router.push('/admin/listing-processes')
    return
  }
  await formStore.loadProcess(processId)
})
const currentProcess = computed(() => processStore.getProcessById(route.params.id))

const fieldModalOpen = ref(false)
const editingField = ref(null)
const currentSectionIdForField = ref(null)

const stepModalOpen = ref(false)
const editingStep = ref(null)

const sectionModalOpen = ref(false)
const editingSection = ref(null)

const previewModalOpen = ref(false)

// Prevent unsaved changes from being lost on window close
const handleBeforeUnload = (e) => {
  if (formStore.hasChanges) {
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})


const deleteConfirm = ref({
  open: false,
  title: '',
  message: '',
  onConfirm: null
})

// --- Computed Properties ---
const activeStep = computed(() => formStore.activeStep)

const getFilteredFields = (fields) => {
  if (!fields) return []
  if (activeTab.value === 'active') return fields.filter(f => f.active)
  if (activeTab.value === 'issues') return fields.filter(f => !f.active)
  return fields
}

const getTabLabel = (tab) => {
  let total = 0
  let count = 0
  
  if (activeStep.value?.sections) {
    activeStep.value.sections.forEach(sec => {
      const fields = sec.fields || []
      total += fields.length
      if (tab === 'active') count += fields.filter(f => f.active).length
      if (tab === 'issues') count += fields.filter(f => !f.active).length
    })
  }

  if (tab === 'all') return `All Fields (${total})`
  if (tab === 'active') return `Active (${count})`
  if (tab === 'issues') return `Issues (${count})`
}

const availableParentFields = computed(() => {
  const fields = []
  if (activeStep.value?.sections) {
    activeStep.value.sections.forEach(sec => {
      if (sec.fields) {
        fields.push(...sec.fields)
      }
    })
  }
  return fields.map(f => ({ label: f.label, value: f.id }))
})

const handleSelectStep = (stepId) => {
  formStore.setActiveStep(stepId)
  mobileMenuOpen.value = false
}

const handleAddStep = () => {
  editingStep.value = null
  stepModalOpen.value = true
}

const handleSaveStep = (stepData) => {
  if (editingStep.value) {
    formStore.updateStep(editingStep.value.id, stepData)
  } else {
    formStore.addStep(stepData)
  }
  stepModalOpen.value = false
}

const handleEditStep = (step) => {
  editingStep.value = { ...step }
  stepModalOpen.value = true
}

const handleConfirmDeleteStep = (step) => {
  deleteConfirm.value = {
    open: true,
    title: 'Delete Step',
    message: `Are you sure you want to delete "${step.name}" and all its fields? This cannot be undone.`,
    onConfirm: () => {
      formStore.deleteStep(step.id)
      deleteConfirm.value.open = false
    }
  }
}

const handleResetDefaults = () => {
  deleteConfirm.value = {
    open: true,
    title: 'Reset to Defaults',
    message: 'Are you sure you want to restore all form configurations back to their original default state? This will erase all custom changes and cannot be undone.',
    onConfirm: () => {
      formStore.resetData()
      deleteConfirm.value.open = false
    }
  }
}

// Drag & Drop for Steps
const handleDragStep = ({ source, target }) => {
  const steps = [...formStore.steps]
  const sourceIndex = steps.findIndex(s => s.id === source.id)
  const targetIndex = steps.findIndex(s => s.id === target.id)
  
  steps.splice(sourceIndex, 1)
  steps.splice(targetIndex, 0, source)
  
  steps.forEach((step, idx) => {
    step.order = idx + 1
  })
  
  formStore.steps = steps
  formStore.hasChanges = true
  formStore.autoSave()
}

// --- Section Handlers ---
const handleAddSection = () => {
  editingSection.value = null
  sectionModalOpen.value = true
}

const handleEditSection = (section) => {
  editingSection.value = { ...section }
  sectionModalOpen.value = true
}

const handleSaveSection = (sectionData) => {
  if (editingSection.value) {
    formStore.updateSection(formStore.activeStepId, editingSection.value.id, sectionData)
  } else {
    formStore.addSection(formStore.activeStepId, sectionData)
  }
  sectionModalOpen.value = false
}

const handleConfirmDeleteSection = (section) => {
  deleteConfirm.value = {
    open: true,
    title: 'Delete Section',
    message: `Are you sure you want to delete "${section.name}" and all its fields?`,
    onConfirm: () => {
      formStore.deleteSection(formStore.activeStepId, section.id)
      deleteConfirm.value.open = false
    }
  }
}

// --- Drag & Drop for Sections ---
let draggedSection = null

const handleSectionDragStart = (e, section) => {
  draggedSection = section
  e.dataTransfer.effectAllowed = 'move'
}

const handleSectionDrop = (e, targetSection) => {
  if (draggedSection && draggedSection.id !== targetSection.id) {
    const sections = activeStep.value.sections
    const sourceIdx = sections.findIndex(s => s.id === draggedSection.id)
    const targetIdx = sections.findIndex(s => s.id === targetSection.id)
    
    sections.splice(sourceIdx, 1)
    sections.splice(targetIdx, 0, draggedSection)
    
    sections.forEach((sec, idx) => {
      sec.order = idx + 1
    })
    
    formStore.hasChanges = true
    formStore.autoSave()
  }
  draggedSection = null
}

// --- Field Handlers ---
const handleAddField = (sectionId) => {
  currentSectionIdForField.value = sectionId
  editingField.value = null
  fieldModalOpen.value = true
}

const handleEditField = (field, sectionId) => {
  currentSectionIdForField.value = sectionId
  editingField.value = { ...field }
  fieldModalOpen.value = true
}

const handleSaveField = (fieldData) => {
  if (editingField.value) {
    formStore.updateField(formStore.activeStepId, currentSectionIdForField.value, editingField.value.id, fieldData)
  } else {
    formStore.addField(formStore.activeStepId, currentSectionIdForField.value, fieldData)
  }
  fieldModalOpen.value = false
}

const handleConfirmDeleteField = (field, sectionId) => {
  deleteConfirm.value = {
    open: true,
    title: 'Delete Field',
    message: `Are you sure you want to delete "${field.label}"?`,
    onConfirm: () => {
      formStore.deleteField(formStore.activeStepId, sectionId, field.id)
      deleteConfirm.value.open = false
    }
  }
}

const updateField = (sectionId, fieldId, updates) => {
  formStore.updateField(formStore.activeStepId, sectionId, fieldId, updates)
}

// --- Drag & Drop for Fields ---
let draggedField = null
let draggedFieldSourceSectionId = null

const handleFieldDragStart = (e, field, sectionId) => {
  draggedField = field
  draggedFieldSourceSectionId = sectionId
  e.dataTransfer.effectAllowed = 'move'
}

const handleFieldDrop = (e, targetField, targetSectionId) => {
  if (draggedField && (draggedField.id !== targetField.id || draggedFieldSourceSectionId !== targetSectionId)) {
    const sourceSection = activeStep.value.sections.find(s => s.id === draggedFieldSourceSectionId)
    const targetSection = activeStep.value.sections.find(s => s.id === targetSectionId)
    
    if (sourceSection && targetSection) {
      const sourceIdx = sourceSection.fields.findIndex(f => f.id === draggedField.id)
      const targetIdx = targetSection.fields.findIndex(f => f.id === targetField.id)
      
      // Remove from source
      sourceSection.fields.splice(sourceIdx, 1)
      
      // Add to target
      targetSection.fields.splice(targetIdx, 0, draggedField)
      
      formStore.hasChanges = true
      formStore.autoSave()
    }
  }
  draggedField = null
  draggedFieldSourceSectionId = null
}

// --- Preview Navigation ---
const previewActiveStepIndex = ref(0)

const previewActiveStep = computed(() => {
  if (formStore.steps.length === 0) return null
  return formStore.steps[previewActiveStepIndex.value]
})

const hasPrevPreviewStep = computed(() => previewActiveStepIndex.value > 0)
const hasNextPreviewStep = computed(() => previewActiveStepIndex.value < formStore.steps.length - 1)

const handlePreview = () => {
  router.push(`/preview/${route.params.id}`)
}

const handleNextPreviewStep = () => {
  if (hasNextPreviewStep.value) {
    previewActiveStepIndex.value++
  }
}

const handlePrevPreviewStep = () => {
  if (hasPrevPreviewStep.value) {
    previewActiveStepIndex.value--
  }
}
</script>
