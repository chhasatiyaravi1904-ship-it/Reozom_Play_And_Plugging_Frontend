<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { Check } from 'lucide-vue-next'

export interface StepperItem {
  id: string
  label: string
  status: 'completed' | 'current' | 'upcoming'
}

const props = defineProps<{
  steps: StepperItem[]
}>()

defineEmits<{
  (e: 'select', stepId: string): void
}>()

/**
 * Listings can have 12+ steps, so each step keeps a minimum width and the row scrolls
 * sideways when it doesn't fit, instead of squeezing the labels into each other.
 */
const track = ref<HTMLElement | null>(null)

// Keep the current step visible without scrolling the page itself.
function revealCurrentStep() {
  const el = track.value?.querySelector<HTMLElement>('[data-current="true"]')
  if (!track.value || !el) return
  track.value.scrollLeft = el.offsetLeft - track.value.clientWidth / 2 + el.clientWidth / 2
}

onMounted(revealCurrentStep)
watch(
  () => props.steps.map((s) => s.status).join(),
  () => nextTick(revealCurrentStep),
)
</script>

<template>
  <nav aria-label="Listing progress" class="w-full mb-8">
    <ol ref="track" class="relative flex w-full overflow-x-auto pb-2">
      <li
        v-for="(step, index) in steps"
        :key="step.id"
        class="relative flex min-w-[84px] flex-1 flex-col items-center"
        :data-current="step.status === 'current'"
      >
        <!-- Line from this circle's centre to the next one's (circles sit on top of it) -->
        <span
          v-if="index < steps.length - 1"
          aria-hidden="true"
          class="absolute left-1/2 top-3 h-0.5 w-full -translate-y-1/2"
          :class="step.status === 'completed' ? 'bg-secondary' : 'bg-border'"
        ></span>

        <button
          type="button"
          class="group focus-ring relative z-10 flex flex-col items-center gap-2 rounded-lg px-1.5 pb-1 disabled:cursor-default"
          :disabled="step.status === 'upcoming'"
          :aria-current="step.status === 'current' ? 'step' : undefined"
          :title="step.label"
          @click="$emit('select', step.id)"
        >
          <span
            class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-colors"
            :class="{
              'border-secondary bg-secondary text-white': step.status === 'completed',
              'border-secondary bg-surface ring-4 ring-secondary/15': step.status === 'current',
              'border-border bg-surface text-fg-muted': step.status === 'upcoming',
            }"
          >
            <Check v-if="step.status === 'completed'" class="h-3.5 w-3.5" stroke-width="3" aria-hidden="true" />
            <span v-else-if="step.status === 'current'" class="h-2.5 w-2.5 rounded-full bg-secondary"></span>
            <template v-else>{{ index + 1 }}</template>
          </span>

          <span
            class="line-clamp-2 max-w-[92px] text-center text-[11px] leading-tight transition-colors"
            :class="{
              'font-bold text-fg': step.status === 'current',
              'font-medium text-fg group-hover:text-secondary': step.status === 'completed',
              'text-fg-muted': step.status === 'upcoming',
            }"
          >
            {{ step.label }}
          </span>
          <span class="sr-only">
            ({{ step.status === 'completed' ? 'completed' : step.status === 'current' ? 'current step' : 'not started' }})
          </span>
        </button>
      </li>
    </ol>
  </nav>
</template>
