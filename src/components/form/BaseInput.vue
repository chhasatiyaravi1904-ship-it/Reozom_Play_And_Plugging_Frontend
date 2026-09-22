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
    <label v-if="label" :for="inputId" class="block text-label-sm font-label-sm text-on-surface-variant uppercase mb-1">
      {{ label }}<span v-if="required" class="ml-0.5 text-error">*</span>
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
      class="w-full h-11 px-3 rounded-lg border border-outline-variant bg-surface text-on-surface font-body-md text-body-md outline-none transition-colors focus:border-secondary focus:ring-1 focus:ring-secondary disabled:cursor-not-allowed disabled:bg-surface-container disabled:text-outline"
      :class="{ 'border-error focus:border-error focus:ring-error/10': error }"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="error" :id="errorId" class="text-xs text-error">{{ error }}</span>
  </div>
</template>
