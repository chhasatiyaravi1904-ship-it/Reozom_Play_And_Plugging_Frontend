<script setup lang="ts">
import { RouterView } from 'vue-router'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import TopNavBar from '@/components/layout/TopNavBar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

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
  <div class="bg-gradient-to-b from-surface-container-low via-surface-bright to-surface flex flex-col min-h-screen">
    <TopNavBar />
    
    <div class="flex-grow flex items-center justify-center p-6 py-12">
      <div class="w-full max-w-lg bg-surface-container-lowest rounded-2xl border border-outline-variant/60 shadow-xl p-8 transform transition-all">
        <div class="flex flex-col items-center mb-8">
          <span class="text-headline-md font-headline-md font-extrabold tracking-tight text-primary">REOZOM</span>
          <p class="text-body-sm font-body-sm text-on-surface-variant mt-1">{{ tagline }}</p>
        </div>
        <RouterView />
      </div>
    </div>

    <AppFooter />
    <ToastContainer />
  </div>
</template>
