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
      <section v-if="isVisible(section.showIf)" class="flex flex-col mb-4">
        <div class="mb-6 pb-2 border-b border-outline-variant/30">
          <h3 class="text-label-lg font-label-lg font-bold text-primary uppercase tracking-wider">{{ section.title || section.name }}</h3>
          <p v-if="section.description" class="mt-1 text-body-sm font-body-sm text-on-surface-variant">
            {{ section.description }}
          </p>
        </div>

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
