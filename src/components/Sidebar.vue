<template>
  <aside class="w-[280px] bg-neutral-50 border-r border-neutral-300 flex flex-col h-full shrink-0">
    <!-- Search Bar -->
    <div class="p-4 border-b border-neutral-200">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <IconSearch :size="16" class="text-neutral-400" />
        </div>
        <input
          type="text"
          placeholder="Search steps..."
          class="w-full pl-9 pr-3 py-2 bg-white border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
        />
      </div>
    </div>

    <!-- Steps List -->
    <div class="flex-1 overflow-y-auto p-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold text-neutral-900">Steps ({{ steps.length }})</h3>
      </div>

      <div class="space-y-2">
        <StepCard
          v-for="step in steps"
          :key="step.id"
          :step="step"
          :is-active="activeStepId === step.id"
          @select="emit('select-step', step.id)"
          @drag-start="handleDragStart"
          @drop="handleDrop"
          @edit="emit('edit-step', $event)"
          @delete="emit('delete-step', $event)"
        />
      </div>

      <!-- Add New Step Button -->
      <button
        @click="emit('add-step')"
        class="w-full mt-4 flex items-center justify-center gap-2 py-2 border border-dashed border-neutral-400 text-neutral-600 rounded-md hover:bg-neutral-100 hover:text-primary hover:border-primary transition text-sm font-medium"
      >
        <IconPlus :size="16" /> Add New Step
      </button>

      <p class="mt-4 text-xs text-neutral-500 text-center">
        Drag to reorder. Fields move with step.
      </p>
    </div>
  </aside>
</template>

<script setup>
import { IconSearch, IconPlus } from '@tabler/icons-vue'
import StepCard from './StepCard.vue'

defineProps({
  steps: {
    type: Array,
    required: true
  },
  activeStepId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['select-step', 'add-step', 'edit-step', 'delete-step', 'drag-step'])

let draggedStep = null

const handleDragStart = (e, step) => {
  draggedStep = step
  // e.dataTransfer.setData('text/plain', step.id) // if needed
}

const handleDrop = (e, targetStep) => {
  if (draggedStep && draggedStep.id !== targetStep.id) {
    emit('drag-step', { source: draggedStep, target: targetStep })
  }
  draggedStep = null
}
</script>
