<script setup lang="ts">
import { SearchX } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
</script>

<template>
  <div class="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
    <SearchX class="h-9 w-9 text-fg-muted" aria-hidden="true" />
    <h1 class="text-2xl font-semibold text-fg">Page not found</h1>
    <p class="max-w-sm text-sm text-fg-muted">
      The page you're looking for doesn't exist or may have moved.
    </p>
    <RouterLink to="/dashboard">
      <BaseButton>Go to Dashboard</BaseButton>
    </RouterLink>
  </div>
</template>
