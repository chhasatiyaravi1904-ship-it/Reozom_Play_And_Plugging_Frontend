<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { PackagePlus, PackageCheck, Sparkles } from 'lucide-vue-next'
import type { PackageItem, CreatePackagePayload } from '@/types/package'
import Modal from '@/components/ui/Modal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps<{
  modelValue: boolean
  packageToEdit?: PackageItem | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'save', payload: CreatePackagePayload): void
}>()

const isEditMode = computed(() => !!props.packageToEdit)

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
  description: '',
  price: '',
  durationDays: 30,
  sortOrder: 0,
  isActive: true,
  maxListingProcesses: '',
})

const isManualSlug = ref(false)
const errors = ref<Record<string, string>>({})

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    errors.value = {}
    isManualSlug.value = false
    if (props.packageToEdit) {
      const pkg = props.packageToEdit
      form.value = {
        name: pkg.name,
        slug: pkg.slug,
        description: pkg.description || '',
        price: pkg.price !== null && pkg.price !== undefined ? String(pkg.price) : '',
        durationDays: pkg.durationDays,
        sortOrder: pkg.sortOrder,
        isActive: pkg.isActive,
        maxListingProcesses: pkg.maxListingProcesses !== null && pkg.maxListingProcesses !== undefined ? String(pkg.maxListingProcesses) : '',
      }
      isManualSlug.value = true
    } else {
      form.value = {
        name: '',
        slug: '',
        description: '',
        price: '',
        durationDays: 30,
        sortOrder: 0,
        isActive: true,
        maxListingProcesses: '',
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
    errors.value.name = 'Package name is required.'
  }
  if (!form.value.slug.trim()) {
    errors.value.slug = 'Slug is required.'
  }
  if (!form.value.durationDays || form.value.durationDays < 1) {
    errors.value.durationDays = 'Duration must be at least 1 day.'
  }
  if (form.value.price && Number.isNaN(Number(form.value.price))) {
    errors.value.price = 'Price must be a number.'
  }
  if (form.value.maxListingProcesses && Number.isNaN(Number(form.value.maxListingProcesses))) {
    errors.value.maxListingProcesses = 'Must be a valid number.'
  }
  return Object.keys(errors.value).length === 0
}

function handleClose() {
  emit('update:modelValue', false)
}

function handleSubmit() {
  if (!validate()) return

  emit('save', {
    name: form.value.name.trim(),
    slug: form.value.slug.trim() || slugify(form.value.name),
    description: form.value.description.trim() || null,
    price: form.value.price.trim() ? Number(form.value.price) : null,
    durationDays: Number(form.value.durationDays),
    sortOrder: Number(form.value.sortOrder) || 0,
    isActive: Boolean(form.value.isActive),
    maxListingProcesses: form.value.maxListingProcesses.trim() ? Number(form.value.maxListingProcesses) : null,
  })
  handleClose()
}
</script>

