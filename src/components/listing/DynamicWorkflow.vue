<script setup lang="ts">
import DynamicField from '@/components/form/DynamicField.vue'
import { useConditionalLogic } from '@/composables/useConditionalLogic'
import type { WorkflowStep } from '@/types/workflow'
import type { FieldValue } from '@/types/field'

const props = defineProps<{
  step: WorkflowStep
  values: Record<string, FieldValue>
  errors?: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'update:field', fieldId: string, value: FieldValue): void
}>()

const { isVisible } = useConditionalLogic(props.values)
</script>

<template>
  <div class="flex flex-col gap-8">
    <template v-for="section in step.sections" :key="section.id">
      <section v-if="isVisible(section.showIf)" class="flex flex-col gap-1">
        <h2 class="text-lg font-semibold text-fg">{{ section.title || section.name }}</h2>
        <p v-if="section.description" class="mb-3 text-sm text-fg-muted">
          {{ section.description }}
        </p>

        <div class="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
          <template v-for="field in section.fields" :key="field.id">
            <div
              v-if="isVisible(field.showIf)"
              :class="{ 'md:col-span-2': (field.fieldType || field.type) === 'textarea' }"
            >
              <DynamicField
                :field="field"
                :model-value="values[field.id] ?? ''"
                :error="errors?.[field.id]"
                @update:modelValue="(value) => emit('update:field', field.id, value)"
              />
            </div>
          </template>
        </div>
      </section>
    </template>
  </div>
</template>
