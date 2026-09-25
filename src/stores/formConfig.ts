import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getListingProcess, updateListingProcess } from '../services/listingProcessService'

export const useFormConfigStore = defineStore('formConfig', () => {
  // State
  const stepsByProcess = ref<Record<string, any[]>>({})
  const activeProcessId = ref('')
  const activeStepId = ref('')
  const hasChanges = ref(false)
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
    try {
      const response = await getListingProcess(processId)
      stepsByProcess.value[processId] = response.data.config || []
      const processSteps = stepsByProcess.value[processId]
      activeStepId.value = processSteps.length > 0 ? processSteps[0].id : ''
      hasChanges.value = false
    } catch (e) {
      console.error('Failed to load process config', e)
      stepsByProcess.value[processId] = []
    }
  }

  const setActiveStep = (stepId: string) => {
    activeStepId.value = stepId
  }

  const addStep = (stepData: any) => {
    const order = steps.value.length + 1
    const newStep = {
      id: `step-${Date.now()}`,
      order,
      visible: true,
      sections: [],
      ...stepData
    }
    steps.value.push(newStep)
    activeStepId.value = newStep.id
    hasChanges.value = true
    autoSave()
  }

  const updateStep = (stepId: string, updates: any) => {
    const step = steps.value.find((s: any) => s.id === stepId)
    if (step) {
      Object.assign(step, updates)
      hasChanges.value = true
      autoSave()
    }
  }

  const deleteStep = (stepId: string) => {
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
        saveStatus.value = 'idle'
      } finally {
        setTimeout(() => {
          if (saveStatus.value === 'saved') saveStatus.value = 'idle'
        }, 2000)
      }
    }, 1000)
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
    resetData
  }
})
