<template>
  <div
    :class="[
      'flex items-center justify-between p-3 mb-2 border rounded-md transition relative',
      isFixed ? 'cursor-pointer' : 'cursor-grab',
      isActive
        ? 'border-primary bg-primary-soft'
        : step.locked
          ? 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100'
          : 'border-neutral-300 bg-white hover:bg-neutral-50'
    ]"
    :draggable="!isFixed"
    @dragstart="handleDragStart"
    @dragover.prevent
    @drop="handleDrop"
    @click="emit('select')"
  >
    <div class="flex items-center gap-2 flex-1">
      <div v-if="!isReadOnly && !isFixed" class="w-2 h-6 rounded-r cursor-grab text-neutral-400 flex items-center justify-center">
        <IconGripVertical :size="18" />
      </div>
      <div v-else-if="isFixed" class="w-2 h-6 text-neutral-400 flex items-center justify-center" title="Payment is always the last step">
        <IconLock :size="16" />
      </div>
      <div class="flex-1">
        <div v-if="step.isSystem || step.locked || step.type === 'disclosure'" class="flex items-center gap-2 mb-0.5">
          <div v-if="step.isSystem" class="text-[10px] uppercase font-bold text-white bg-primary px-1.5 py-0.5 rounded">System</div>
          <div
            v-if="step.locked"
            class="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-neutral-600 bg-neutral-200 px-1.5 py-0.5 rounded"
            :title="isFixed ? 'Questions cannot be edited. Always the last step.' : 'Questions cannot be edited and the step cannot be deleted. You can move it.'"
          ><IconLock :size="10" /> Not editable</div>
          <div
            v-if="step.type === 'disclosure'"
            class="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded"
            :title="`Linked to disclosure ${step.disclosure_code}`"
          >Disclosure</div>
          <div
            v-if="step.type === 'disclosure' && step.customized"
            class="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded"
            title="Questions were edited for this process"
          >Edited</div>
        </div>
        <div class="text-sm font-medium text-neutral-900">{{ step.name }}</div>
      </div>
      <div class="text-xs font-semibold text-neutral-500 bg-neutral-200 px-2 py-1 rounded-full">
        {{ fieldCount }} fields
      </div>
    </div>

    <div class="relative" v-if="!isReadOnly && !step.locked">
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
import { IconGripVertical, IconDotsVertical, IconLock } from '@tabler/icons-vue'
import StepMenu from './StepMenu.vue'

const props = defineProps({
  step: {
    type: Object,
    required: true
  },
  isActive: Boolean,
  isReadOnly: {
    type: Boolean,
    default: false
  }
})

// Payment is the only step that can't be moved (always last)
const isFixed = computed(() => props.step.locked && props.step.kind === 'payment')

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