<template>
  <Modal :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <div class="flex items-center gap-3 border-b border-border pb-4 -mt-2">
      <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary ring-1 ring-primary/20">
        <component :is="isEditMode ? PackageCheck : PackagePlus" class="h-5 w-5" />
      </div>
      <div>
        <h2 class="text-lg font-semibold text-fg">{{ isEditMode ? 'Edit Package' : 'Add New Package' }}</h2>
        <p class="text-xs text-fg-muted">
          {{ isEditMode ? 'Update package details and availability.' : 'Create a new package agents can select.' }}
        </p>
      </div>
    </div>

    <form class="mt-5 space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label class="mb-1.5 block text-xs font-semibold text-fg">
          Package Name <span class="text-danger">*</span>
        </label>
        <input
          :value="form.name"
          type="text"
          placeholder="e.g. Starter"
          class="focus-ring w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-fg shadow-xs placeholder:text-fg-disabled transition-colors"
          :class="{ 'border-danger': errors.name }"
          @input="onNameInput(($event.target as HTMLInputElement).value)"
        />
        <p v-if="errors.name" class="mt-1 text-xs text-danger">{{ errors.name }}</p>
      </div>

      <div>
        <div class="mb-1.5 flex items-center justify-between">
          <label class="block text-xs font-semibold text-fg">
            Slug <span class="text-danger">*</span>
          </label>
          <button
            v-if="form.name"
            type="button"
            class="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
            @click="regenerateSlug"
          >
            <Sparkles class="h-3 w-3" />
            <span>Auto-generate</span>
          </button>
        </div>
        <input
          :value="form.slug"
          type="text"
          placeholder="e.g. starter"
          class="focus-ring w-full rounded-lg border border-border bg-surface px-3.5 py-2 font-mono text-sm text-fg shadow-xs placeholder:text-fg-disabled transition-colors"
          :class="{ 'border-danger': errors.slug }"
          @input="onSlugInput(($event.target as HTMLInputElement).value)"
        />
        <p v-if="errors.slug" class="mt-1 text-xs text-danger">{{ errors.slug }}</p>
      </div>

      <div>
        <label class="mb-1.5 block text-xs font-semibold text-fg">Description</label>
        <textarea
          v-model="form.description"
          rows="2"
          placeholder="What this package gives an agent access to"
          class="focus-ring w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-fg shadow-xs placeholder:text-fg-disabled transition-colors"
        ></textarea>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label class="mb-1.5 block text-xs font-semibold text-fg">Price (optional)</label>
          <input
            v-model="form.price"
            type="text"
            inputmode="decimal"
            placeholder="0.00"
            class="focus-ring w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-fg shadow-xs placeholder:text-fg-disabled transition-colors"
            :class="{ 'border-danger': errors.price }"
          />
          <p v-if="errors.price" class="mt-1 text-xs text-danger">{{ errors.price }}</p>
        </div>

        <div>
          <label class="mb-1.5 block text-xs font-semibold text-fg">
            Duration (days) <span class="text-danger">*</span>
          </label>
          <input
            v-model.number="form.durationDays"
            type="number"
            min="1"
            class="focus-ring w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-fg shadow-xs placeholder:text-fg-disabled transition-colors"
            :class="{ 'border-danger': errors.durationDays }"
          />
          <p v-if="errors.durationDays" class="mt-1 text-xs text-danger">{{ errors.durationDays }}</p>
        </div>

        <div>
          <label class="mb-1.5 block text-xs font-semibold text-fg">Sort Order</label>
          <input
            v-model.number="form.sortOrder"
            type="number"
            min="0"
            class="focus-ring w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-fg shadow-xs placeholder:text-fg-disabled transition-colors"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1.5 block text-xs font-semibold text-fg">Max Listing Processes</label>
          <input
            v-model="form.maxListingProcesses"
            type="number"
            min="1"
            placeholder="Unlimited if empty"
            class="focus-ring w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-fg shadow-xs placeholder:text-fg-disabled transition-colors"
            :class="{ 'border-danger': errors.maxListingProcesses }"
          />
          <p v-if="errors.maxListingProcesses" class="mt-1 text-xs text-danger">{{ errors.maxListingProcesses }}</p>
        </div>

        <div>
          <label class="mb-1.5 block text-xs font-semibold text-fg">Status</label>
          <select
            :value="form.isActive ? 'active' : 'inactive'"
            class="focus-ring w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg shadow-xs transition-colors"
            @change="form.isActive = ($event.target as HTMLSelectElement).value === 'active'"
          >
            <option value="active">🟢 Active (Selectable by agents)</option>
            <option value="inactive">🔴 Inactive (Hidden from selection)</option>
          </select>
        </div>
      </div>

      <div class="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
        <BaseButton variant="secondary" type="button" @click="handleClose">Cancel</BaseButton>
        <BaseButton variant="primary" type="submit">{{ isEditMode ? 'Save Changes' : 'Create Package' }}</BaseButton>
      </div>
    </form>
  </Modal>
</template>
