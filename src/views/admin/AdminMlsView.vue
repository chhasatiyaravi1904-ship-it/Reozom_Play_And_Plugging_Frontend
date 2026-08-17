<script setup lang="ts">
import { Network } from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
</script>

<template>
  <div>
    <PageHeader title="MLS" description="Manage MLS systems and the counties each one serves.">
      <template #actions>
        <BaseButton disabled>Add MLS</BaseButton>
      </template>
    </PageHeader>

    <BaseCard class="mt-6 p-6">
      <EmptyState
        :icon="Network"
        title="No MLS systems yet"
        description="MLS records and their county coverage will be managed here."
      />
    </BaseCard>
  </div>
</template>
