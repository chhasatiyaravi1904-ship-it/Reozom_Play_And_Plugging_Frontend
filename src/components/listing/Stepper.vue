<script setup lang="ts">
import { Check } from 'lucide-vue-next'

export interface StepperItem {
  id: string
  label: string
  status: 'completed' | 'current' | 'upcoming'
}

defineProps<{
  steps: StepperItem[]
}>()

defineEmits<{
  (e: 'select', stepId: string): void
}>()
</script>

<template>
  <nav aria-label="Listing progress" class="w-full mb-8">
    <div class="flex items-center justify-between w-full relative">
      <div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-outline-variant/30 z-0"></div>
      
      <div v-for="(step, index) in steps" :key="step.id" class="relative z-10 flex flex-col items-center flex-1">
        <!-- Connecting Line fill -->
        <div 
          v-if="index < steps.length - 1" 
          class="absolute left-1/2 top-[11px] h-[2px] w-full"
          :class="step.status === 'completed' ? 'bg-secondary' : 'bg-transparent'"
          style="transform: translateX(50%); z-index: -1;"
        ></div>

        <button
          type="button"
          class="group outline-none flex flex-col items-center"
          :disabled="step.status === 'upcoming'"
          @click="$emit('select', step.id)"
        >
          <div
            class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-surface transition-colors"
            :class="{
              'border-secondary ring-4 ring-secondary/20': step.status === 'current',
              'border-secondary bg-secondary text-surface-container-lowest': step.status === 'completed',
              'border-outline-variant text-transparent hover:border-outline': step.status === 'upcoming',
            }"
          >
            <span v-if="step.status === 'completed'" class="material-symbols-outlined text-[14px]" data-icon="check">check</span>
            <div v-else-if="step.status === 'current'" class="w-2.5 h-2.5 rounded-full bg-secondary"></div>
          </div>
          <span
            class="mt-3 text-label-sm font-label-sm hidden sm:block whitespace-nowrap transition-colors"
            :class="{
              'text-primary font-bold': step.status === 'current',
              'text-primary': step.status === 'completed',
              'text-outline-variant': step.status === 'upcoming'
            }"
          >
            {{ step.label }}
          </span>
        </button>
      </div>
    </div>
  </nav>
</template>
