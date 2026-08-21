<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { MoreHorizontal, type LucideIcon } from 'lucide-vue-next'

defineProps<{
  items: { label: string; icon: LucideIcon; value: string; destructive?: boolean }[]
}>()

const emit = defineEmits<{
  (e: 'select', value: string): void
}>()

const isOpen = ref(false)

function toggle(event: Event) {
  event.stopPropagation()
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

function handleSelect(value: string) {
  close()
  emit('select', value)
}

function handleOutsideClick() {
  isOpen.value = false
}

watch(isOpen, (open) => {
  if (open) {
    window.addEventListener('click', handleOutsideClick)
  } else {
    window.removeEventListener('click', handleOutsideClick)
  }
})

onUnmounted(() => {
  window.removeEventListener('click', handleOutsideClick)
})
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-lg text-fg-muted hover:bg-surface-raised hover:text-fg transition-colors"
      :class="{ 'bg-surface-raised text-fg': isOpen }"
      aria-label="More actions"
      @click="toggle"
    >
      <MoreHorizontal class="h-4 w-4" />
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 z-30 mt-1 w-48 rounded-xl border border-border bg-surface p-1 text-left shadow-lg"
      @click.stop
    >
      <button
        v-for="item in items"
        :key="item.value"
        type="button"
        class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
        :class="
          item.destructive
            ? 'text-danger hover:bg-danger-soft'
            : 'text-fg hover:bg-surface-raised'
        "
        @click="handleSelect(item.value)"
      >
        <component :is="item.icon" class="h-3.5 w-3.5" :class="item.destructive ? 'text-danger' : 'text-fg-muted'" />
        <span>{{ item.label }}</span>
      </button>
    </div>
  </div>
</template>
