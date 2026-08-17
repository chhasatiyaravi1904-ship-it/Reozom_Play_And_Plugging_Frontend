<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()

const variantClasses: Record<string, string> = {
  success: 'border-success/30 bg-success-soft text-success',
  error: 'border-danger/30 bg-danger/10 text-danger',
  info: 'border-primary/30 bg-primary-soft text-primary-active',
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 sm:right-6 sm:bottom-6"
    >
      <TransitionGroup name="toast">
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          class="flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-md"
          :class="variantClasses[toast.variant]"
          role="status"
        >
          <span>{{ toast.text }}</span>
          <button
            type="button"
            class="shrink-0 opacity-70 outline-none hover:opacity-100"
            aria-label="Dismiss"
            @click="toastStore.dismiss(toast.id)"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
