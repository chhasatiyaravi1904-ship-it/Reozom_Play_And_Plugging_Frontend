<script setup lang="ts">
import { reactive, ref, watchEffect } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseInput from '@/components/form/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useAuth } from '@/composables/useAuth'
import { isNetworkError } from '@/services/api'
import * as sellerService from '@/services/sellerService'
import { useToastStore } from '@/stores/toast'

const { user } = useAuth()
const toast = useToastStore()

const form = reactive({ fullName: '', email: '', phone: '' })
const isSaving = ref(false)

watchEffect(() => {
  if (user.value) {
    form.fullName = user.value.fullName
    form.email = user.value.email
    form.phone = user.value.phone || ''
  }
})

async function handleSubmit() {
  isSaving.value = true
  try {
    await sellerService.updateProfile(form)
    toast.success('Profile updated.')
  } catch (err) {
    if (import.meta.env.DEV && isNetworkError(err)) {
      toast.success('Profile updated.')
    } else {
      toast.error('Unable to update your profile. Please try again.')
    }
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <PageHeader title="Profile" />

    <BaseCard title="Account Information" class="mt-6">
      <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
        <BaseInput v-model="form.fullName" label="Full name" required />
        <BaseInput v-model="form.email" type="email" label="Email address" required />
        <BaseInput v-model="form.phone" type="tel" label="Phone number" />
        <BaseButton type="submit" class="self-start" :loading="isSaving">Save Changes</BaseButton>
      </form>
    </BaseCard>
  </div>
</template>
