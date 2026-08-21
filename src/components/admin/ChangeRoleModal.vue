<script setup lang="ts">
import { ref, watch } from 'vue'
import { Check } from 'lucide-vue-next'
import Modal from '@/components/ui/Modal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import UserRoleBadge from '@/components/admin/UserRoleBadge.vue'
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

const roleOptions: { id: AdminUserRole; description: string }[] = [
  { id: 'admin', description: 'Full administrative access to platform, users, MLS, and system settings.' },
  { id: 'agent', description: 'Access to manage MLS feeds, review client listings, and manage disclosures.' },
  { id: 'seller', description: 'Access to property listing creation, documents, and seller disclosures.' },
  { id: 'buyer', description: 'Access to viewing listings, submitting purchase offers, and saved searches.' },
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
  <Modal v-if="user" :model-value="modelValue" :title="`Change Role — ${user.fullName}`" @update:model-value="emit('update:modelValue', $event)">
    <div class="space-y-2.5">
      <div
        v-for="opt in roleOptions"
        :key="opt.id"
        class="cursor-pointer rounded-xl border p-3.5 transition-colors"
        :class="
          selectedRole === opt.id
            ? 'border-primary bg-primary-soft ring-2 ring-primary/20'
            : 'border-border hover:border-fg-disabled hover:bg-surface-raised'
        "
        @click="selectedRole = opt.id"
      >
        <div class="flex items-start justify-between">
          <div>
            <UserRoleBadge :role="opt.id" />
            <p class="mt-1.5 text-xs text-fg-muted leading-relaxed">{{ opt.description }}</p>
          </div>
          <div
            class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors"
            :class="selectedRole === opt.id ? 'border-primary bg-primary text-white' : 'border-border bg-surface'"
          >
            <Check v-if="selectedRole === opt.id" class="h-3 w-3 stroke-[3]" />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <BaseButton variant="secondary" @click="handleClose">Cancel</BaseButton>
      <BaseButton variant="primary" @click="handleSave">Save Role</BaseButton>
    </template>
  </Modal>
</template>
