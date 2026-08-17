<script setup lang="ts">
import { AlertTriangle, X } from 'lucide-vue-next'
import type { AdminUserItem } from '@/services/adminUsersData'

defineProps<{
  modelValue: boolean
  user: AdminUserItem | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'confirmDelete', user: AdminUserItem): void
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
        <div class="flex items-start justify-between">
          <div
            class="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-600/20"
          >
            <AlertTriangle class="h-6 w-6" />
          </div>
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            @click="handleClose"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <div class="mt-4">
          <h3 class="text-base font-semibold text-slate-900">Delete User Account</h3>
          <p class="mt-2 text-xs text-slate-500 leading-relaxed">
            Are you sure you want to delete the user account for
            <span class="font-semibold text-slate-800">{{ user.fullName }}</span>
            (<span class="text-slate-600 font-mono text-[11px]">@{{ user.username }}</span>)?
            This action cannot be undone. All active sessions, permission bindings, and notifications will be revoked.
          </p>
        </div>

        <div class="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50"
            @click="handleClose"
          >
            Cancel
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-red-700 focus:ring-2 focus:ring-red-500/30"
            @click="emit('confirmDelete', user); handleClose()"
          >
            Delete User
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
