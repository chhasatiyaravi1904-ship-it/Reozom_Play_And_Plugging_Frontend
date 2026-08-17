<script setup lang="ts">
import BaseCard from '@/components/ui/BaseCard.vue'
import PageHeader from '@/components/ui/PageHeader.vue'

const faqs = [
  {
    question: 'How do I save my progress?',
    answer:
      'Your listing saves automatically as you complete each step. You can leave anytime and resume later from your dashboard.',
  },
  {
    question: 'What documents will I need?',
    answer:
      'Required documents vary by state and property type, but commonly include proof of ownership, a photo ID, and your most recent property tax bill.',
  },
  {
    question: 'Is my information secure?',
    answer:
      'Yes. All listing information and documents are encrypted and only accessible to your assigned agent and REOZOM staff.',
  },
]
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <PageHeader
      title="Help Center"
      description="Answers to common questions about listing your property."
    />

    <BaseCard class="mt-6" :padding="false">
      <ul class="divide-y divide-border">
        <li v-for="faq in faqs" :key="faq.question" class="flex flex-col gap-1 p-4">
          <h3 class="text-sm font-semibold text-fg">{{ faq.question }}</h3>
          <p class="text-sm text-fg-muted">{{ faq.answer }}</p>
        </li>
      </ul>
    </BaseCard>

    <BaseCard class="mt-6" title="Still need help?">
      <p class="text-sm text-fg-muted">
        Contact your agent directly, or reach our support team at
        <a href="mailto:support@reozom.com" class="text-primary hover:underline"
          >support@reozom.com</a
        >.
      </p>
    </BaseCard>
  </div>
</template>
