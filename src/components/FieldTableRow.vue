<template>
  <tr
    class="border-b border-neutral-100 hover:bg-neutral-50 transition h-12"
    :class="{ 'opacity-50 bg-neutral-50': !field.active }"
    @dragover.prevent
    @drop="handleDrop"
  >
    <!-- Drag Handle -->
    <td class="w-8 px-2">
      <div
        draggable="true"
        class="flex items-center justify-center text-neutral-400 hover:text-primary cursor-grab"
        @dragstart="handleDragStart"
      >
        <IconGripVertical :size="18" />
      </div>
    </td>

    <!-- Field Name -->
    <td class="px-4 py-3 w-40">
      <span class="text-sm font-medium font-mono text-neutral-900">{{ field.name }}</span>
    </td>

    <!-- Display Label -->
    <td class="px-4 py-3 w-40">
      <span class="text-sm text-neutral-700 truncate block">{{ field.label }}</span>
    </td>

    <!-- Type Badge -->
    <td class="px-4 py-3 w-20">
      <span class="inline-flex px-3 py-1 text-xs font-medium text-primary bg-primary-soft rounded-full">
        {{ field.type }}
      </span>
    </td>

    <!-- Required Toggle -->
    <td class="px-4 py-3 w-15">
      <div class="flex items-center">
        <input
          type="checkbox"
          :checked="field.required"
          @change="emit('update:required', $event.target.checked)"
          class="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary cursor-pointer"
        />
        <span v-if="field.required" class="ml-1 text-danger text-lg font-bold">*</span>
      </div>
    </td>

    <!-- Active Toggle -->
    <td class="px-4 py-3 w-15">
      <button
        @click="emit('update:active', !field.active)"
        :class="[
          'relative inline-flex w-11 h-6 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
          field.active ? 'bg-success' : 'bg-neutral-300'
        ]"
      >
        <span class="sr-only">Toggle active status</span>
        <span
          :class="[
            'inline-block w-5 h-5 transform rounded-full bg-white transition-transform',
            field.active ? 'translate-x-5' : 'translate-x-0.5'
          ]"
        />
      </button>
    </td>

    <!-- Parent Field Indicator -->
    <td class="px-4 py-3 w-15">
      <div v-if="field.dependencies && field.dependencies.length" class="flex items-center">
        <button
          :title="getDependencyTooltip(field)"
          class="text-warning hover:text-primary transition"
        >
          <IconLink :size="18" />
        </button>
      </div>
    </td>

    <!-- Actions -->
    <td class="px-4 py-3 w-20">
      <div class="flex gap-2">
        <button
          @click="emit('edit')"
          class="p-1.5 text-neutral-400 hover:text-primary hover:bg-neutral-100 rounded transition focus:outline-none focus:ring-2 focus:ring-primary"
          title="Edit field"
        >
          <IconEdit :size="18" />
        </button>
        <button
          @click="emit('delete')"
          class="p-1.5 text-neutral-400 hover:text-danger hover:bg-neutral-100 rounded transition focus:outline-none focus:ring-2 focus:ring-danger"
          title="Delete field"
        >
          <IconTrash :size="18" />
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup>
import { IconGripVertical, IconEdit, IconTrash, IconLink } from '@tabler/icons-vue'

const props = defineProps({
  field: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['drag-start', 'drop', 'edit', 'delete', 'update:required', 'update:active'])

const handleDragStart = (e) => {
  e.dataTransfer.effectAllowed = 'move'
  emit('drag-start', e, props.field)
}

const handleDrop = (e) => {
  emit('drop', e, props.field)
}

const getDependencyTooltip = (field) => {
  if (!field.dependencies || field.dependencies.length === 0) return ''
  const dep = field.dependencies[0]
  // In a real app we'd look up the parent name
  return `Conditional: Show if parent field ${dep.condition} ${dep.value}`
}
</script>

<style scoped>
[draggable='true'] {
  @apply cursor-grab;
}

[draggable='true']:active {
  @apply cursor-grabbing;
}
</style>
