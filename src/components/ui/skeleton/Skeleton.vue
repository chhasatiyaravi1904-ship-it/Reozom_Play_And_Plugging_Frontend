<script setup lang="ts">
/**
 * One shimmering placeholder block. Size it with classes, e.g.
 * <Skeleton class="h-4 w-32" /> or <Skeleton class="h-10 w-10" rounded="full" />.
 */
withDefaults(
  defineProps<{
    rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  }>(),
  { rounded: 'md' },
)

const radius: Record<string, string> = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
}
</script>

<template>
  <div class="skeleton" :class="radius[rounded]" aria-hidden="true"></div>
</template>
