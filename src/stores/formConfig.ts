import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getListingProcess,
  updateListingProcess,
  resetDisclosureStep as resetDisclosureStepApi
} from '../services/listingProcessService'
import { useToastStore } from './toast'

export const useFormConfigStore = defineStore('formConfig', () => {
  const toast = useToastStore()
  // State
  const stepsByProcess = ref<Record<string, any[]>>({})
  const activeProcessId = ref('')
  const activeStepId = ref('')
  const hasChanges = ref(false)
  const isLoading = ref(false)
  const saveStatus = ref('idle') // 'idle' | 'saving' | 'saved'
  const lastSaved = ref(null)

  // Computed
  const steps = computed({
    get: () => stepsByProcess.value[activeProcessId.value] ?? [],
    set: (value) => {
      stepsByProcess.value[activeProcessId.value] = value
    }
  })

  const activeStep = computed(() => {
    return steps.value.find((s: any) => s.id === activeStepId.value)
  })

  // Actions
  const loadProcess = async (processId: string) => {
    activeProcessId.value = processId
    isLoading.value = true
    try {
      const response = await getListingProcess(processId)
      // The server keeps the steps in the Reozom shape (locked Map, Pictures, Payment), so use them as-is
      const processData = response.data.config || []

      stepsByProcess.value[processId] = processData
      activeStepId.value = processData.length > 0 ? processData[0].id : ''
      hasChanges.value = false
    } catch (e) {
      console.error('Failed to load process config', e)
      stepsByProcess.value[processId] = []
    } finally {
      isLoading.value = false
    }
  }

  const setActiveStep = (stepId: string) => {
    activeStepId.value = stepId
  }

  const addStep = (stepData: any) => {
    const newStep = {
      id: `step-${Date.now()}`,
      visible: true,
      sections: [],
      ...stepData
    }
    // New steps go before Payment, which always stays the last step
    const payment = steps.value.findIndex((s: any) => s.locked && s.kind === 'payment')
    const insertAt = payment === -1 ? steps.value.length : payment
    steps.value.splice(insertAt, 0, newStep)
    steps.value.forEach((s: any, idx: number) => { s.order = idx + 1 })
    activeStepId.value = newStep.id
    hasChanges.value = true
    autoSave()
  }

  const updateStep = (stepId: string, updates: any) => {
    const step = steps.value.find((s: any) => s.id === stepId)
    if (step) {
      Object.assign(step, updates)
      markCustomized(step)
      hasChanges.value = true
      autoSave()
    }
  }

  const deleteStep = (stepId: string) => {
    const step = steps.value.find((s: any) => s.id === stepId)
    if (step && (step.isSystem || step.locked)) return // Locked steps are managed by the system

    steps.value = steps.value.filter((s: any) => s.id !== stepId)
    steps.value.forEach((step: any, idx: number) => {
      step.order = idx + 1
    })

    if (activeStepId.value === stepId) {
      activeStepId.value = steps.value.length > 0 ? steps.value[0].id : ''
    }

    hasChanges.value = true
    autoSave()
  }

  // Section Actions
  const addSection = (stepId: string, sectionData: any) => {
    const step = steps.value.find((s: any) => s.id === stepId)
    if (step) {
      const order = step.sections.length + 1
      step.sections.push({
        id: `section-${Date.now()}`,
        order,
        fields: [],
        ...sectionData
      })
      markCustomized(step)
      hasChanges.value = true
      autoSave()
    }
  }

  const updateSection = (stepId: string, sectionId: string, updates: any) => {
    const step = steps.value.find((s: any) => s.id === stepId)
    if (step) {
      const section = step.sections.find((sec: any) => sec.id === sectionId)
      if (section) {
        Object.assign(section, updates)
        markCustomized(step)
        hasChanges.value = true
        autoSave()
      }
    }
  }

  const deleteSection = (stepId: string, sectionId: string) => {
    const step = steps.value.find((s: any) => s.id === stepId)
    if (step) {
      step.sections = step.sections.filter((sec: any) => sec.id !== sectionId)
      step.sections.forEach((sec: any, idx: number) => {
        sec.order = idx + 1
      })
      markCustomized(step)
      hasChanges.value = true
      autoSave()
    }
  }

  // Field Actions
  const addField = (stepId: string, sectionId: string, fieldData: any) => {
    const step = steps.value.find((s: any) => s.id === stepId)
    if (step) {
      const section = step.sections.find((sec: any) => sec.id === sectionId)
      if (section) {
        section.fields.push({
          id: `field-${Date.now()}`,
          ...fieldData
        })
        markCustomized(step)
        hasChanges.value = true
        autoSave()
      }
    }
  }

  const updateField = (stepId: string, sectionId: string, fieldId: string, updates: any) => {
    const step = steps.value.find((s: any) => s.id === stepId)
    if (step) {
      const section = step.sections.find((sec: any) => sec.id === sectionId)
      if (section) {
        const field = section.fields.find((f: any) => f.id === fieldId)
        if (field) {
          Object.assign(field, updates)
          markCustomized(step)
          hasChanges.value = true
          autoSave()
        }
      }
    }
  }

  const deleteField = (stepId: string, sectionId: string, fieldId: string) => {
    const step = steps.value.find((s: any) => s.id === stepId)
    if (step) {
      const section = step.sections.find((sec: any) => sec.id === sectionId)
      if (section) {
        section.fields = section.fields.filter((f: any) => f.id !== fieldId)
        markCustomized(step)
        hasChanges.value = true
        autoSave()
      }
    }
  }

  let saveTimeout: any = null

  const autoSave = () => {
    if (saveStatus.value === 'saving' || !activeProcessId.value || activeProcessId.value === 'undefined') return
    saveStatus.value = 'saving'

    if (saveTimeout) clearTimeout(saveTimeout)
    saveTimeout = setTimeout(async () => {
      try {
        await updateListingProcess(activeProcessId.value, { config: steps.value })
        saveStatus.value = 'saved'
        lastSaved.value = new Date() as any
        hasChanges.value = false
      } catch (e) {
        console.error('Failed to save to backend', e)
        notifySaveError(e)
        saveStatus.value = 'idle'
      } finally {
        setTimeout(() => {
          if (saveStatus.value === 'saved') saveStatus.value = 'idle'
        }, 2000)
      }
    }, 1000)
  }

  // Server-side validation (e.g. reserved or duplicate field names) must be visible to the user.
  const notifySaveError = (e: any) => {
    const errors = e?.response?.data?.errors
    const firstError = errors ? (Object.values(errors)[0] as string[] | undefined)?.[0] : null
    toast.error(firstError || e?.response?.data?.message || 'Failed to save the process.')
  }

  // A disclosure step whose questions were edited is flagged so the builder can offer "Reset to master".
  const markCustomized = (step: any) => {
    if (step?.type === 'disclosure') step.customized = true
  }

  const resetDisclosureStep = async (disclosureCode: string) => {
    if (!activeProcessId.value) return
    if (saveTimeout) clearTimeout(saveTimeout)
    try {
      const response = await resetDisclosureStepApi(activeProcessId.value, disclosureCode)
      stepsByProcess.value[activeProcessId.value] = response.data.config || []
      hasChanges.value = false
      toast.success('Disclosure questions restored from the master disclosure.')
    } catch (e) {
      console.error('Failed to reset disclosure step', e)
      notifySaveError(e)
    }
  }

  const saveAll = async () => {
    if (!activeProcessId.value || activeProcessId.value === 'undefined') {
      console.warn('Cannot save: activeProcessId is undefined')
      return
    }
    if (saveTimeout) clearTimeout(saveTimeout)
    saveStatus.value = 'saving'
    try {
      await updateListingProcess(activeProcessId.value, { config: steps.value })
      saveStatus.value = 'saved'
      lastSaved.value = new Date() as any
      hasChanges.value = false
    } catch (e) {
      console.error('Failed to save to backend', e)
      notifySaveError(e)
      saveStatus.value = 'idle'
    } finally {
      setTimeout(() => {
        if (saveStatus.value === 'saved') saveStatus.value = 'idle'
      }, 2000)
    }
  }

  const discardChanges = async () => {
    hasChanges.value = false
    await loadProcess(activeProcessId.value)
  }

  const resetData = async () => {
    stepsByProcess.value[activeProcessId.value] = []
    activeStepId.value = ''
    hasChanges.value = true
    await saveAll()
  }

  return {
    isLoading,
    steps,
    activeProcessId,
    activeStepId,
    hasChanges,
    saveStatus,
    lastSaved,
    activeStep,
    loadProcess,
    setActiveStep,
    addStep,
    updateStep,
    deleteStep,
    addSection,
    updateSection,
    deleteSection,
    addField,
    updateField,
    deleteField,
    autoSave,
    saveAll,
    discardChanges,
    resetData,
    resetDisclosureStep,
    markCustomized
  }
})
