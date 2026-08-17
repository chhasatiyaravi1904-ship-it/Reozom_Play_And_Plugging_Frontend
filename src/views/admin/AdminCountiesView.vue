<script setup lang="ts">
import { MapPin } from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
</script>

<template>
  <div>
    <PageHeader title="County" description="Manage counties and which state each belongs to.">
      <template #actions>
        <BaseButton disabled>Add County</BaseButton>
      </template>
    </PageHeader>

    <BaseCard class="mt-6 p-6">
      <EmptyState
        :icon="MapPin"
        title="No counties loaded yet"
        description="County records will be listed here once the reference-data API is connected."
      />
    </BaseCard>
  </div>
</template>
