<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { X, UserPlus, UserCheck } from 'lucide-vue-next'
import type { AdminUserItem, AdminUserRole, AdminUserStatus } from '@/services/adminUsersData'

const props = defineProps<{
  modelValue: boolean
  userToEdit?: AdminUserItem | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'save', userData: Partial<AdminUserItem>): void
}>()

const isEditMode = computed(() => !!props.userToEdit)

const form = ref({
  fullName: '',
  username: '',
  email: '',
  phone: '',
  role: 'agent' as AdminUserRole,
  status: 'active' as AdminUserStatus,
  location: '',
})

const errors = ref<Record<string, string>>({})

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      errors.value = {}
      if (props.userToEdit) {
        form.value = {
          fullName: props.userToEdit.fullName,
          username: props.userToEdit.username,
          email: props.userToEdit.email,
          phone: props.userToEdit.phone,
          role: props.userToEdit.role,
          status: props.userToEdit.status,
          location: props.userToEdit.location || '',
        }
      } else {
        form.value = {
          fullName: '',
          username: '',
          email: '',
          phone: '',
          role: 'agent',
          status: 'active',
          location: '',
        }
      }
    }
  },
  { immediate: true },
)

function onFullNameInput(val: string) {
  form.value.fullName = val
  if (!isEditMode.value && !form.value.username) {
    form.value.username = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '.')
      .replace(/\.+/g, '.')
  }
}

function validate(): boolean {
  errors.value = {}
  if (!form.value.fullName.trim()) {
    errors.value.fullName = 'Full name is required'
  }
  if (!form.value.username.trim()) {
    errors.value.username = 'Username is required'
  }
  if (!form.value.email.trim()) {
    errors.value.email = 'Email address is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Enter a valid email address'
  }
  if (!form.value.phone.trim()) {
    errors.value.phone = 'Phone number is required'
  }
  return Object.keys(errors.value).length === 0
}

function handleClose() {
  emit('update:modelValue', false)
}

function handleSubmit() {
  if (!validate()) return

  emit('save', {
    ...form.value,
    username: form.value.username.startsWith('@') ? form.value.username.slice(1) : form.value.username,
  })
  handleClose()
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        @click="handleClose"
      ></div>

      <!-- Modal Card -->
      <div
        class="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all"
      >
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-[#0f6b5c] ring-1 ring-teal-600/20"
            >
              <component :is="isEditMode ? UserCheck : UserPlus" class="h-5 w-5" />
            </div>
            <div>
              <h2 class="text-lg font-semibold text-slate-900">
                {{ isEditMode ? 'Edit User' : 'Add New User' }}
              </h2>
              <p class="text-xs text-slate-500">
                {{ isEditMode ? 'Update user account details and permissions.' : 'Create and provision a new user in Reozom.' }}
              </p>
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

        <!-- Form -->
        <form class="mt-5 space-y-4" @submit.prevent="handleSubmit">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <!-- Full Name -->
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name <span class="text-red-500">*</span>
              </label>
              <input
                :value="form.fullName"
                type="text"
                placeholder="e.g. Raviraj Chhasatiya"
                class="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20"
                :class="{ 'border-red-400 focus:ring-red-400/20': errors.fullName }"
                @input="onFullNameInput(($event.target as HTMLInputElement).value)"
              />
              <p v-if="errors.fullName" class="mt-1 text-xs text-red-600">{{ errors.fullName }}</p>
            </div>

            <!-- Username -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                Username <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-xs text-slate-400">@</span>
                <input
                  v-model="form.username"
                  type="text"
                  placeholder="username"
                  class="w-full rounded-lg border border-slate-200 bg-white pl-7 pr-3 py-2 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20"
                  :class="{ 'border-red-400 focus:ring-red-400/20': errors.username }"
                />
              </div>
              <p v-if="errors.username" class="mt-1 text-xs text-red-600">{{ errors.username }}</p>
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.phone"
                type="text"
                placeholder="(555) 000-0000"
                class="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20"
                :class="{ 'border-red-400 focus:ring-red-400/20': errors.phone }"
              />
              <p v-if="errors.phone" class="mt-1 text-xs text-red-600">{{ errors.phone }}</p>
            </div>

            <!-- Email -->
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.email"
                type="email"
                placeholder="user@example.com"
                class="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20"
                :class="{ 'border-red-400 focus:ring-red-400/20': errors.email }"
              />
              <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ errors.email }}</p>
            </div>

            <!-- Role -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Role</label>
              <select
                v-model="form.role"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-2xs focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20"
              >
                <option value="admin">Admin (Full Access)</option>
                <option value="agent">Agent (MLS & Workflow)</option>
                <option value="seller">Seller (Listing Management)</option>
                <option value="buyer">Buyer (Purchase Portal)</option>
              </select>
            </div>

            <!-- Status -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Account Status</label>
              <select
                v-model="form.status"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-2xs focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20"
              >
                <option value="active">🟢 Active</option>
                <option value="inactive">🔴 Inactive</option>
              </select>
            </div>

            <!-- Location -->
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Location (Optional)</label>
              <input
                v-model="form.location"
                type="text"
                placeholder="e.g. Austin, TX"
                class="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20"
              />
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
              @click="handleClose"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="inline-flex items-center gap-2 rounded-lg bg-[#0f6b5c] px-4 py-2 text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-[#0b564a] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/40"
            >
              {{ isEditMode ? 'Save Changes' : 'Create User' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
