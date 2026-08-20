<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { X, Building, Sparkles, ChevronDown } from 'lucide-vue-next'
import { useCountyStore } from '@/stores/county'
import type { CityItem, CreateCityPayload } from '@/types/city'

const props = defineProps<{
  modelValue: boolean
  cityToEdit?: CityItem | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'save', payload: CreateCityPayload): void
}>()

const countyStore = useCountyStore()

const isEditMode = computed(() => !!props.cityToEdit)

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const form = ref({
  name: '',
  slug: '',
  code: '',
  stateId: '',
  countyId: '',
  isActive: true,
})

const isManualSlug = ref(false)
const errors = ref<Record<string, string>>({})

// State list derived from loaded counties, used only to narrow the county dropdown.
const availableStates = computed(() => {
  const seen = new Map<string, { id: string; name: string; code: string }>()
  for (const c of countyStore.counties) {
    if (c.state && !seen.has(String(c.state.id))) {
      seen.set(String(c.state.id), { id: String(c.state.id), name: c.state.name, code: c.state.code })
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name))
})

const availableCounties = computed(() => {
  return countyStore.counties
    .filter((c) => !form.value.stateId || String(c.stateId) === String(form.value.stateId))
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
})

function onStateChange() {
  // Selected county may no longer belong to the newly chosen state.
  const stillValid = availableCounties.value.some((c) => String(c.id) === form.value.countyId)
  if (!stillValid) form.value.countyId = ''
}

onMounted(() => {
  if (countyStore.counties.length === 0) {
    countyStore.fetchCounties()
  }
})

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      errors.value = {}
      isManualSlug.value = false
      if (countyStore.counties.length === 0) {
        countyStore.fetchCounties()
      }
      if (props.cityToEdit) {
        const county = props.cityToEdit.county
        form.value = {
          name: props.cityToEdit.name,
          slug: props.cityToEdit.slug || slugify(props.cityToEdit.name),
          code: props.cityToEdit.code,
          stateId: county?.stateId ? String(county.stateId) : county?.state?.id ? String(county.state.id) : '',
          countyId: String(props.cityToEdit.countyId ?? ''),
          isActive:
            props.cityToEdit.isActive !== undefined
              ? Boolean(props.cityToEdit.isActive)
              : props.cityToEdit.status !== 'inactive',
        }
        isManualSlug.value = true
      } else {
        form.value = {
          name: '',
          slug: '',
          code: '',
          stateId: '',
          countyId: '',
          isActive: true,
        }
      }
    }
  },
  { immediate: true },
)

function onNameInput(val: string) {
  form.value.name = val
  if (!isManualSlug.value) {
    form.value.slug = slugify(val)
  }
}

function onSlugInput(val: string) {
  form.value.slug = val.toLowerCase().replace(/\s+/g, '-')
  isManualSlug.value = true
}

function regenerateSlug() {
  form.value.slug = slugify(form.value.name)
  isManualSlug.value = false
}

function validate(): boolean {
  errors.value = {}
  if (!form.value.name.trim()) {
    errors.value.name = 'City name is required.'
  }
  if (!form.value.slug.trim()) {
    errors.value.slug = 'Slug is required.'
  }
  if (!form.value.code.trim()) {
    errors.value.code = 'City code is required.'
  } else if (form.value.code.trim().length > 20) {
    errors.value.code = 'Must be 20 characters or fewer.'
  }
  if (!form.value.countyId) {
    errors.value.countyId = 'Parent county is required.'
  }
  return Object.keys(errors.value).length === 0
}

function handleClose() {
  emit('update:modelValue', false)
}

