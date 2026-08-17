<script setup lang="ts">
import { Building2 } from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
</script>

<template>
  <div>
    <PageHeader title="Listings" description="Review listings submitted across every agent." />

    <BaseCard class="mt-6 p-6">
      <EmptyState
        :icon="Building2"
        title="No listings loaded yet"
        description="This page will show submitted seller listings once the admin listings API is connected."
      />
    </BaseCard>
  </div>
</template>
