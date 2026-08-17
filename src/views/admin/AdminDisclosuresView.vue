<script setup lang="ts">
import { FileText } from 'lucide-vue-next'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
</script>

<template>
  <div>
    <PageHeader
      title="Disclosures"
      description="Manage disclosure questions and PDF templates by state and property type."
    />

    <BaseCard class="mt-6 p-6">
      <EmptyState
        :icon="FileText"
        title="No disclosure questions yet"
        description="Disclosure question sets and their PDF field mappings will be configured here."
      />
    </BaseCard>
  </div>
</template>
