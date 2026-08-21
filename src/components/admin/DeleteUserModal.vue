<script setup lang="ts">
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import type { AdminUserItem } from '@/services/adminUsersData'

defineProps<{
  modelValue: boolean
  user: AdminUserItem | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'confirmDelete', user: AdminUserItem): void
}>()

function handleConfirm(user: AdminUserItem) {
  emit('confirmDelete', user)
  emit('update:modelValue', false)
}
</script>

<template>
  <ConfirmDialog
    v-if="user"
    :model-value="modelValue"
    title="Delete User Account"
    tone="danger"
    confirm-label="Delete User"
    @update:model-value="emit('update:modelValue', $event)"
    @confirm="handleConfirm(user)"
  >
    Are you sure you want to delete the user account for
    <span class="font-semibold text-fg">{{ user.fullName }}</span>
    (<span class="text-fg-muted">{{ user.email }}</span>)?
    This action cannot be undone. All active sessions, permission bindings, and notifications will be revoked.
  </ConfirmDialog>
</template>
