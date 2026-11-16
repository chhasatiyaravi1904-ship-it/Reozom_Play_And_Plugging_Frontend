<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

/** Shown on seller and agent pages while an admin is logged in as that user. */
const authStore = useAuthStore()
const toast = useToastStore()
const router = useRouter()
const isLeaving = ref(false)

const userName = computed(() => authStore.user?.fullName || authStore.user?.email || 'this user')
const adminName = computed(() => authStore.user?.impersonatedBy?.name)

async function returnToAdmin() {
  isLeaving.value = true
  try {
    const backTo = await authStore.stopImpersonation()
    toast.success('Returned to your admin account.')
    router.push(backTo)
  } finally {
    isLeaving.value = false
  }
}
</script>

<template>
  <div
    v-if="authStore.isImpersonating"
    class="sticky top-0 z-50 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-amber-500 px-4 py-2 text-sm text-amber-950 shadow"
    role="status"
  >
    <span>
      You are viewing the site as <strong>{{ userName }}</strong>
      <template v-if="adminName"> (admin session by {{ adminName }})</template>.
    </span>
    <button
      type="button"
      class="rounded-md bg-amber-950 px-3 py-1 text-xs font-semibold text-white hover:bg-black disabled:opacity-60"
      :disabled="isLeaving"
      @click="returnToAdmin"
    >
      {{ isLeaving ? 'Returning...' : 'Return to admin' }}
    </button>
  </div>
</template>
