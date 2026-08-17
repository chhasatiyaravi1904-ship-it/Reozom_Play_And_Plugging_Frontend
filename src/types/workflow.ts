import type { FieldDefinition, FieldCondition } from './field'

export interface WorkflowSection {
  id: string
  title: string
  description?: string
  fields: FieldDefinition[]
  showIf?: FieldCondition
}

export interface WorkflowStep {
  id: string
  name: string
  description?: string
  sections: WorkflowSection[]
  showIf?: FieldCondition
}

export interface WorkflowDefinition {
  listingId: number
  processId: number
  steps: WorkflowStep[]
}

export interface DisclosureQuestion {
  id: string
  question: string
  options: Array<{ label: string; value: string }>
  followUp?: FieldDefinition
  showIf?: FieldCondition
}
