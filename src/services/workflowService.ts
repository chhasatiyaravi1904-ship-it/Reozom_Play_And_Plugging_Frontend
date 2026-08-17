import api from './api'
import type { WorkflowDefinition } from '@/types/workflow'
import type { FieldValue } from '@/types/field'

export const fetchWorkflow = (listingId: number) => {
  return api.get<WorkflowDefinition>(`/listings/${listingId}/workflow`)
}

export const submitStep = (
  listingId: number,
  stepId: string,
  values: Record<string, FieldValue>,
) => {
  return api.post(`/listings/${listingId}/steps/${stepId}`, { values })
}
