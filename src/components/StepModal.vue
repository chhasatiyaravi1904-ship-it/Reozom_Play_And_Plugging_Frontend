<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition p-4"
      @click.self="emit('close')"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-neutral-300 shrink-0">
          <h2 class="text-lg font-semibold text-neutral-900">
            {{ isEditing ? `Edit Step: ${form.name}` : 'Add New Step' }}
          </h2>
          <button
            @click="emit('close')"
            class="p-1 text-neutral-400 hover:text-neutral-900 rounded transition"
          >
            <IconX :size="24" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-semibold text-neutral-700 mb-1">
              Step Name <span class="text-danger">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              placeholder="e.g. Property Details"
              class="w-full px-3 py-2 border border-neutral-300 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-neutral-700 mb-1">
              Description
            </label>
            <textarea
              v-model="form.description"
              placeholder="Brief description of this step's purpose"
              class="w-full px-3 py-2 border border-neutral-300 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
              rows="3"
            ></textarea>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end p-6 border-t border-neutral-300 bg-neutral-50 gap-2 shrink-0">
          <button
            @click="emit('close')"
            class="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-200 hover:bg-neutral-300 rounded transition"
          >
            Cancel
          </button>
          <button
            @click="handleSave"
            class="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded transition"
            :disabled="!form.name"
          >
            {{ isEditing ? 'Save Step' : 'Add Step' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { IconX } from '@tabler/icons-vue'

const props = defineProps({
  isOpen: Boolean,
  isEditing: Boolean,
  stepData: Object
})

const emit = defineEmits(['close', 'save'])

const defaultFormState = {
  name: '',
  description: ''
}

const form = ref({ ...defaultFormState })

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    if (props.isEditing && props.stepData) {
      form.value = {
        name: props.stepData.name || '',
        description: props.stepData.description || ''
      }
    } else {
      form.value = { ...defaultFormState }
    }
  }
})

const handleSave = () => {
  if (!form.value.name) return
  emit('save', { ...form.value })
}
</script>
