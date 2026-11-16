<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Plus, X } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import { useToastStore } from '@/stores/toast'
import { fetchPublicStates, type PublicState } from '@/services/publicGeographyService'
import {
  fetchAdminDisclosure,
  createAdminDisclosure,
  updateAdminDisclosure,
  type PropertyDisclosure,
  type DisclosureSection,
  type DisclosureField,
} from '@/services/adminDisclosureService'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()

const disclosureId = computed(() => (route.params.id ? Number(route.params.id) : null))
const isEditing = computed(() => disclosureId.value !== null)

const isLoading = ref(true)
const isSaving = ref(false)
const activeTab = ref<'info' | 'questions'>('info')

// Category, order, required and active are managed elsewhere (list page / Listing Process),
// so this form never sends them and editing leaves the saved values untouched.
interface FormState {
  title: string
  code: string
  state_code: string
  property_type: string
  description: string
  sections: DisclosureSection[]
}

const states = ref<PublicState[]>([])

// Keep a saved state visible even if it has since been deactivated, so editing doesn't silently change scope.
const stateOptions = computed(() => {
  const list = [...states.value]
  const saved = form.value.state_code
  if (saved && saved !== 'ALL' && !list.some((s) => s.code === saved)) {
    list.push({ id: saved, code: saved, name: `${saved} (inactive)` })
  }
  return list
})

async function loadStates() {
  try {
    const res: any = await fetchPublicStates()
    const data = res?.data
    states.value = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []
  } catch {
    states.value = []
    toast.error('Could not load states. Only "All States" is available.')
  }
}

