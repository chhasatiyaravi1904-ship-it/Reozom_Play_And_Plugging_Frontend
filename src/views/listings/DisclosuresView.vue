<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowRight } from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseRadioGroup from '@/components/form/BaseRadioGroup.vue'
import BaseTextarea from '@/components/form/BaseTextarea.vue'
import Stepper from '@/components/listing/Stepper.vue'
import { useListingSteps } from '@/composables/useListingSteps'
import { sampleDisclosures } from '@/services/sampleData'
import { useToastStore } from '@/stores/toast'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()
const listingId = computed(() => Number(route.params.listingId))

const { steps, routeFor } = useListingSteps(listingId.value)

const answers = reactive<Record<string, string>>({})
const followUps = reactive<Record<string, string>>({})

function isVisible(question: (typeof sampleDisclosures)[number]): boolean {
  if (!question.showIf) return true
  return answers[question.showIf.field] === question.showIf.equals
}

function handleBack() {
  // Go back to the last dynamic workflow step (disclosures is not itself a workflow step)
  const lastStep = steps.value[steps.value.length - 1]
  if (lastStep) {
    router.push(routeFor(lastStep.id))
  } else {
    const isAgent = router.currentRoute.value.path.startsWith('/agent')
    router.push(isAgent ? '/agent/listings' : '/listings')
  }
}

function handleContinue() {
  toast.success('Disclosures saved.')
  router.push(routeFor('documents'))
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-4xl flex-col gap-6">
    <Stepper :steps="steps" @select="(id) => router.push(routeFor(id))" />

    <PageHeader
      title="Disclosures"
      description="Answer honestly — these responses become part of your official listing disclosure."
    />

    <BaseCard>
      <div class="flex flex-col gap-6">
        <template v-for="question in sampleDisclosures" :key="question.id">
          <div class="flex flex-col gap-3">
            <BaseRadioGroup
              :model-value="answers[question.id] ?? ''"
              :label="question.question"
              :options="question.options"
              inline
              required
              @update:model-value="(value) => (answers[question.id] = value)"
            />
            <BaseTextarea
              v-if="question.followUp && isVisible(question)"
              :model-value="followUps[question.id] ?? ''"
              :label="question.followUp.label"
              placeholder="Please provide additional details."
              @update:model-value="(value) => (followUps[question.id] = value)"
            />
          </div>
        </template>
      </div>

      <template #footer>
        <div class="flex items-center justify-between">
          <BaseButton variant="secondary" @click="handleBack">Back</BaseButton>
          <BaseButton @click="handleContinue">
            Save & Continue
            <ArrowRight class="ml-1.5 h-4 w-4" />
          </BaseButton>
        </div>
      </template>
    </BaseCard>
  </div>
</template>
