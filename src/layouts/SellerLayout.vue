<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-surface">
    <AppHeader />
    <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-6 md:py-8">
      <RouterView />
    </main>
    <AppFooter />
    <ToastContainer />
  </div>
</template>
