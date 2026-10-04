import { computed } from 'vue'
import { useWorkflowStore } from '@/stores/workflow'
import { useListingStore } from '@/stores/listing'
import type { StepperItem } from '@/components/listing/Stepper.vue'



export function useListingSteps(listingId: number) {
  const workflowStore = useWorkflowStore()
  const listingStore = useListingStore()

  const stepIds = computed(() => [
    ...(workflowStore.workflow?.steps.map((s) => ({ id: s.id, label: s.name })) ?? []),
  ])

  const steps = computed<StepperItem[]>(() => {
    const completedCount = listingStore.activeListing?.stepsCompleted ?? 0
    return stepIds.value.map((step, index) => ({
      id: step.id,
      label: step.label,
      status:
        index < completedCount ? 'completed' : index === completedCount ? 'current' : 'upcoming',
    }))
  })

  function routeFor(stepId: string): string {
    const isAgent = window.location.pathname.startsWith('/agent');
    const basePath = isAgent ? '/agent' : '';
    
    return `${basePath}/listings/${listingId}/step/${stepId}`
  }

  return { steps, routeFor }
}
