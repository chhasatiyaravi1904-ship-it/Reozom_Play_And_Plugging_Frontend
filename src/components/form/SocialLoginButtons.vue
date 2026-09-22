<script setup lang="ts">
import { Facebook, Linkedin, Twitter } from 'lucide-vue-next'

const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(
  /\/$/,
  '',
)

const providers = [
  { key: 'facebook', label: 'Facebook', icon: Facebook },
  { key: 'linkedin-openid', label: 'LinkedIn', icon: Linkedin },
  { key: 'twitter', label: 'Twitter', icon: Twitter },
]
</script>

<template>
  <div>
    <div class="relative my-6 flex items-center gap-3">
      <div class="h-px flex-1 bg-outline-variant/50"></div>
      <span class="text-xs text-on-surface-variant uppercase font-medium">or continue with</span>
      <div class="h-px flex-1 bg-outline-variant/50"></div>
    </div>

    <div class="grid grid-cols-3 gap-3">
      <a
        v-for="provider in providers"
        :key="provider.key"
        :href="`${apiBase}/auth/${provider.key}/redirect`"
        class="flex items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest py-2.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        :aria-label="`Continue with ${provider.label}`"
      >
        <component :is="provider.icon" class="h-5 w-5" />
      </a>
    </div>
  </div>
</template>
