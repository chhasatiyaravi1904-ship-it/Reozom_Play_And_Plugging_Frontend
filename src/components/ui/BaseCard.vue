<script setup lang="ts">
defineProps<{
  title?: string
  padding?: boolean
  interactive?: boolean
}>()
</script>

<template>
  <div
    class="overflow-hidden rounded-xl border border-border bg-surface transition-all duration-300"
    :class="interactive ? 'shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-primary/40 cursor-pointer relative group before:absolute before:inset-0 before:bg-gradient-to-br before:from-transparent before:to-primary/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:pointer-events-none' : ''"
  >
    <div v-if="title || $slots.header" class="relative z-10 border-b border-border bg-surface-raised p-4">
      <slot name="header">
        <h3 v-if="title" class="text-lg font-semibold text-fg">{{ title }}</h3>
      </slot>
    </div>

    <div :class="[padding === false ? '' : 'p-5', 'relative z-10 h-full flex flex-col justify-between']">
      <slot></slot>
    </div>

    <div v-if="$slots.footer" class="relative z-10 border-t border-border bg-surface-raised p-4">
      <slot name="footer"></slot>
    </div>
  </div>
</template>
