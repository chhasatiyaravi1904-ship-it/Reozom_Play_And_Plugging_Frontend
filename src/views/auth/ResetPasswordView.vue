<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight } from 'lucide-vue-next'
import BaseInput from '@/components/form/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import * as authService from '@/services/authService'
import { useToastStore } from '@/stores/toast'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()

const form = reactive({ email: '', password: '', passwordConfirmation: '' })
const isSubmitting = ref(false)

const passwordsMatch = computed(
  () => !form.passwordConfirmation || form.password === form.passwordConfirmation,
)

async function handleSubmit() {
  if (!passwordsMatch.value) return
  isSubmitting.value = true
  try {
    await authService.resetPassword({
      token: String(route.query.token || ''),
      email: form.email,
      password: form.password,
    })
    toast.success('Password updated. Please sign in.')
    router.push('/auth/login')
  } catch {
    toast.error('This reset link is invalid or has expired.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div>
    <PageHeader title="Set a new password" description="Choose a strong password for your account." />

    <form class="mt-8 flex flex-col gap-4" @submit.prevent="handleSubmit">
      <BaseInput v-model="form.email" type="email" label="Email address" required />
      <BaseInput v-model="form.password" type="password" label="New password" required />
      <BaseInput
        v-model="form.passwordConfirmation"
        type="password"
        label="Confirm new password"
        required
        :error="!passwordsMatch ? 'Passwords do not match' : undefined"
      />
      <BaseButton type="submit" block :loading="isSubmitting">
        Reset Password
        <ArrowRight class="ml-1.5 h-4 w-4" />
      </BaseButton>
    </form>
  </div>
</template>
