<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { UserPlus, UserCheck } from 'lucide-vue-next'
import type { AdminUserItem, AdminUserRole, AdminUserStatus } from '@/services/adminUsersData'
import Modal from '@/components/ui/Modal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

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
  email: '',
  phone: '',
  password: '',
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
          email: props.userToEdit.email,
          phone: props.userToEdit.phone,
          password: '',
          role: props.userToEdit.role,
          status: props.userToEdit.status,
          location: props.userToEdit.location || '',
        }
      } else {
        form.value = {
          fullName: '',
          email: '',
          phone: '',
          password: '',
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
}

function validate(): boolean {
  errors.value = {}
  if (!form.value.fullName.trim()) {
    errors.value.fullName = 'Full name is required'
  }
  if (!form.value.email.trim()) {
    errors.value.email = 'Email address is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Enter a valid email address'
  }
  if (!form.value.phone.trim()) {
    errors.value.phone = 'Phone number is required'
  }
  if (!isEditMode.value && !form.value.password.trim()) {
    errors.value.password = 'Password is required for new accounts'
  } else if (form.value.password && form.value.password.length < 8) {
    errors.value.password = 'Password must be at least 8 characters'
  }
  return Object.keys(errors.value).length === 0
}

function handleClose() {
  emit('update:modelValue', false)
}

function handleSubmit() {
  if (!validate()) return

  const payload: Partial<AdminUserItem> & { password?: string } = { ...form.value }
  if (!payload.password) {
    delete payload.password
  }

  emit('save', payload)
  handleClose()
}
</script>

<template>
  <Modal :model-value="modelValue" size="lg" @update:model-value="emit('update:modelValue', $event)">
    <!-- Custom rich header -->
    <div class="flex items-center gap-3 border-b border-border pb-4 -mt-2">
      <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary ring-1 ring-primary/20">
        <component :is="isEditMode ? UserCheck : UserPlus" class="h-5 w-5" />
      </div>
      <div>
        <h2 class="text-lg font-semibold text-fg">{{ isEditMode ? 'Edit User' : 'Add New User' }}</h2>
        <p class="text-xs text-fg-muted">
          {{ isEditMode ? 'Update user account details and permissions.' : 'Create and provision a new user in Reozom.' }}
        </p>
      </div>
    </div>

    <!-- Form -->
    <form class="mt-5 space-y-4" @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <!-- Full Name -->
        <div class="sm:col-span-2">
          <label class="block text-xs font-semibold text-fg mb-1.5">
            Full Name <span class="text-danger">*</span>
          </label>
          <input
            :value="form.fullName"
            type="text"
            placeholder="e.g. Raviraj Chhasatiya"
            class="focus-ring w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-fg shadow-xs placeholder:text-fg-disabled transition-colors"
            :class="{ 'border-danger': errors.fullName }"
            @input="onFullNameInput(($event.target as HTMLInputElement).value)"
          />
          <p v-if="errors.fullName" class="mt-1 text-xs text-danger">{{ errors.fullName }}</p>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-xs font-semibold text-fg mb-1.5">
            Email Address <span class="text-danger">*</span>
          </label>
          <input
            v-model="form.email"
            type="email"
            placeholder="user@example.com"
            class="focus-ring w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-fg shadow-xs placeholder:text-fg-disabled transition-colors"
            :class="{ 'border-danger': errors.email }"
          />
          <p v-if="errors.email" class="mt-1 text-xs text-danger">{{ errors.email }}</p>
        </div>

        <!-- Phone -->
        <div>
          <label class="block text-xs font-semibold text-fg mb-1.5">
            Phone Number <span class="text-danger">*</span>
          </label>
          <input
            v-model="form.phone"
            type="text"
            placeholder="(555) 000-0000"
            class="focus-ring w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-fg shadow-xs placeholder:text-fg-disabled transition-colors"
            :class="{ 'border-danger': errors.phone }"
          />
          <p v-if="errors.phone" class="mt-1 text-xs text-danger">{{ errors.phone }}</p>
        </div>

        <!-- Password -->
        <div class="sm:col-span-2">
          <label class="block text-xs font-semibold text-fg mb-1.5">
            Password <span v-if="!isEditMode" class="text-danger">*</span>
            <span v-else class="font-normal text-fg-muted">(leave blank to keep current password)</span>
          </label>
          <input
            v-model="form.password"
            type="password"
            :placeholder="isEditMode ? '••••••••' : 'At least 8 characters'"
            autocomplete="new-password"
            class="focus-ring w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-fg shadow-xs placeholder:text-fg-disabled transition-colors"
            :class="{ 'border-danger': errors.password }"
          />
          <p v-if="errors.password" class="mt-1 text-xs text-danger">{{ errors.password }}</p>
        </div>

        <!-- Role -->
        <div>
          <label class="block text-xs font-semibold text-fg mb-1.5">Role</label>
          <select
            v-model="form.role"
            class="focus-ring w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg shadow-xs transition-colors"
          >
            <option value="admin">Admin (Full Access)</option>
            <option value="agent">Agent (MLS & Workflow)</option>
            <option value="seller">Seller (Listing Management)</option>
            <option value="buyer">Buyer (Purchase Portal)</option>
          </select>
        </div>

        <!-- Status -->
        <div>
          <label class="block text-xs font-semibold text-fg mb-1.5">Account Status</label>
          <select
            v-model="form.status"
            class="focus-ring w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg shadow-xs transition-colors"
          >
            <option value="active">🟢 Active</option>
            <option value="inactive">🔴 Inactive</option>
          </select>
        </div>

        <!-- Location -->
        <div class="sm:col-span-2">
          <label class="block text-xs font-semibold text-fg mb-1.5">Location (Optional)</label>
          <input
            v-model="form.location"
            type="text"
            placeholder="e.g. Austin, TX"
            class="focus-ring w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-fg shadow-xs placeholder:text-fg-disabled transition-colors"
          />
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
        <BaseButton variant="secondary" type="button" @click="handleClose">Cancel</BaseButton>
        <BaseButton variant="primary" type="submit">{{ isEditMode ? 'Save Changes' : 'Create User' }}</BaseButton>
      </div>
    </form>
  </Modal>
</template>
