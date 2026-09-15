<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { MailCheck } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useAuthStore } from '@/stores/auth'
import { resendVerificationEmail } from '@/services/authService'
import { useToastStore } from '@/stores/toast'

const route = useRoute()
const authStore = useAuthStore()
const toast = useToastStore()

const resending = ref(false)

// Reached either with a session (registered as seller/buyer and logged in
// unverified) or without one (login was rejected for being unverified,
// so the email only comes through as a query param).
const email = computed(() => authStore.user?.email || (route.query.email as string) || '')

async function handleResend() {
  if (!email.value) return
  resending.value = true
  try {
    await resendVerificationEmail(email.value)
    toast.success('If that account exists, a new verification email is on its way.')
  } finally {
    resending.value = false
  }
}
</script>

<template>
  <div class="text-center">
    <PageHeader title="Verify your email" description="One more step before you can continue" />

    <div class="mt-8 flex flex-col items-center gap-3 rounded-xl border border-border bg-surface-raised p-6">
      <MailCheck class="h-10 w-10 text-primary" />
      <p class="text-sm text-fg">
        We sent a verification link to
        <span class="font-medium">{{ email || 'your email address' }}</span>. Click it to confirm
        your account, then continue here.
      </p>
      <BaseButton class="mt-2" :loading="resending" :disabled="!email" @click="handleResend">
        Resend verification email
      </BaseButton>
    </div>

    <p class="mt-6 text-center text-sm text-fg-muted">
      Wrong account?
      <RouterLink to="/auth/login" class="font-medium text-primary hover:underline">Sign in</RouterLink>
    </p>
  </div>
</template>
