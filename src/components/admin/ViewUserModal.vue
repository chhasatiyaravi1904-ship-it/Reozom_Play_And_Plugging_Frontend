<script setup lang="ts">
import { Mail, Phone, MapPin, Calendar, Activity, Shield, Edit3 } from 'lucide-vue-next'
import type { AdminUserItem } from '@/services/adminUsersData'
import Modal from '@/components/ui/Modal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import UserRoleBadge from '@/components/admin/UserRoleBadge.vue'
import UserAvatar from '@/components/admin/UserAvatar.vue'

defineProps<{
  modelValue: boolean
  user: AdminUserItem | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'edit', user: AdminUserItem): void
  (e: 'changeRole', user: AdminUserItem): void
}>()

function handleClose() {
  emit('update:modelValue', false)
}
</script>

<template>
  <Modal v-if="user" :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <div class="flex items-center gap-3.5">
      <UserAvatar :name="user.fullName" :role="user.role" size="lg" />
      <div>
        <h3 class="text-base font-semibold text-fg leading-tight">{{ user.fullName }}</h3>
        <p class="text-xs text-fg-muted">{{ user.email }}</p>
        <div class="mt-1.5 flex items-center gap-2">
          <UserRoleBadge :role="user.role" />
          <StatusBadge kind="user" emphasized :status="user.status" />
        </div>
      </div>
    </div>

    <!-- Body / Details -->
    <div class="mt-4 space-y-3.5 text-xs text-fg-muted">
      <div class="flex items-center gap-3 rounded-lg bg-surface-raised p-2.5 border border-border">
        <Mail class="h-4 w-4 text-fg-muted shrink-0" />
        <div class="min-w-0 flex-1">
          <p class="text-[11px] font-medium text-fg-muted">Email Address</p>
          <p class="truncate font-medium text-fg">{{ user.email }}</p>
        </div>
      </div>

      <div class="flex items-center gap-3 rounded-lg bg-surface-raised p-2.5 border border-border">
        <Phone class="h-4 w-4 text-fg-muted shrink-0" />
        <div class="min-w-0 flex-1">
          <p class="text-[11px] font-medium text-fg-muted">Phone Number</p>
          <p class="truncate font-medium text-fg">{{ user.phone }}</p>
        </div>
      </div>

      <div
        v-if="user.location"
        class="flex items-center gap-3 rounded-lg bg-surface-raised p-2.5 border border-border"
      >
        <MapPin class="h-4 w-4 text-fg-muted shrink-0" />
        <div class="min-w-0 flex-1">
          <p class="text-[11px] font-medium text-fg-muted">Location</p>
          <p class="truncate font-medium text-fg">{{ user.location }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-lg bg-surface-raised p-2.5 border border-border">
          <div class="flex items-center gap-1.5 text-[11px] font-medium text-fg-muted">
            <Calendar class="h-3.5 w-3.5" />
            <span>Joined Date</span>
          </div>
          <p class="mt-1 font-medium text-fg">{{ user.joinedDate }}</p>
        </div>

        <div class="rounded-lg bg-surface-raised p-2.5 border border-border">
          <div class="flex items-center gap-1.5 text-[11px] font-medium text-fg-muted">
            <Activity class="h-3.5 w-3.5" />
            <span>Last Active</span>
          </div>
          <p class="mt-1 font-medium text-fg">{{ user.lastActive || 'Recently' }}</p>
        </div>
      </div>

      <div
        v-if="user.listingsCount !== undefined"
        class="rounded-lg bg-surface-raised p-2.5 border border-border"
      >
        <div class="flex items-center justify-between text-[11px]">
          <span class="text-fg-muted font-medium">Associated Listings</span>
          <span class="font-semibold text-fg">{{ user.listingsCount }} listings</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex w-full items-center justify-between">
        <BaseButton variant="secondary" size="sm" @click="emit('changeRole', user); handleClose()">
          <Shield class="h-3.5 w-3.5" />
          <span class="ml-1.5">Change Role</span>
        </BaseButton>

        <div class="flex gap-2">
          <BaseButton variant="secondary" size="sm" @click="handleClose">Close</BaseButton>
          <BaseButton variant="primary" size="sm" @click="emit('edit', user); handleClose()">
            <Edit3 class="h-3.5 w-3.5" />
            <span class="ml-1.5">Edit User</span>
          </BaseButton>
        </div>
      </div>
    </template>
  </Modal>
</template>
