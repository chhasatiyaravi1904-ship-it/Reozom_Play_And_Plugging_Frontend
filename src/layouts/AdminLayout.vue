<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import { Menu, ShieldCheck } from 'lucide-vue-next'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import ToastContainer from '@/components/ui/ToastContainer.vue'

const isSidebarOpen = ref(false)
</script>

<template>
  <div class="flex min-h-screen bg-slate-50 text-slate-900">
    <AdminSidebar :open="isSidebarOpen" @close="isSidebarOpen = false" />

    <div class="flex min-w-0 flex-1 flex-col">
      <!-- Mobile header -->
      <header
        class="flex h-16 items-center justify-between border-b border-slate-200/80 bg-white px-4 lg:hidden"
      >
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Open menu"
            @click="isSidebarOpen = true"
          >
            <Menu class="h-5 w-5" />
          </button>
          <div class="flex items-center gap-2">
            <ShieldCheck class="h-5 w-5 text-[#0f6b5c]" />
            <span class="text-sm font-semibold tracking-tight text-slate-900">Reozom Admin</span>
          </div>
        </div>
      </header>

      <!-- Main content area -->
      <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <RouterView />
      </main>
    </div>

    <ToastContainer />
  </div>
</template>

