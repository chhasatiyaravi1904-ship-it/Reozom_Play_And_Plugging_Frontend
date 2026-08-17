<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-border bg-surface">
    <div
      class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-fg-muted sm:flex-row md:px-6"
    >
      <p>© {{ year }} REOZOM. All rights reserved.</p>
      <div class="flex items-center gap-4">
        <RouterLink to="/help" class="hover:text-fg">Help Center</RouterLink>
        <span>Your information is kept secure and confidential.</span>
      </div>
    </div>
  </footer>
</template>
