<script setup lang="ts">
defineProps<{
  items: { label: string; to?: string }[]
}>()
</script>

<template>
  <nav class="flex items-center gap-1.5 text-xs text-fg-muted" aria-label="Breadcrumb">
    <template v-for="(item, idx) in items" :key="idx">
      <span v-if="idx > 0" aria-hidden="true">/</span>
      <RouterLink
        v-if="item.to"
        :to="item.to"
        class="font-medium text-fg-muted hover:text-fg transition-colors"
      >
        {{ item.label }}
      </RouterLink>
      <span
        v-else
        class="font-medium"
        :class="idx === items.length - 1 ? 'text-fg font-semibold' : 'text-fg-muted'"
      >
        {{ item.label }}
      </span>
    </template>
  </nav>
</template>