const defaultForm = (): FormState => ({
  title: '',
  code: '',
  state_code: 'ALL',
  property_type: 'all',
  description: '',
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

const totalQuestions = computed(() =>
  form.value.sections.reduce((acc, s) => acc + s.fields.length, 0),
)

function fillFrom(d: PropertyDisclosure) {
  form.value = {
    title: d.title,
    code: d.code,
    state_code: d.state_code || 'ALL',
    property_type: d.property_type || 'all',
    description: d.description || '',
    sections: JSON.parse(JSON.stringify(d.schema?.sections || [])),
  }
}

onMounted(async () => {
  isLoading.value = true
  const statesLoaded = loadStates()
  try {
    if (isEditing.value) {
      fillFrom(await fetchAdminDisclosure(disclosureId.value as number))
    } else {
      form.value = defaultForm()
    }
    await statesLoaded
  } catch (err: any) {
    toast.error('Failed to load disclosure: ' + (err?.response?.data?.message || err.message))
    router.push({ name: 'admin-disclosures' })
  } finally {
    isLoading.value = false
  }
})

function goBack() {
  router.push({ name: 'admin-disclosures' })
}

async function handleSave() {
  if (!form.value.title.trim()) {
    toast.error('Disclosure title is required.')
    activeTab.value = 'info'
    return
  }

  isSaving.value = true
  try {
    const payload = {
      title: form.value.title.trim(),
      code: form.value.code.trim() || undefined,
      state_code: form.value.state_code === 'ALL' ? null : form.value.state_code,
      property_type: form.value.property_type === 'all' ? null : form.value.property_type,
      description: form.value.description,
      schema: { sections: form.value.sections },
    }

    if (isEditing.value) {
      await updateAdminDisclosure(disclosureId.value as number, payload)
      toast.success('Disclosure updated successfully.')
    } else {
      await createAdminDisclosure(payload)
      toast.success('New dynamic disclosure created successfully.')
    }

    goBack()
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Failed to save disclosure.')
  } finally {
    isSaving.value = false
  }
}

// Section & Field Builder Helpers
function addSection() {
  const nextNum = form.value.sections.length + 1
  form.value.sections.push({
    id: `section_${Date.now()}`,
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
  <div class="mx-auto flex w-full max-w-5xl flex-col gap-6 py-6 px-4 sm:px-6">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-border">
      <div>
        <button
          class="inline-flex items-center gap-1 text-xs font-medium text-fg-muted hover:text-fg mb-2"
          @click="goBack"
        >
          <ArrowLeft class="h-3.5 w-3.5" />
          Back to Disclosures
        </button>
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
            {{ isEditing ? 'Edit Dynamic Disclosure' : 'New Dynamic Disclosure' }}
          </span>
          <span class="text-xs text-fg-muted font-medium">Admin Controlled</span>
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-fg mt-1">
          {{ form.title || 'Untitled Property Disclosure' }}
        </h1>
      </div>

      <div class="flex items-center gap-3">
        <BaseButton variant="ghost" @click="goBack">Cancel</BaseButton>
        <BaseButton variant="primary" :disabled="isSaving || isLoading" @click="handleSave">
          {{ isSaving ? 'Saving...' : isEditing ? 'Update Disclosure' : 'Create Disclosure' }}
        </BaseButton>
      </div>
    </div>

    <LoadingState v-if="isLoading" :rows="3" label="Loading disclosure..." />

    <BaseCard v-else class="overflow-hidden">
      <!-- Tabs Navigation -->
      <div class="flex border-b border-border px-6 bg-surface overflow-x-auto">
        <button
          class="py-3 px-4 text-sm font-semibold border-b-2 transition whitespace-nowrap"
          :class="activeTab === 'info' ? 'border-primary text-primary' : 'border-transparent text-fg-muted hover:text-fg'"
          @click="activeTab = 'info'"
        >
          1. General & Scope Configuration
        </button>
        <button
          class="py-3 px-4 text-sm font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap"
          :class="activeTab === 'questions' ? 'border-primary text-primary' : 'border-transparent text-fg-muted hover:text-fg'"
          @click="activeTab = 'questions'"
        >
          <span>2. Sections & Questions Builder</span>
          <span class="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
            {{ totalQuestions }}
          </span>
        </button>
      </div>

      <div class="p-6 space-y-6">
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

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-fg mb-1">State Scope</label>
              <select
                v-model="form.state_code"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg focus:border-primary focus:outline-none"
              >
                <option value="ALL">All States (Universal)</option>
                <option v-for="s in stateOptions" :key="s.code" :value="s.code">
                  {{ s.name }} ({{ s.code }})
                </option>
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

          <div class="flex justify-end pt-2">
            <BaseButton variant="secondary" size="sm" @click="activeTab = 'questions'">
              Next: Sections & Questions
            </BaseButton>
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

          <div
            v-for="(section, sIndex) in form.sections"
            :key="section.id"
            class="rounded-xl border border-border bg-surface-raised/30 p-5 space-y-4"
          >
            <div class="flex items-center justify-between gap-4 border-b border-border pb-3">
              <div class="flex items-center gap-3 flex-1">
                <span class="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded whitespace-nowrap">
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

            <div class="space-y-3 pl-2">
              <div
                v-for="(field, fIndex) in section.fields"
                :key="field.id"
                class="rounded-lg border border-border bg-surface p-4 space-y-3 shadow-xs"
              >
                <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
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

                    <label class="flex items-center gap-1 text-[11px] font-medium text-fg cursor-pointer">
                      <input v-model="field.required" type="checkbox" class="h-3.5 w-3.5 rounded text-primary" />
                      Req
                    </label>

                    <button
                      class="text-fg-muted hover:text-rose-600 p-1 rounded"
                      title="Remove Question"
                      @click="removeField(section, fIndex)"
                    >
                      <X class="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

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

      <!-- Footer -->
      <div class="flex items-center justify-between p-4 border-t border-border bg-surface">
        <span class="text-xs text-fg-muted">{{ totalQuestions }} total questions configured</span>
        <div class="flex items-center gap-3">
          <BaseButton variant="ghost" @click="goBack">Cancel</BaseButton>
          <BaseButton variant="primary" :disabled="isSaving" @click="handleSave">
            {{ isSaving ? 'Saving...' : isEditing ? 'Update Disclosure' : 'Create Disclosure' }}
          </BaseButton>
        </div>
      </div>
    </BaseCard>
  </div>
</template>
