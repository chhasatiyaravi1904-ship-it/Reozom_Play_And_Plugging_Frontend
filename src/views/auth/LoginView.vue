<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ArrowRight, Eye, EyeOff } from 'lucide-vue-next'
import BaseInput from '@/components/form/BaseInput.vue'
import SocialLoginButtons from '@/components/form/SocialLoginButtons.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useAuth } from '@/composables/useAuth'
import { useToastStore } from '@/stores/toast'

const router = useRouter()
const toast = useToastStore()
const { login, status, error } = useAuth()

const form = reactive({ email: '', password: '' })
const showPassword = ref(false)

async function handleSubmit() {
  const success = await login({ email: form.email, password: form.password })
  if (success) {
    toast.success('Welcome back!')
    router.push('/dashboard')
  } else if (error.value?.toLowerCase().includes('verify your email')) {
    router.push({ name: 'verify-email', query: { email: form.email } })
  }
}
</script>

<template>
  <div>
    <PageHeader title="Welcome back" description="Sign in to continue to your account" />

    <form class="mt-8 flex flex-col gap-4" @submit.prevent="handleSubmit">
      <BaseInput
        v-model="form.email"
        type="email"
        label="Email address"
        placeholder="you@example.com"
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
          class="absolute top-8 right-3 text-on-surface-variant outline-none hover:text-on-surface"
          :aria-label="showPassword ? 'Hide password' : 'Show password'"
          @click="showPassword = !showPassword"
        >
          <span class="material-symbols-outlined text-xl">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
        </button>
      </div>

      <div class="flex justify-end">
        <RouterLink
          to="/auth/forgot-password"
          class="font-label-md text-secondary hover:underline"
        >
          Forgot password?
        </RouterLink>
      </div>

      <p v-if="error" class="text-sm text-error">{{ error }}</p>

      <BaseButton type="submit" block :loading="status === 'loading'">
        Sign In
        <span class="material-symbols-outlined text-base ml-1.5" data-icon="arrow_forward">arrow_forward</span>
      </BaseButton>
    </form>

    <SocialLoginButtons />

    <p class="mt-6 text-center text-body-sm font-body-sm text-on-surface-variant">
      Don't have an account?
      <RouterLink to="/auth/register" class="font-label-md text-secondary hover:underline"
        >Sign up</RouterLink
      >
    </p>
  </div>
</template>
