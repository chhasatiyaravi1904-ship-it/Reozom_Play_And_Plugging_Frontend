<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { BadgeCheck, CircleAlert } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'

const route = useRoute()
const verified = computed(() => route.query.status === 'verified')
</script>

<template>
  <div class="text-center">
    <template v-if="verified">
      <BadgeCheck class="mx-auto h-10 w-10 text-success" />
      <h1 class="mt-4 text-xl font-semibold text-fg">Email verified</h1>
      <p class="mt-1 text-sm text-fg-muted">Your email has been confirmed. You can sign in now.</p>
    </template>
    <template v-else>
      <CircleAlert class="mx-auto h-10 w-10 text-danger" />
      <h1 class="mt-4 text-xl font-semibold text-fg">Link no longer valid</h1>
      <p class="mt-1 text-sm text-fg-muted">
        This verification link is invalid or has expired. Try signing in — you'll be able to
        request a new one from there.
      </p>
    </template>

    <RouterLink to="/auth/login" class="mt-6 inline-block">
      <BaseButton>Go to login</BaseButton>
    </RouterLink>
  </div>
</template>
