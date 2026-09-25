<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-vue-next'
import BaseInput from '@/components/form/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAuth } from '@/composables/useAuth'
import { useToastStore } from '@/stores/toast'

const ADMIN_PORTAL_ROLES = ['admin', 'agent']

const router = useRouter()
const toast = useToastStore()
const { login, logout, user, status, error, requires2fa, verify2fa, resend2fa } = useAuth()

const form = reactive({ email: '', password: '', code: '' })
const showPassword = ref(false)
const accessError = ref<string | null>(null)

async function handleSubmit() {
  accessError.value = null

  const result = await login({ email: form.email, password: form.password })
  if (result === '2fa') {
    return
  }

  if (result === 'success') {
    if (!user.value?.role || !ADMIN_PORTAL_ROLES.includes(user.value.role)) {
      await logout()
      accessError.value = 'This account does not have access to the admin portal.'
      return
    }

    toast.success('Welcome back!')
    router.push('/admin/dashboard')
  }
}

async function handleVerify2FA() {
  accessError.value = null
  const success = await verify2fa({ email: form.email, code: form.code })
  if (success) {
    if (!user.value?.role || !ADMIN_PORTAL_ROLES.includes(user.value.role)) {
      await logout()
      accessError.value = 'This account does not have access to the admin portal.'
      return
    }
    toast.success('Authentication successful!')
    router.push('/admin/dashboard')
  }
}

async function handleResend2FA() {
  const success = await resend2fa(form.email)
  if (success) {
    toast.success('A new code has been sent.')
  }
}
</script>

<template>
    <div v-if="!requires2fa">
      <h1 class="text-2xl font-bold tracking-tight text-fg">Welcome back</h1>
      <p class="mt-2 text-sm text-fg-muted">
        Sign in to manage listings, workflows, MLS routing, and disclosures.
      </p>

      <form class="mt-8 flex flex-col gap-4" @submit.prevent="handleSubmit">
        <div class="relative">
          <Mail class="pointer-events-none absolute top-8 left-3 h-4 w-4 text-fg-muted" />
          <BaseInput
            v-model="form.email"
            type="email"
            label="Email address"
            placeholder="you@reozom.com"
            required
            autocomplete="email"
            class="h-12 pl-10"
          />
        </div>

        <div class="relative">
          <Lock class="pointer-events-none absolute top-8 left-3 h-4 w-4 text-fg-muted" />
          <BaseInput
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            placeholder="••••••••"
            required
            autocomplete="current-password"
            class="h-12 pl-10 pr-10"
          />
          <button
            type="button"
            class="absolute top-8 right-3 flex h-8 w-8 items-center justify-center text-fg-muted outline-none hover:text-fg"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            @click="showPassword = !showPassword"
          >
            <component :is="showPassword ? EyeOff : Eye" class="h-4 w-4" />
          </button>
        </div>

        <div class="flex justify-end">
          <RouterLink
            to="/auth/forgot-password"
            class="text-sm font-medium text-primary hover:underline"
          >
            Forgot password?
          </RouterLink>
        </div>

        <p v-if="accessError" class="text-sm text-danger">{{ accessError }}</p>
        <p v-else-if="error" class="text-sm text-danger">{{ error }}</p>

        <BaseButton type="submit" size="lg" block :loading="status === 'loading'">
          Sign In
          <ArrowRight class="ml-1.5 h-4 w-4" />
        </BaseButton>
      </form>

      <p class="mt-6 text-center text-sm text-fg-muted">
        Looking for the seller portal?
        <RouterLink to="/auth/login" class="font-medium text-primary hover:underline">
          Go to Seller Login →
        </RouterLink>
      </p>
    </div>

    <div v-else>
      <h1 class="text-2xl font-bold tracking-tight text-fg">Two-Factor Authentication</h1>
      <p class="mt-2 text-sm text-fg-muted">
        Please enter the 6-digit code sent to your email.
      </p>

      <form class="mt-8 flex flex-col gap-4" @submit.prevent="handleVerify2FA">
        <BaseInput
          v-model="form.code"
          type="text"
          label="Authentication Code"
          placeholder="123456"
          required
          autocomplete="one-time-code"
        />

        <p v-if="accessError" class="text-sm text-danger">{{ accessError }}</p>
        <p v-else-if="error" class="text-sm text-danger">{{ error }}</p>

        <BaseButton type="submit" size="lg" block :loading="status === 'loading'">
          Verify Code
        </BaseButton>

        <div class="flex justify-center mt-4">
          <button
            type="button"
            @click="handleResend2FA"
            class="text-sm font-medium text-primary hover:underline outline-none"
            :disabled="status === 'loading'"
          >
            Resend Code
          </button>
        </div>
      </form>
    </div>
</template>
