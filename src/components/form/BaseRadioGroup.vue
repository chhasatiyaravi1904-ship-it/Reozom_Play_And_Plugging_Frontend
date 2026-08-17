<script setup lang="ts">
import { useId } from 'vue'
import type { FieldOption } from '@/types/field'

defineProps<{
  label?: string
  modelValue: string
  options: FieldOption[]
  error?: string
  required?: boolean
  inline?: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const groupName = useId()
</script>

<template>
  <div class="flex flex-col gap-2">
    <span v-if="label" class="text-sm font-medium text-fg">
      {{ label }}<span v-if="required" class="ml-0.5 text-danger">*</span>
    </span>
    <div :class="['flex gap-3', inline ? 'flex-row flex-wrap' : 'flex-col']">
      <label
        v-for="option in options"
        :key="option.value"
        class="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-fg transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary-soft"
      >
        <input
          type="radio"
          :name="groupName"
          :value="option.value"
          :checked="modelValue === option.value"
          class="h-4 w-4 shrink-0 border-border text-primary outline-none focus-visible:ring-3 focus-visible:ring-primary/30"
          @change="$emit('update:modelValue', option.value)"
        />
        {{ option.label }}
      </label>
    </div>
    <span v-if="error" class="text-xs text-danger">{{ error }}</span>
  </div>
</template>
