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
  <nav aria-label="Listing progress">
    <ol class="flex gap-4 overflow-x-auto pb-2 sm:gap-6 md:overflow-visible">
      <li v-for="(step, index) in steps" :key="step.id" class="flex shrink-0 items-center gap-3">
        <button
          type="button"
          class="flex items-center gap-2 outline-none focus-visible:ring-3 focus-visible:ring-primary/30 rounded-full"
          :disabled="step.status === 'upcoming'"
          @click="$emit('select', step.id)"
        >
          <span
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold"
            :class="{
              'border-primary bg-primary text-white': step.status === 'current',
              'border-success bg-success text-white': step.status === 'completed',
              'border-border bg-surface text-fg-muted': step.status === 'upcoming',
            }"
          >
            <Check v-if="step.status === 'completed'" class="h-4 w-4" aria-hidden="true" />
            <span v-else>{{ index + 1 }}</span>
          </span>
          <span
            class="text-sm font-medium whitespace-nowrap"
            :class="step.status === 'upcoming' ? 'text-fg-muted' : 'text-fg'"
          >
            {{ step.label }}
          </span>
        </button>
        <span
          v-if="index < steps.length - 1"
          class="h-px w-6 shrink-0 sm:w-10"
          :class="step.status === 'completed' ? 'bg-success' : 'bg-border'"
          aria-hidden="true"
        ></span>
      </li>
    </ol>
  </nav>
</template>
