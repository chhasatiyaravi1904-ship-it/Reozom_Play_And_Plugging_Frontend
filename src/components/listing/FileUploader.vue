<script setup lang="ts">
import { ref } from 'vue'
import { UploadCloud } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'select', file: File): void
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
  <div
    class="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors"
    :class="isDragging ? 'border-primary bg-primary-soft' : 'border-border bg-surface-raised'"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="handleDrop"
    @click="inputRef?.click()"
  >
    <UploadCloud class="h-8 w-8 text-fg-muted" aria-hidden="true" />
    <p class="text-sm font-semibold text-fg">Upload your documents</p>
    <p class="text-sm text-fg-muted">Drag & drop or browse</p>
    <p class="text-xs text-fg-muted">PDF, JPG, PNG up to 25MB</p>
    <input
      ref="inputRef"
      type="file"
      class="hidden"
      accept=".pdf,.jpg,.jpeg,.png"
      @change="handleBrowse"
    />
  </div>
</template>
