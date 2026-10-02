import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as workflowService from '@/services/workflowService'
import { isNetworkError } from '@/services/api'
import { sampleWorkflow } from '@/services/sampleData'
import type { WorkflowDefinition } from '@/types/workflow'
import type { FieldValue } from '@/types/field'

export const useWorkflowStore = defineStore('workflow', () => {
  const workflow = ref<WorkflowDefinition | null>(null)
  const values = ref<Record<string, FieldValue>>({})
  const status = ref<'idle' | 'loading' | 'error'>('idle')
  const error = ref<string | null>(null)
  const savedAt = ref<Date | null>(null)

  async function fetchWorkflow(listingId: number) {
    status.value = 'loading'
    error.value = null
    try {
      const { data } = await workflowService.fetchWorkflow(listingId)
      workflow.value = data
      
      // Rehydrate answers from the server
      if (data.answers) {
        let mergedValues = {}
        Object.values(data.answers).forEach((stepValues: any) => {
          mergedValues = { ...mergedValues, ...stepValues }
        })
        values.value = { ...values.value, ...mergedValues }
      }

    } catch (err) {
      // DEV fallback: no Laravel API running yet.
      if (import.meta.env.DEV && isNetworkError(err)) {
        workflow.value = { ...sampleWorkflow, listingId }
      } else {
        status.value = 'error'
        error.value = 'Unable to load your listing workflow. Please try again.'
      }
    } finally {
      if (status.value !== 'error') status.value = 'idle'
    }
  }

  function setValue(fieldId: string, value: FieldValue) {
    values.value[fieldId] = value
  }

  async function saveStep(listingId: number, stepId: string) {
    try {
      await workflowService.submitStep(listingId, stepId, values.value)
      savedAt.value = new Date()
      return true
    } catch (err) {
      if (import.meta.env.DEV && isNetworkError(err)) {
        savedAt.value = new Date()
        return true
      }
      error.value = 'Unable to save this step. Your changes are kept locally.'
      return false
    }
  }

  return { workflow, values, status, error, savedAt, fetchWorkflow, setValue, saveStep }
})
