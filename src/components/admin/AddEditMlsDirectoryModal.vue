<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Network, FolderPlus } from 'lucide-vue-next'
import Modal from '@/components/ui/Modal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import type { MlsDirectoryItem, CreateMlsDirectoryPayload } from '@/types/mls'

const props = defineProps<{
  modelValue: boolean
  directoryToEdit?: MlsDirectoryItem | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'save', payload: CreateMlsDirectoryPayload): void
}>()

const isEditMode = computed(() => !!props.directoryToEdit)

const form = ref({ title: '' })
const errors = ref<Record<string, string>>({})

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      errors.value = {}
      form.value = { title: props.directoryToEdit?.title || '' }
    }
  },
  { immediate: true },
)

function validate(): boolean {
  errors.value = {}
  if (!form.value.title.trim()) {
    errors.value.title = 'Title is required'
  }
  return Object.keys(errors.value).length === 0
}

function handleClose() {
  emit('update:modelValue', false)
}

function handleSubmit() {
  if (!validate()) return
  emit('save', { title: form.value.title.trim() })
  handleClose()
}
</script>

<template>
  <Modal :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <div class="flex items-center gap-3 border-b border-border pb-4 -mt-2">
      <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary ring-1 ring-primary/20">
        <component :is="isEditMode ? Network : FolderPlus" class="h-5 w-5" />
      </div>
      <div>
        <h2 class="text-lg font-semibold text-fg">{{ isEditMode ? 'Edit MLS Directory' : 'Add MLS Directory' }}</h2>
        <p class="text-xs text-fg-muted">
          {{ isEditMode ? 'Update the directory title.' : 'Create a new MLS directory to group its info entries under.' }}
        </p>
      </div>
    </div>

    <form class="mt-5 space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label class="block text-xs font-semibold text-fg mb-1.5">
          Title <span class="text-danger">*</span>
        </label>
        <input
          v-model="form.title"
          type="text"
          placeholder="e.g. National MLS Network"
          class="focus-ring w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-fg shadow-xs placeholder:text-fg-disabled transition-colors"
          :class="{ 'border-danger': errors.title }"
        />
        <p v-if="errors.title" class="mt-1 text-xs text-danger">{{ errors.title }}</p>
      </div>

      <div class="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
        <BaseButton variant="secondary" type="button" @click="handleClose">Cancel</BaseButton>
        <BaseButton variant="primary" type="submit">{{ isEditMode ? 'Save Changes' : 'Create Directory' }}</BaseButton>
      </div>
    </form>
  </Modal>
</template>
