<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Shield, Check } from 'lucide-vue-next'
import type { AdminUserItem, AdminUserRole } from '@/services/adminUsersData'

const props = defineProps<{
  modelValue: boolean
  user: AdminUserItem | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'roleChanged', user: AdminUserItem, newRole: AdminUserRole): void
}>()

const selectedRole = ref<AdminUserRole>('agent')

const roleOptions: Array<{
  id: AdminUserRole
  title: string
  description: string
  color: string
}> = [
  {
    id: 'admin',
    title: 'Admin',
    description: 'Full administrative access to platform, users, MLS, and system settings.',
    color: 'border-purple-200 bg-purple-50/50 text-purple-700',
  },
  {
    id: 'agent',
    title: 'Agent',
    description: 'Access to manage MLS feeds, review client listings, and manage disclosures.',
    color: 'border-blue-200 bg-blue-50/50 text-blue-700',
  },
  {
    id: 'seller',
    title: 'Seller',
    description: 'Access to property listing creation, documents, and seller disclosures.',
    color: 'border-amber-200 bg-amber-50/50 text-amber-800',
  },
  {
    id: 'buyer',
    title: 'Buyer',
    description: 'Access to viewing listings, submitting purchase offers, and saved searches.',
    color: 'border-teal-200 bg-teal-50/50 text-teal-800',
  },
]

watch(
  () => props.user,
  (val) => {
    if (val) {
      selectedRole.value = val.role
    }
  },
  { immediate: true },
)

function handleClose() {
  emit('update:modelValue', false)
}

function handleSave() {
  if (props.user) {
    emit('roleChanged', props.user, selectedRole.value)
  }
  handleClose()
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
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700 ring-1 ring-purple-600/20"
            >
              <Shield class="h-5 w-5" />
            </div>
            <div>
              <h3 class="text-base font-semibold text-slate-900 leading-tight">Change Role</h3>
              <p class="text-xs text-slate-500">Update role for {{ user.fullName }}</p>
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

        <div class="mt-4 space-y-2.5">
          <div
            v-for="opt in roleOptions"
            :key="opt.id"
            class="cursor-pointer rounded-xl border p-3.5 transition-all"
            :class="[
              selectedRole === opt.id
                ? 'border-[#0f6b5c] bg-teal-50/50 ring-2 ring-[#0f6b5c]/20'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50',
            ]"
            @click="selectedRole = opt.id"
          >
            <div class="flex items-start justify-between">
              <div>
                <span
                  class="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold"
                  :class="opt.color"
                >
                  {{ opt.title }}
                </span>
                <p class="mt-1.5 text-xs text-slate-600 leading-relaxed">{{ opt.description }}</p>
              </div>
              <div
                class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all mt-0.5"
                :class="
                  selectedRole === opt.id
                    ? 'border-[#0f6b5c] bg-[#0f6b5c] text-white'
                    : 'border-slate-300 bg-white'
                "
              >
                <Check v-if="selectedRole === opt.id" class="h-3 w-3 stroke-[3]" />
              </div>
            </div>
          </div>
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
            class="inline-flex items-center gap-2 rounded-lg bg-[#0f6b5c] px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-[#0b564a]"
            @click="handleSave"
          >
            Save Role
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
