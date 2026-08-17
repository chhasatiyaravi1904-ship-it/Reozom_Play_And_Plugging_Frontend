<script setup lang="ts">
import { RouterView } from 'vue-router'
import ToastContainer from '@/components/ui/ToastContainer.vue'

withDefaults(
  defineProps<{
    tagline?: string
    quote?: string
    quoteDescription?: string
  }>(),
  {
    tagline: 'Smart Listings. Simple Process.',
    quote: '"List your property the smart way — one guided step at a time."',
    quoteDescription: 'Save your progress anytime and pick up right where you left off.',
  },
)
</script>

<template>
  <div class="grid min-h-screen grid-cols-1 lg:grid-cols-2">
    <div class="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
      <div class="mx-auto w-full max-w-sm">
        <div class="mb-10">
          <span class="text-xl font-bold tracking-tight text-fg">REOZOM</span>
          <p class="text-xs text-fg-muted">{{ tagline }}</p>
        </div>
        <RouterView />
      </div>
    </div>

    <div class="hidden border-l border-border bg-primary-soft lg:block">
      <div class="flex h-full flex-col items-start justify-end p-12 xl:p-16">
        <blockquote class="max-w-md text-2xl leading-snug font-semibold text-fg">
          {{ quote }}
        </blockquote>
        <p class="mt-4 text-sm text-fg-muted">{{ quoteDescription }}</p>
      </div>
    </div>

    <ToastContainer />
  </div>
</template>
