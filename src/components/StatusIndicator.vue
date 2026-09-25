<template>
  <div class="flex items-center gap-2 text-sm">
    <template v-if="status === 'saving'">
      <IconLoader2 :size="16" class="text-neutral-500 animate-spin" />
      <span class="text-neutral-500">Saving changes...</span>
    </template>
    <template v-else-if="status === 'saved'">
      <IconCheck :size="16" class="text-success" />
      <span class="text-success">All changes saved</span>
    </template>
    <template v-else>
      <!-- idle/unsaved -->
      <div v-if="hasChanges" class="flex items-center gap-2 text-warning">
        <div class="w-2 h-2 rounded-full bg-warning"></div>
        <span>Unsaved changes</span>
      </div>
      <div v-else class="text-neutral-500 flex items-center gap-2">
        <IconCloudCheck :size="16" />
        <span>Up to date</span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { IconLoader2, IconCheck, IconCloudCheck } from '@tabler/icons-vue'

defineProps({
  status: {
    type: String,
    required: true // 'idle', 'saving', 'saved'
  },
  hasChanges: {
    type: Boolean,
    default: false
  }
})
</script>
