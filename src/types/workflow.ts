import type { FieldDefinition, FieldCondition, FieldValue } from './field'
import type { Condition } from '@/utils/conditions'

export interface WorkflowSection {
  id: string
  title?: string
  name?: string
  description?: string
  fields: FieldDefinition[]
  showIf?: FieldCondition
}

export interface WorkflowStep {
  id: string
  name: string
  description?: string
  sections: WorkflowSection[]
  showIf?: FieldCondition | Condition
  /** Step does not apply when this matches (e.g. trust-owned, non-owner-occupied) */
  skipIf?: Condition
  disclosure_code?: string
  type?: string
  /** Locked steps are managed by the system: 'map' | 'media' | 'payment' */
  kind?: string
  locked?: boolean
}

export interface WorkflowDefinition {
  listingId: number
  processId: number
  steps: WorkflowStep[]
  answers?: Record<string, Record<string, FieldValue>>
}

export interface DisclosureQuestion {
  id: string
  question: string
  options: Array<{ label: string; value: string }>
  followUp?: FieldDefinition
  showIf?: FieldCondition
}
