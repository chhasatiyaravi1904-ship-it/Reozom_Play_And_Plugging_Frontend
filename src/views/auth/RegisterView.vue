<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ArrowRight } from 'lucide-vue-next'
import BaseInput from '@/components/form/BaseInput.vue'
import BaseCheckbox from '@/components/form/BaseCheckbox.vue'
import SocialLoginButtons from '@/components/form/SocialLoginButtons.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useAuth } from '@/composables/useAuth'
import { useToastStore } from '@/stores/toast'

const router = useRouter()
const toast = useToastStore()
const { register, status, error } = useAuth()

const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  password: '',
  passwordConfirmation: '',
})
const acceptedTerms = ref(false)

const passwordsMatch = computed(
  () => !form.passwordConfirmation || form.password === form.passwordConfirmation,
)

async function handleSubmit() {
  if (!acceptedTerms.value || !passwordsMatch.value) return
  const success = await register(form)
  if (success) {
    toast.success('Account created! Welcome to REOZOM.')
    router.push('/dashboard')
  }
}
</script>

<template>
  <div>
    <PageHeader title="Create your account" description="List your property in a few guided steps" />

    <form class="mt-8 flex flex-col gap-4" @submit.prevent="handleSubmit">
      <BaseInput v-model="form.fullName" label="Full name" placeholder="Jane Seller" required />
      <BaseInput
        v-model="form.email"
        type="email"
        label="Email address"
        placeholder="you@example.com"
        required
      />
      <BaseInput
        v-model="form.phone"
        type="tel"
        label="Phone number"
        placeholder="(555) 123-4567"
        required
      />
      <BaseInput v-model="form.password" type="password" label="Password" required />
      <BaseInput
        v-model="form.passwordConfirmation"
        type="password"
        label="Confirm password"
        required
        :error="!passwordsMatch ? 'Passwords do not match' : undefined"
      />

      <BaseCheckbox v-model="acceptedTerms">
        I agree to the
        <a href="#" class="text-primary hover:underline">Terms of Service</a>
        and
        <a href="#" class="text-primary hover:underline">Privacy Policy</a>
      </BaseCheckbox>

      <p v-if="error" class="text-sm text-danger">{{ error }}</p>

      <BaseButton type="submit" block :disabled="!acceptedTerms" :loading="status === 'loading'">
        Create Account
        <ArrowRight class="ml-1.5 h-4 w-4" />
      </BaseButton>
    </form>

    <SocialLoginButtons />

    <p class="mt-6 text-center text-sm text-fg-muted">
      Already have an account?
      <RouterLink to="/auth/login" class="font-medium text-primary hover:underline"
        >Sign in</RouterLink
      >
    </p>
  </div>
</template>
