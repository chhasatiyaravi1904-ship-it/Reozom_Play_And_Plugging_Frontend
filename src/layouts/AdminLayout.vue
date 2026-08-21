<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import { Menu, ShieldCheck } from 'lucide-vue-next'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import AdminProfileMenu from '@/components/admin/AdminProfileMenu.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'

const isSidebarOpen = ref(false)
</script>

<template>
  <div class="flex min-h-screen bg-surface-raised text-fg">
    <AdminSidebar :open="isSidebarOpen" @close="isSidebarOpen = false" />

    <div class="flex min-w-0 flex-1 flex-col">
      <!-- Header: mobile menu trigger on the left, profile menu always on the right -->
      <header
        class="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-4 sm:px-6 lg:px-8"
      >
        <div class="flex items-center gap-3 lg:hidden">
          <button
            type="button"
            class="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg text-fg-muted hover:bg-surface-raised hover:text-fg transition-colors"
            aria-label="Open menu"
            @click="isSidebarOpen = true"
          >
            <Menu class="h-5 w-5" />
          </button>
          <div class="flex items-center gap-2">
            <ShieldCheck class="h-5 w-5 text-primary" />
            <span class="text-sm font-semibold tracking-tight text-fg">Reozom Admin</span>
          </div>
        </div>

        <AdminProfileMenu class="ml-auto" />
      </header>

      <!-- Main content area -->
      <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <RouterView />
      </main>
    </div>

    <ToastContainer />
  </div>
</template>

