<script setup lang="ts">
defineProps<{
  chips: { key: string; label: string }[]
}>()

const emit = defineEmits<{
  (e: 'remove', key: string): void
  (e: 'clear'): void
}>()
</script>

<template>
  <div v-if="chips.length > 0" class="flex flex-wrap items-center gap-1.5">
    <span
      v-for="chip in chips"
      :key="chip.key"
      class="inline-flex items-center gap-1 rounded-full bg-primary-soft py-1 pl-2.5 pr-1.5 text-xs font-medium text-primary-active"
    >
      {{ chip.label }}
      <button
        type="button"
        class="focus-ring inline-flex h-4 w-4 items-center justify-center rounded-full text-primary-active/70 hover:bg-primary/10 hover:text-primary-active transition-colors"
        :aria-label="`Remove ${chip.label} filter`"
        @click="emit('remove', chip.key)"
      >
        ✕
      </button>
    </span>
    <button
      v-if="chips.length > 1"
      type="button"
      class="focus-ring text-xs font-medium text-fg-muted hover:text-fg transition-colors"
      @click="emit('clear')"
    >
      Clear all
    </button>
  </div>
</template>
