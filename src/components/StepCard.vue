<template>
  <div
    :class="[
      'flex items-center justify-between p-3 mb-2 border rounded-md transition cursor-grab relative',
      isActive
        ? 'border-primary bg-primary-soft'
        : 'border-neutral-300 bg-white hover:bg-neutral-50'
    ]"
    draggable="true"
    @dragstart="handleDragStart"
    @dragover.prevent
    @drop="handleDrop"
    @click="emit('select')"
  >
    <div class="flex items-center gap-2 flex-1">
      <div class="w-2 h-6 rounded-r cursor-grab text-neutral-400 flex items-center justify-center">
        <IconGripVertical :size="18" />
      </div>
      <div class="flex-1">
        <div class="text-xs font-semibold text-primary">{{ `Step ${step.order}` }}</div>
        <div class="text-sm font-medium text-neutral-900">{{ step.name }}</div>
      </div>
      <div class="text-xs font-semibold text-neutral-500 bg-neutral-200 px-2 py-1 rounded-full">
        {{ fieldCount }} fields
      </div>
    </div>

    <div class="relative">
      <button
        class="p-1 text-neutral-400 hover:text-primary hover:bg-neutral-100 rounded transition"
        @click.stop="toggleMenu"
      >
        <IconDotsVertical :size="18" />
      </button>

      <StepMenu 
        v-if="menuOpen" 
        :step="step" 
        @close="menuOpen = false" 
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { IconGripVertical, IconDotsVertical } from '@tabler/icons-vue'
import StepMenu from './StepMenu.vue'

const props = defineProps({
  step: {
    type: Object,
    required: true
  },
  isActive: Boolean
})

const fieldCount = computed(() => {
  if (!props.step.sections) return 0
  return props.step.sections.reduce((total, section) => total + (section.fields?.length || 0), 0)
})

const emit = defineEmits(['drag-start', 'drop', 'select', 'edit', 'delete'])
const menuOpen = ref(false)

const handleDragStart = (e) => {
  e.dataTransfer.effectAllowed = 'move'
  emit('drag-start', e, props.step)
}

const handleDrop = (e) => {
  emit('drop', e, props.step)
}

const handleEdit = () => {
  menuOpen.value = false
  emit('edit', props.step)
}

const handleDelete = () => {
  menuOpen.value = false
  emit('delete', props.step)
}

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}
</script>

<style scoped>
[draggable='true'] {
  @apply cursor-grab;
}

[draggable='true']:active {
  @apply cursor-grabbing opacity-70;
}
</style>
