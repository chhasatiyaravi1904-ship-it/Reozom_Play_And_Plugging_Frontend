<script setup lang="ts">
import { X, Mail, Phone, MapPin, Calendar, Activity, Shield, Edit3 } from 'lucide-vue-next'
import type { AdminUserItem } from '@/services/adminUsersData'
import UserRoleBadge from '@/components/admin/UserRoleBadge.vue'
import UserStatusDot from '@/components/admin/UserStatusDot.vue'
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
  <Teleport to="body">
    <div
      v-if="modelValue && user"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        @click="handleClose"
      ></div>

      <div
        class="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all"
      >
        <!-- Header -->
        <div class="flex items-start justify-between border-b border-slate-100 pb-4">
          <div class="flex items-center gap-3.5">
            <UserAvatar :name="user.fullName" :role="user.role" size="lg" />
            <div>
              <h3 class="text-base font-semibold text-slate-900 leading-tight">
                {{ user.fullName }}
              </h3>
              <p class="text-xs text-slate-500">@{{ user.username }}</p>
              <div class="mt-1.5 flex items-center gap-2">
                <UserRoleBadge :role="user.role" />
                <UserStatusDot :status="user.status" />
              </div>
            </div>
          </div>
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            @click="handleClose"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <!-- Body / Details -->
        <div class="mt-4 space-y-3.5 text-xs text-slate-600">
          <div class="flex items-center gap-3 rounded-lg bg-slate-50/80 p-2.5 border border-slate-200/60">
            <Mail class="h-4 w-4 text-slate-400 shrink-0" />
            <div class="min-w-0 flex-1">
              <p class="text-[11px] font-medium text-slate-400">Email Address</p>
              <p class="truncate font-medium text-slate-800">{{ user.email }}</p>
            </div>
          </div>

          <div class="flex items-center gap-3 rounded-lg bg-slate-50/80 p-2.5 border border-slate-200/60">
            <Phone class="h-4 w-4 text-slate-400 shrink-0" />
            <div class="min-w-0 flex-1">
              <p class="text-[11px] font-medium text-slate-400">Phone Number</p>
              <p class="truncate font-medium text-slate-800">{{ user.phone }}</p>
            </div>
          </div>

          <div
            v-if="user.location"
            class="flex items-center gap-3 rounded-lg bg-slate-50/80 p-2.5 border border-slate-200/60"
          >
            <MapPin class="h-4 w-4 text-slate-400 shrink-0" />
            <div class="min-w-0 flex-1">
              <p class="text-[11px] font-medium text-slate-400">Location</p>
              <p class="truncate font-medium text-slate-800">{{ user.location }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-lg bg-slate-50/80 p-2.5 border border-slate-200/60">
              <div class="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                <Calendar class="h-3.5 w-3.5" />
                <span>Joined Date</span>
              </div>
              <p class="mt-1 font-medium text-slate-800">{{ user.joinedDate }}</p>
            </div>

            <div class="rounded-lg bg-slate-50/80 p-2.5 border border-slate-200/60">
              <div class="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                <Activity class="h-3.5 w-3.5" />
                <span>Last Active</span>
              </div>
              <p class="mt-1 font-medium text-slate-800">{{ user.lastActive || 'Recently' }}</p>
            </div>
          </div>

          <div
            v-if="user.department || user.listingsCount !== undefined"
            class="rounded-lg bg-slate-50/80 p-2.5 border border-slate-200/60"
          >
            <div class="flex items-center justify-between text-[11px]">
              <span class="text-slate-400 font-medium">
                {{ user.department ? 'Department' : 'Associated Listings' }}
              </span>
              <span class="font-semibold text-slate-700">
                {{ user.department || user.listingsCount + ' listings' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50"
            @click="emit('changeRole', user); handleClose()"
          >
            <Shield class="h-3.5 w-3.5 text-slate-500" />
            <span>Change Role</span>
          </button>
          <div class="flex gap-2">
            <button
              type="button"
              class="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50"
              @click="handleClose"
            >
              Close
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg bg-[#0f6b5c] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-[#0b564a]"
              @click="emit('edit', user); handleClose()"
            >
              <Edit3 class="h-3.5 w-3.5" />
              <span>Edit User</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
