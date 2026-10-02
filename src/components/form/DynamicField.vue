<script setup lang="ts">
import { computed } from 'vue'
import BaseInput from '@/components/form/BaseInput.vue'
import BaseSelect from '@/components/form/BaseSelect.vue'
import BaseTextarea from '@/components/form/BaseTextarea.vue'
import BaseCheckbox from '@/components/form/BaseCheckbox.vue'
import BaseRadioGroup from '@/components/form/BaseRadioGroup.vue'
import YesNoField from '@/components/form/YesNoField.vue'
import FileUploadField from '@/components/form/FileUploadField.vue'
import type { FieldDefinition, FieldValue } from '@/types/field'

const props = defineProps<{
  field: FieldDefinition
  modelValue: FieldValue
  error?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: FieldValue): void
}>()

function update(value: FieldValue) {
  emit('update:modelValue', value)
}

const fileName = computed(() =>
  props.modelValue instanceof File ? props.modelValue.name : undefined,
)
</script>

<template>
  <BaseInput
    v-if="(field.fieldType || field.type) === 'text'"
    :label="field.label"
    :placeholder="field.placeholder"
    :required="field.required"
    :error="error"
    :model-value="(modelValue as string) || ''"
    @update:modelValue="update"
  />

  <BaseInput
    v-else-if="(field.fieldType || field.type) === 'number'"
    type="number"
    :label="field.label"
    :placeholder="field.placeholder"
    :required="field.required"
    :error="error"
    :model-value="(modelValue as string) || ''"
    @update:modelValue="update"
  />

  <BaseInput
    v-else-if="(field.fieldType || field.type) === 'date'"
    type="date"
    :label="field.label"
    :required="field.required"
    :error="error"
    :model-value="(modelValue as string) || ''"
    @update:modelValue="update"
  />

  <BaseSelect
    v-else-if="(field.fieldType || field.type) === 'select'"
    :label="field.label"
    :options="field.options || []"
    :placeholder="field.placeholder"
    :required="field.required"
    :error="error"
    :model-value="(modelValue as string) || ''"
    @update:modelValue="update"
  />

  <BaseRadioGroup
    v-else-if="(field.fieldType || field.type) === 'radio'"
    :label="field.label"
    :options="field.options || []"
    :required="field.required"
    :error="error"
    :model-value="(modelValue as string) || ''"
    @update:modelValue="update"
  />

  <BaseCheckbox
    v-else-if="(field.fieldType || field.type) === 'checkbox'"
    :label="field.label"
    :error="error"
    :model-value="!!modelValue"
    @update:modelValue="update"
  />

  <BaseTextarea
    v-else-if="(field.fieldType || field.type) === 'textarea'"
    :label="field.label"
    :placeholder="field.placeholder"
    :required="field.required"
    :error="error"
    :model-value="(modelValue as string) || ''"
    @update:modelValue="update"
  />

  <YesNoField
    v-else-if="(field.fieldType || field.type) === 'yesno'"
    :label="field.label"
    :required="field.required"
    :error="error"
    :model-value="(modelValue as string) || ''"
    @update:modelValue="update"
  />

  <FileUploadField
    v-else-if="(field.fieldType || field.type) === 'file' || (field.fieldType || field.type) === 'signature'"
    :label="field.label"
    :required="field.required"
    :error="error"
    :file-name="fileName"
    @select="update"
    @remove="update(null)"
  />

  <p v-if="field.helpText" class="mt-1 text-xs text-fg-muted">{{ field.helpText }}</p>
</template>
