<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { X, Flag, Sparkles } from 'lucide-vue-next'
import type { StateItem, CreateStatePayload } from '@/types/state'

const props = defineProps<{
  modelValue: boolean
  stateToEdit?: StateItem | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'save', payload: CreateStatePayload): void
}>()

const isEditMode = computed(() => !!props.stateToEdit)

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
  isActive: true,
})

const isManualSlug = ref(false)
const errors = ref<Record<string, string>>({})

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      errors.value = {}
      isManualSlug.value = false
      if (props.stateToEdit) {
        form.value = {
          name: props.stateToEdit.name,
          slug: props.stateToEdit.slug || slugify(props.stateToEdit.name),
          code: props.stateToEdit.code,
          isActive:
            props.stateToEdit.isActive !== undefined
              ? Boolean(props.stateToEdit.isActive)
              : props.stateToEdit.status !== 'inactive',
        }
        isManualSlug.value = true
      } else {
        form.value = {
          name: '',
          slug: '',
          code: '',
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
    errors.value.name = 'State name is required.'
  }
  if (!form.value.slug.trim()) {
    errors.value.slug = 'Slug is required.'
  }
  if (!form.value.code.trim()) {
    errors.value.code = 'State postal code (2 letters) is required.'
  } else if (form.value.code.trim().length !== 2) {
    errors.value.code = 'Must be exactly 2 letters (e.g. MI, TX, FL).'
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
    code: form.value.code.toUpperCase().trim(),
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
              <Flag class="h-5 w-5" />
            </div>
            <div>
              <h2 class="text-lg font-semibold text-slate-900">
                {{ isEditMode ? 'Edit State' : 'Add New State' }}
              </h2>
              <p class="text-xs text-slate-500">
                {{ isEditMode ? 'Update state name, code, slug, and status.' : 'Register a new state in the system.' }}
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
            <!-- State Name -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                State Name <span class="text-red-500">*</span>
              </label>
              <input
                :value="form.name"
                type="text"
                placeholder="e.g. California"
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
                placeholder="e.g. california"
                class="w-full font-mono rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20"
                :class="{ 'border-red-400 focus:ring-red-400/20': errors.slug }"
                @input="onSlugInput(($event.target as HTMLInputElement).value)"
              />
              <p v-if="errors.slug" class="mt-1 text-xs text-red-600">{{ errors.slug }}</p>
            </div>

            <!-- State Code -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                State Code (2-letter) <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.code"
                type="text"
                maxlength="2"
                placeholder="CA"
                class="w-full uppercase rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20 font-mono font-bold"
                :class="{ 'border-red-400 focus:ring-red-400/20': errors.code }"
              />
              <p v-if="errors.code" class="mt-1 text-xs text-red-600">{{ errors.code }}</p>
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
              {{ isEditMode ? 'Save Changes' : 'Create State' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>


