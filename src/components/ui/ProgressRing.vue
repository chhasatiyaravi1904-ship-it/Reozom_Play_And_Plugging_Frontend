<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  percent: number
  size?: number
}>()

const size = computed(() => props.size || 96)
const strokeWidth = 8
const radius = computed(() => (size.value - strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const offset = computed(() => circumference.value * (1 - Math.min(props.percent, 100) / 100))
</script>

<template>
  <div
    class="relative inline-flex items-center justify-center"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <svg :width="size" :height="size" class="-rotate-90">
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        stroke-width="8"
        class="stroke-border"
      />
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        fill="none"
        stroke-width="8"
        stroke-linecap="round"
        class="stroke-primary transition-[stroke-dashoffset] duration-500"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
      />
    </svg>
    <span class="absolute text-lg font-semibold text-fg">{{ Math.round(percent) }}%</span>
  </div>
</template>