function handleSubmit() {
  if (!validate()) return

  const finalSlug = form.value.slug.trim() || slugify(form.value.name)

  emit('save', {
    name: form.value.name.trim(),
    slug: finalSlug,
    code: form.value.code.trim(),
    countyId: form.value.countyId,
    isActive: Boolean(form.value.isActive),
    status: form.value.isActive ? 'active' : 'inactive',
  })
  handleClose()
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        @click="handleClose"
      ></div>

      <!-- Modal Card -->
      <div
        class="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all"
      >
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-[#0f6b5c] ring-1 ring-teal-600/20"
            >
              <Building class="h-5 w-5" />
            </div>
            <div>
              <h2 class="text-lg font-semibold text-slate-900">
                {{ isEditMode ? 'Edit City' : 'Add New City' }}
              </h2>
              <p class="text-xs text-slate-500">
                {{ isEditMode ? 'Update city name, code, slug, and status.' : 'Register a new city under a county.' }}
              </p>
            </div>
          </div>
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            @click="handleClose"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <!-- Form -->
        <form class="mt-5 space-y-4" @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <!-- State (narrows county list) -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">State</label>
              <div class="relative">
                <select
                  v-model="form.stateId"
                  class="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20"
                  @change="onStateChange"
                >
                  <option value="">All states</option>
                  <option v-for="s in availableStates" :key="s.id" :value="s.id">
                    {{ s.name }} ({{ s.code }})
                  </option>
                </select>
                <ChevronDown class="pointer-events-none absolute inset-y-0 right-0 my-auto mr-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>
              <p class="mt-1 text-[11px] text-slate-400">Optional — narrows the county list below.</p>
            </div>

            <!-- Parent County -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                County <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <select
                  v-model="form.countyId"
                  class="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20"
                  :class="{ 'border-red-400 focus:ring-red-400/20': errors.countyId }"
                >
                  <option value="" disabled>Select a county...</option>
                  <option v-for="c in availableCounties" :key="c.id" :value="String(c.id)">
                    {{ c.name }} ({{ c.code }})
                  </option>
                </select>
                <ChevronDown class="pointer-events-none absolute inset-y-0 right-0 my-auto mr-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>
              <p v-if="errors.countyId" class="mt-1 text-xs text-red-600">{{ errors.countyId }}</p>
            </div>

            <!-- City Name -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                City Name <span class="text-red-500">*</span>
              </label>
              <input
                :value="form.name"
                type="text"
                placeholder="e.g. Ann Arbor"
                class="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20"
                :class="{ 'border-red-400 focus:ring-red-400/20': errors.name }"
                @input="onNameInput(($event.target as HTMLInputElement).value)"
              />
              <p v-if="errors.name" class="mt-1 text-xs text-red-600">{{ errors.name }}</p>
            </div>

            <!-- Slug Input (Editable) -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-semibold text-slate-700">
                  Slug <span class="text-red-500">*</span>
                </label>
                <button
                  v-if="form.name"
                  type="button"
                  class="inline-flex items-center gap-1 text-[11px] font-medium text-[#0f6b5c] hover:underline"
                  @click="regenerateSlug"
                >
                  <Sparkles class="h-3 w-3" />
                  <span>Auto-generate</span>
                </button>
              </div>
              <input
                :value="form.slug"
                type="text"
                placeholder="e.g. ann-arbor"
                class="w-full font-mono rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20"
                :class="{ 'border-red-400 focus:ring-red-400/20': errors.slug }"
                @input="onSlugInput(($event.target as HTMLInputElement).value)"
              />
              <p v-if="errors.slug" class="mt-1 text-xs text-red-600">{{ errors.slug }}</p>
            </div>

            <!-- City Code -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                City Code <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.code"
                type="text"
                maxlength="20"
                placeholder="e.g. AA1"
                class="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20 font-mono font-bold"
                :class="{ 'border-red-400 focus:ring-red-400/20': errors.code }"
              />
              <p v-if="errors.code" class="mt-1 text-xs text-red-600">{{ errors.code }}</p>
              <p class="mt-1 text-[11px] text-slate-400">Must be unique within the selected county.</p>
            </div>

            <!-- Status / isActive -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
              <select
                :value="form.isActive ? 'active' : 'inactive'"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-2xs focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20"
                @change="form.isActive = ($event.target as HTMLSelectElement).value === 'active'"
              >
                <option value="active">🟢 Active (Available for listings)</option>
                <option value="inactive">🔴 Inactive (Disabled)</option>
              </select>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-2xs hover:bg-slate-50"
              @click="handleClose"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="inline-flex items-center gap-2 rounded-lg bg-[#0f6b5c] px-4 py-2 text-sm font-semibold text-white shadow-2xs hover:bg-[#0b564a]"
            >
              {{ isEditMode ? 'Save Changes' : 'Create City' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
