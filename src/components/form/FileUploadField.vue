<script setup lang="ts">
import { ref } from 'vue'
import { UploadCloud } from 'lucide-vue-next'

defineProps<{
  label?: string
  fileName?: string
  error?: string
  required?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', file: File): void
  (e: 'remove'): void
}>()

const isDragging = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

function handleDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) emit('select', file)
}

function handleBrowse(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) emit('select', file)
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <span v-if="label" class="text-sm font-medium text-fg">
      {{ label }}<span v-if="required" class="ml-0.5 text-danger">*</span>
    </span>

    <div
      v-if="!fileName"
      class="flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors"
      :class="isDragging ? 'border-primary bg-primary-soft' : 'border-border bg-surface-raised'"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="inputRef?.click()"
    >
      <UploadCloud class="h-6 w-6 text-fg-muted" aria-hidden="true" />
      <span class="text-sm font-medium text-fg">Drag & drop or browse</span>
      <span class="text-xs text-fg-muted">PDF, JPG, PNG up to 25MB</span>
      <input
        ref="inputRef"
        type="file"
        class="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
        @change="handleBrowse"
      />
    </div>

    <div
      v-else
      class="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2"
    >
      <span class="truncate text-sm text-fg">{{ fileName }}</span>
      <button
        type="button"
        class="text-xs font-medium text-danger hover:underline"
        @click="$emit('remove')"
      >
        Remove
      </button>
    </div>

    <span v-if="error" class="text-xs text-danger">{{ error }}</span>
  </div>
</template>
