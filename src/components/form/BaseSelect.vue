<script setup lang="ts">
import { useId } from 'vue'
import type { FieldOption } from '@/types/field'

defineProps<{
  label?: string
  modelValue: string
  options: FieldOption[]
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const selectId = useId()
const errorId = `${selectId}-error`
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" :for="selectId" class="text-sm font-medium text-fg">
      {{ label }}<span v-if="required" class="ml-0.5 text-danger">*</span>
    </label>
    <select
      :id="selectId"
      :value="modelValue"
      :disabled="disabled"
      :aria-invalid="!!error"
      :aria-describedby="error ? errorId : undefined"
      class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-fg outline-none transition-colors focus:border-primary focus:ring-3 focus:ring-primary/30 disabled:cursor-not-allowed disabled:bg-surface-raised disabled:text-fg-disabled"
      :class="{ 'border-danger focus:border-danger focus:ring-danger/10': error }"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option value="" disabled>{{ placeholder || 'Select an option' }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <span v-if="error" :id="errorId" class="text-xs text-danger">{{ error }}</span>
  </div>
</template>
