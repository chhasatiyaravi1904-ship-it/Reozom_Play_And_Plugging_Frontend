<script setup lang="ts">
import { Flag } from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
</script>

<template>
  <div>
    <PageHeader title="State" description="Manage the states the platform currently operates in.">
      <template #actions>
        <BaseButton disabled>Add State</BaseButton>
      </template>
    </PageHeader>

    <BaseCard class="mt-6 p-6">
      <EmptyState
        :icon="Flag"
        title="No states loaded yet"
        description="State records will be listed here once the reference-data API is connected."
      />
    </BaseCard>
  </div>
</template>
