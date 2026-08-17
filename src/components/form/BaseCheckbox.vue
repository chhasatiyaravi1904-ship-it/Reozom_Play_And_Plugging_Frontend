<script setup lang="ts">
import { useId } from 'vue'

defineProps<{
  label?: string
  modelValue: boolean
  error?: string
  disabled?: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const checkboxId = useId()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label :for="checkboxId" class="flex cursor-pointer items-start gap-2 text-sm text-fg">
      <input
        :id="checkboxId"
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        class="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary outline-none focus-visible:ring-3 focus-visible:ring-primary/30 disabled:cursor-not-allowed"
        @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      />
      <span
        ><slot>{{ label }}</slot></span
      >
    </label>
    <span v-if="error" class="text-xs text-danger">{{ error }}</span>
  </div>
</template>
