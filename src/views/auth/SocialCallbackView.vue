<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useToastStore } from '@/stores/toast'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()
const { loginWithToken } = useAuth()

const failed = ref(false)

onMounted(async () => {
  const token = route.query.token
  if (typeof token !== 'string' || !token) {
    failed.value = true
    return
  }

  const success = await loginWithToken(token)
  if (success) {
    toast.success('Welcome back!')
    router.replace('/dashboard')
  } else {
    failed.value = true
  }
})
</script>

<template>
  <div class="text-center">
    <template v-if="!failed">
      <span
        class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
        role="status"
        aria-label="Finishing sign-in"
      ></span>
      <p class="mt-4 text-sm text-fg-muted">Finishing sign-in&hellip;</p>
    </template>
    <template v-else>
      <p class="text-sm text-danger">We couldn't complete sign-in. Please try again.</p>
      <RouterLink to="/auth/login" class="mt-4 inline-block text-sm font-medium text-primary hover:underline">
        Back to login
      </RouterLink>
    </template>
  </div>
</template>
