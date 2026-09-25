<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 transition p-4 md:p-8"
      @click.self="emit('close')"
    >
      <div class="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-neutral-200 shrink-0 bg-neutral-50">
          <div>
            <h2 class="text-xl font-bold text-neutral-900">Preview: {{ activeStep?.name }}</h2>
            <p class="text-sm text-neutral-500 mt-1">This is how the current step will appear to users.</p>
          </div>
          <button
            @click="emit('close')"
            class="p-2 text-neutral-400 hover:text-neutral-900 bg-white hover:bg-neutral-100 rounded-full transition shadow-sm border border-neutral-200"
          >
            <IconX :size="20" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-8 overflow-y-auto bg-white flex-1">
          <div class="max-w-xl mx-auto space-y-10">
            <template v-if="activeSections.length > 0">
              <div v-for="section in activeSections" :key="section.id" class="space-y-6">
                
                <!-- Section Title -->
                <div class="pb-2 border-b border-neutral-200">
                  <h3 class="text-lg font-bold text-neutral-900">{{ section.name }}</h3>
                  <p v-if="section.description" class="text-sm text-neutral-500 mt-0.5">{{ section.description }}</p>
                </div>
                
                <div v-if="getSectionFields(section).length === 0" class="text-sm text-neutral-400 italic">
                  No active fields in this section.
                </div>

                <div
                  v-for="field in getSectionFields(section)"
                  :key="field.id"
                  class="space-y-1.5"
                >
                  <label class="block text-sm font-semibold text-neutral-800">
                    {{ field.label }}
                    <span v-if="field.required" class="text-danger ml-0.5">*</span>
                  </label>
                  
                  <!-- Text / Number / Email / Date / Password Inputs -->
                  <template v-if="['text', 'number', 'email', 'date', 'password'].includes(field.type)">
                    <input
                      :type="field.type"
                      :placeholder="field.helpText || ''"
                      :value="field.defaultValue || ''"
                      class="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-md focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm text-neutral-900"
                    />
                  </template>
                  
                  <!-- Textarea -->
                  <template v-else-if="field.type === 'textarea'">
                    <textarea
                      :placeholder="field.helpText || ''"
                      :value="field.defaultValue || ''"
                      class="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-md focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm text-neutral-900"
                      rows="4"
                    ></textarea>
                  </template>
                  
                  <!-- Select -->
                  <template v-else-if="field.type === 'select'">
                    <select
                      class="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-md focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm text-neutral-900"
                    >
                      <option value="" disabled selected>{{ field.helpText || 'Select an option' }}</option>
                      <option v-for="opt in field.options" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </option>
                    </select>
                  </template>

                  <!-- Radio -->
                  <template v-else-if="field.type === 'radio'">
                    <div class="space-y-2 mt-2">
                      <div v-for="opt in field.options" :key="opt.value" class="flex items-center">
                        <input
                          :id="`${field.id}-${opt.value}`"
                          :name="field.id"
                          type="radio"
                          :value="opt.value"
                          class="w-4 h-4 text-primary border-neutral-300 focus:ring-primary"
                        />
                        <label :for="`${field.id}-${opt.value}`" class="ml-2 text-sm text-neutral-700">
                          {{ opt.label }}
                        </label>
                      </div>
                    </div>
                  </template>

                  <!-- Checkbox -->
                  <template v-else-if="field.type === 'checkbox'">
                    <div class="space-y-2 mt-2">
                      <div v-for="opt in field.options" :key="opt.value" class="flex items-center">
                        <input
                          :id="`${field.id}-${opt.value}`"
                          type="checkbox"
                          :value="opt.value"
                          class="w-4 h-4 text-primary rounded border-neutral-300 focus:ring-primary"
                        />
                        <label :for="`${field.id}-${opt.value}`" class="ml-2 text-sm text-neutral-700">
                          {{ opt.label }}
                        </label>
                      </div>
                    </div>
                  </template>
                  
                  <!-- File -->
                  <template v-else-if="field.type === 'file'">
                    <div class="w-full border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:bg-neutral-50 transition cursor-pointer">
                      <IconUpload class="mx-auto h-8 w-8 text-neutral-400 mb-2" />
                      <span class="text-sm font-medium text-primary">Click to upload</span>
                      <span class="text-sm text-neutral-500"> or drag and drop</span>
                      <p class="text-xs text-neutral-500 mt-1">{{ field.helpText || 'Any file type' }}</p>
                    </div>
                  </template>
                  
                  <!-- Help text fallback -->
                  <p v-if="field.helpText && !['text', 'number', 'email', 'date', 'textarea', 'select', 'file'].includes(field.type)" class="text-xs text-neutral-500 mt-1">
                    {{ field.helpText }}
                  </p>
                </div>
              </div>
            </template>
            
            <div v-else class="text-center py-12 text-neutral-500">
              <p>No active sections or fields to preview in this step.</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between p-6 border-t border-neutral-200 bg-neutral-50 shrink-0">
          <button
            @click="emit('prev')"
            :disabled="!hasPrevious"
            :class="[
              'px-5 py-2.5 text-sm font-medium rounded transition border',
              hasPrevious
                ? 'text-neutral-700 bg-white border-neutral-300 hover:bg-neutral-50'
                : 'text-neutral-400 bg-neutral-100 border-neutral-200 cursor-not-allowed'
            ]"
          >
            Previous Step
          </button>
          <button
            @click="emit('next')"
            :disabled="!hasNext"
            :class="[
              'px-5 py-2.5 text-sm font-medium rounded transition shadow-sm',
              hasNext
                ? 'text-white bg-primary hover:bg-primary/90'
                : 'text-neutral-400 bg-neutral-200 cursor-not-allowed shadow-none'
            ]"
          >
            Next Step
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { IconX, IconUpload } from '@tabler/icons-vue'

const props = defineProps({
  isOpen: Boolean,
  activeStep: Object,
  hasPrevious: Boolean,
  hasNext: Boolean
})

const emit = defineEmits(['close', 'next', 'prev'])

const activeSections = computed(() => {
  if (!props.activeStep || !props.activeStep.sections) return []
  return props.activeStep.sections
})

const getSectionFields = (section) => {
  if (!section || !section.fields) return []
  return section.fields.filter(f => f.active)
}
</script>
