<script setup lang="ts">
import BaseBadge from '@/components/ui/BaseBadge.vue'

defineProps<{
  tabs: { label: string; value: string; count?: number }[]
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <div class="flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar" role="tablist">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      type="button"
      role="tab"
      :aria-selected="modelValue === tab.value"
      class="group relative flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors outline-none"
      :class="
        modelValue === tab.value
          ? 'border-primary text-primary font-semibold'
          : 'border-transparent text-fg-muted hover:border-border hover:text-fg'
      "
      @click="emit('update:modelValue', tab.value)"
    >
      <span>{{ tab.label }}</span>
      <BaseBadge v-if="tab.count !== undefined" :variant="modelValue === tab.value ? 'primary' : 'secondary'">
        {{ tab.count }}
      </BaseBadge>
    </button>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
