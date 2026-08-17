<script setup lang="ts">
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import { useAuth } from '@/composables/useAuth'

const { user } = useAuth()
</script>

<template>
  <div>
    <PageHeader
      title="Admin Dashboard"
      :description="`Signed in as ${user?.fullName} (${user?.role})`"
    />

    <BaseCard class="mt-6">
      <p class="text-sm text-fg-muted">
        This is a placeholder landing page. Listing-process configuration, county/MLS routing,
        and disclosure management (Phase 1&ndash;3 of the Plug-and-Play build) will live here.
      </p>
    </BaseCard>
  </div>
</template>
