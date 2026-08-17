<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight } from 'lucide-vue-next'
import BaseInput from '@/components/form/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import Alert from '@/components/ui/Alert.vue'
import * as authService from '@/services/authService'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
const email = ref('')
const isSubmitting = ref(false)
const isSent = ref(false)

async function handleSubmit() {
  isSubmitting.value = true
  try {
    await authService.forgotPassword(email.value)
    isSent.value = true
  } catch {
    toast.error('We could not reach the server. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div>
    <PageHeader
      title="Forgot your password?"
      description="Enter your email and we'll send you a link to reset it."
    />

    <Alert v-if="isSent" variant="success" class="mt-8">
      If an account exists for {{ email }}, a reset link is on its way.
    </Alert>

    <form v-else class="mt-8 flex flex-col gap-4" @submit.prevent="handleSubmit">
      <BaseInput
        v-model="email"
        type="email"
        label="Email address"
        placeholder="you@example.com"
        required
      />
      <BaseButton type="submit" block :loading="isSubmitting">
        Send Reset Link
        <ArrowRight class="ml-1.5 h-4 w-4" />
      </BaseButton>
    </form>

    <p class="mt-6 text-center text-sm text-fg-muted">
      <RouterLink to="/auth/login" class="font-medium text-primary hover:underline"
        >Back to sign in</RouterLink
      >
    </p>
  </div>
</template>
