<script setup lang="ts">
import { Workflow } from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
</script>

<template>
  <div>
    <PageHeader
      title="Listing Process Management"
      description="Build and assign the step-by-step listing workflows agents use."
    >
      <template #actions>
        <BaseButton disabled>New Listing Process</BaseButton>
      </template>
    </PageHeader>

    <BaseCard class="mt-6 p-6">
      <EmptyState
        :icon="Workflow"
        title="No listing processes yet"
        description="The listing process builder (steps, sections, fields, and county/MLS assignment) will live here."
      />
    </BaseCard>
  </div>
</template>
