<script setup lang="ts">
defineProps<{
  title?: string
  padding?: boolean
  interactive?: boolean
}>()
</script>

<template>
  <div
    class="overflow-hidden rounded-xl border border-border bg-surface"
    :class="interactive ? 'shadow-sm transition-shadow hover:shadow-md cursor-pointer' : ''"
  >
    <div v-if="title || $slots.header" class="border-b border-border bg-surface-raised p-4">
      <slot name="header">
        <h3 v-if="title" class="text-lg font-semibold text-fg">{{ title }}</h3>
      </slot>
    </div>

    <div :class="padding === false ? '' : 'p-4'">
      <slot></slot>
    </div>

    <div v-if="$slots.footer" class="border-t border-border bg-surface-raised p-4">
      <slot name="footer"></slot>
    </div>
  </div>
</template>
