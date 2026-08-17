<script setup lang="ts">
import { useId } from 'vue'

defineOptions({ inheritAttrs: false })

defineProps<{
  label?: string
  modelValue: string | number
  type?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const inputId = useId()
const errorId = `${inputId}-error`
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" :for="inputId" class="text-sm font-medium text-fg">
      {{ label }}<span v-if="required" class="ml-0.5 text-danger">*</span>
    </label>
    <input
      :id="inputId"
      v-bind="$attrs"
      :type="type || 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :aria-invalid="!!error"
      :aria-describedby="error ? errorId : undefined"
      class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-fg outline-none transition-colors focus:border-primary focus:ring-3 focus:ring-primary/30 disabled:cursor-not-allowed disabled:bg-surface-raised disabled:text-fg-disabled"
      :class="{ 'border-danger focus:border-danger focus:ring-danger/10': error }"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="error" :id="errorId" class="text-xs text-danger">{{ error }}</span>
  </div>
</template>
