<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-vue-next'
import BaseInput from '@/components/form/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useAuth } from '@/composables/useAuth'
import { useToastStore } from '@/stores/toast'

const ADMIN_PORTAL_ROLES = ['admin', 'agent']

const router = useRouter()
const toast = useToastStore()
const { login, logout, user, status, error } = useAuth()

const form = reactive({ email: '', password: '' })
const showPassword = ref(false)
const accessError = ref<string | null>(null)

async function handleSubmit() {
  accessError.value = null

  const success = await login({ email: form.email, password: form.password })
  if (!success) return

  if (!user.value?.role || !ADMIN_PORTAL_ROLES.includes(user.value.role)) {
    await logout()
    accessError.value = 'This account does not have access to the admin portal.'
    return
  }

  toast.success('Welcome back!')
  router.push('/admin/dashboard')
}
</script>

<template>
  <div>
    <div class="mb-6 flex items-center gap-2 text-primary">
      <ShieldCheck class="h-5 w-5" />
      <span class="text-sm font-semibold tracking-wide uppercase">Admin Portal</span>
    </div>

    <PageHeader
      title="Sign in to Reozom Admin"
      description="For platform admins and agents/brokers only."
    />

    <form class="mt-8 flex flex-col gap-4" @submit.prevent="handleSubmit">
      <BaseInput
        v-model="form.email"
        type="email"
        label="Email address"
        placeholder="you@reozom.com"
        required
        autocomplete="email"
      />

      <div class="relative">
        <BaseInput
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          label="Password"
          placeholder="••••••••"
          required
          autocomplete="current-password"
        />
        <button
          type="button"
          class="absolute top-8 right-3 text-fg-muted outline-none hover:text-fg"
          :aria-label="showPassword ? 'Hide password' : 'Show password'"
          @click="showPassword = !showPassword"
        >
          <component :is="showPassword ? EyeOff : Eye" class="h-4 w-4" />
        </button>
      </div>

      <p v-if="accessError" class="text-sm text-danger">{{ accessError }}</p>
      <p v-else-if="error" class="text-sm text-danger">{{ error }}</p>

      <BaseButton type="submit" block :loading="status === 'loading'">
        Sign In
        <ArrowRight class="ml-1.5 h-4 w-4" />
      </BaseButton>
    </form>

    <p class="mt-6 text-center text-sm text-fg-muted">
      Looking for the seller site?
      <RouterLink to="/auth/login" class="font-medium text-primary hover:underline"
        >Go to seller login</RouterLink
      >
    </p>
  </div>
</template>
