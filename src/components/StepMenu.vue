<template>
  <div class="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-neutral-200 z-50 py-1">
    <button
      class="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition"
      @click="emit('edit')"
    >
      Edit Step
    </button>
    <button
      class="w-full text-left px-4 py-2 text-sm text-danger hover:bg-red-50 transition"
      @click="emit('delete')"
    >
      Delete Step
    </button>
  </div>
</template>

<script setup>
defineProps({
  step: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'edit', 'delete'])

// Close menu on outside click logic would normally go here
</script>
