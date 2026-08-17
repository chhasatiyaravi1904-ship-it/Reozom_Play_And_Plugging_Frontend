<script setup lang="ts">
import { useId } from 'vue'

defineProps<{
  label?: string
  modelValue: string
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
  rows?: number
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const textareaId = useId()
const errorId = `${textareaId}-error`
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" :for="textareaId" class="text-sm font-medium text-fg">
      {{ label }}<span v-if="required" class="ml-0.5 text-danger">*</span>
      <span v-else class="ml-1 text-xs font-normal text-fg-muted">(optional)</span>
    </label>
    <textarea
      :id="textareaId"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows || 4"
      :aria-invalid="!!error"
      :aria-describedby="error ? errorId : undefined"
      class="w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-fg outline-none transition-colors focus:border-primary focus:ring-3 focus:ring-primary/30 disabled:cursor-not-allowed disabled:bg-surface-raised disabled:text-fg-disabled"
      :class="{ 'border-danger focus:border-danger focus:ring-danger/10': error }"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    ></textarea>
    <span v-if="error" :id="errorId" class="text-xs text-danger">{{ error }}</span>
  </div>
</template>
