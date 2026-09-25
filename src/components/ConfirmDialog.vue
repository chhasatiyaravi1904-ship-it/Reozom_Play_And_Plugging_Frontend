<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 transition">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
        <div class="p-5">
          <h3 class="text-lg font-semibold text-neutral-900 mb-2">{{ title }}</h3>
          <p class="text-sm text-neutral-600">{{ message }}</p>
        </div>
        <div class="flex items-center justify-end gap-2 px-5 py-4 bg-neutral-50 border-t border-neutral-200">
          <button
            @click="emit('cancel')"
            class="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded transition"
          >
            Cancel
          </button>
          <button
            @click="emit('confirm')"
            class="px-4 py-2 text-sm font-medium text-white bg-danger hover:bg-danger/90 rounded transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['confirm', 'cancel'])
</script>
