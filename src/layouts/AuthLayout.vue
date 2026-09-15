<script setup lang="ts">
import { RouterView } from 'vue-router'
import ToastContainer from '@/components/ui/ToastContainer.vue'

withDefaults(
  defineProps<{
    tagline?: string
  }>(),
  {
    tagline: 'Smart Listings. Simple Process.',
  },
)
</script>

<template>
  <div class="flex min-h-screen flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
    <div class="mx-auto w-full max-w-sm">
      <div class="mb-10">
        <span class="text-xl font-bold tracking-tight text-fg">REOZOM</span>
        <p class="text-xs text-fg-muted">{{ tagline }}</p>
      </div>
      <RouterView />
    </div>

    <ToastContainer />
  </div>
</template>
