import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useWorkflowStore } from '@/stores/workflow'
import { useListingStore } from '@/stores/listing'
import type { StepperItem } from '@/components/listing/Stepper.vue'

export function useListingSteps(listingId: number) {
  let route: ReturnType<typeof useRoute> | null = null
  try {
    route = useRoute()
  } catch {
    route = null
  }

  const workflowStore = useWorkflowStore()
  const listingStore = useListingStore()

  const dynamicSteps = computed(() => [
    ...(workflowStore.workflow?.steps.map((s) => ({ id: s.id, label: s.name })) ?? []),
  ])

  const stepIds = computed(() => [
    ...dynamicSteps.value,
  ])

  const currentStepId = computed(() => {
    if (route?.params?.stepId) {
      return String(route.params.stepId)
    }
    const path = route?.path || ''
    if (path.endsWith('/disclosures')) return 'disclosures'
    if (path.endsWith('/documents')) return 'documents'
    if (path.endsWith('/review')) return 'review'
    return null
  })

  const steps = computed<StepperItem[]>(() => {
    const answeredStepIds = new Set(Object.keys(workflowStore.workflow?.answers ?? {}))
    const completedCount = listingStore.activeListing?.stepsCompleted ?? 0
    const currentIndex = currentStepId.value
      ? stepIds.value.findIndex((s) => s.id === currentStepId.value)
      : -1

    return stepIds.value.map((step, index) => {
      let status: 'completed' | 'current' | 'upcoming'

      if (currentIndex >= 0) {
        if (index === currentIndex) {
          status = 'current'
        } else if (index < currentIndex) {
          status = 'completed'
        } else {
          status = answeredStepIds.has(step.id) || index < completedCount ? 'completed' : 'upcoming'
        }
      } else {
        status =
          index < completedCount || answeredStepIds.has(step.id)
            ? 'completed'
            : index === completedCount
              ? 'current'
              : 'upcoming'
      }

      return {
        id: step.id,
        label: step.label,
        status,
      }
    })
  })

  const NAMED_PAGES = ['disclosures', 'documents', 'review']

  function routeFor(stepId: string): string {
    const isAgent = typeof window !== 'undefined' && window.location.pathname.startsWith('/agent')
    const basePath = isAgent ? '/agent' : ''

    if (NAMED_PAGES.includes(stepId)) {
      return `${basePath}/listings/${listingId}/${stepId}`
    }

    return `${basePath}/listings/${listingId}/step/${stepId}`
  }

  return { steps, routeFor, currentStepId, dynamicSteps, stepIds }
}
