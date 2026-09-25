<template>
  <div class="min-h-screen bg-neutral-50 flex flex-col font-sans">
    <header class="bg-white border-b border-neutral-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-neutral-900">Form Preview</h1>
        <p class="text-sm text-neutral-500">Test how your listing form will look and behave for end users.</p>
      </div>
      <router-link
        :to="`/admin/processes/${$route.params.processId}/builder`"
        class="px-4 py-2 text-sm font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded transition"
      >
        Back to Editor
      </router-link>
    </header>

    <main class="flex-1 max-w-3xl w-full mx-auto p-6 md:p-8">
      <div v-if="formStore.steps.length > 0" class="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        
        <!-- Progress Bar -->
        <div class="bg-neutral-100 px-8 py-4 border-b border-neutral-200 flex items-center gap-4 text-sm font-medium text-neutral-500">
           Step {{ activeStepIndex + 1 }} of {{ formStore.steps.length }}
           <div class="flex-1 bg-neutral-200 h-2 rounded-full overflow-hidden">
             <div 
               class="bg-primary h-full transition-all duration-300"
               :style="{ width: `${((activeStepIndex + 1) / formStore.steps.length) * 100}%` }"
             ></div>
           </div>
        </div>

        <div class="p-8">
          <h2 class="text-2xl font-bold text-neutral-900 mb-2">{{ activeStep.name }}</h2>
          <p class="text-neutral-500 mb-8" v-if="activeStep.description">{{ activeStep.description }}</p>

          <div class="space-y-10">
            <template v-if="activeSections.length > 0">
              <div v-for="section in activeSections" :key="section.id" class="space-y-6">
                
                <div class="pb-2 border-b border-neutral-200">
                  <h3 class="text-lg font-bold text-neutral-900">{{ section.name }}</h3>
                  <p v-if="section.description" class="text-sm text-neutral-500 mt-0.5">{{ section.description }}</p>
                </div>
                
                <div v-if="getSectionFields(section).length === 0" class="text-sm text-neutral-400 italic">
                  No fields available.
                </div>

                <div
                  v-for="field in getSectionFields(section)"
                  :key="field.id"
                  class="space-y-1.5"
                >
                  <label class="block text-sm font-semibold text-neutral-800">
                    {{ field.label }}
                    <span v-if="field.required" class="text-red-500 ml-0.5">*</span>
                  </label>
                  
                  <!-- Text / Number / Email / Date / Password Inputs -->
                  <template v-if="['text', 'number', 'email', 'date', 'password'].includes(field.type)">
                    <input
                      :type="field.type"
                      :placeholder="field.helpText || ''"
                      class="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-md focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm text-neutral-900"
                    />
                  </template>
                  
                  <!-- Textarea -->
                  <template v-else-if="field.type === 'textarea'">
                    <textarea
                      :placeholder="field.helpText || ''"
                      class="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-md focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm text-neutral-900"
                      rows="4"
                    ></textarea>
                  </template>
                  
                  <!-- Select -->
                  <template v-else-if="field.type === 'select'">
                    <select
                      class="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-md focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm text-neutral-900"
                    >
                      <option value="" disabled selected>{{ field.helpText || 'Select an option' }}</option>
                      <option v-for="opt in field.options" :key="opt.value" :value="opt.value">
                        {{ opt.label }}
                      </option>
                    </select>
                  </template>

                  <!-- Checkbox -->
                  <template v-else-if="field.type === 'checkbox'">
                    <div class="space-y-2 mt-2">
                      <div class="flex items-center">
                        <input
                          type="checkbox"
                          class="w-4 h-4 text-primary rounded border-neutral-300 focus:ring-primary"
                        />
                        <label class="ml-2 text-sm text-neutral-700">
                          {{ field.helpText || 'Yes, I agree' }}
                        </label>
                      </div>
                    </div>
                  </template>

                  <!-- File -->
                  <template v-else-if="field.type === 'file'">
                     <div class="w-full border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:bg-neutral-50 transition cursor-pointer">
                        <span class="text-sm font-medium text-primary">Click to upload</span>
                        <span class="text-sm text-neutral-500"> or drag and drop</span>
                        <p class="text-xs text-neutral-500 mt-1">{{ field.helpText || 'Any file type' }}</p>
                     </div>
                  </template>
                  
                </div>
              </div>
            </template>
            
            <div v-else class="text-center py-12 text-neutral-500">
              <p>No active sections to display.</p>
            </div>
          </div>
        </div>
        
        <!-- Footer Navigation -->
        <div class="px-8 py-5 bg-neutral-50 border-t border-neutral-200 flex justify-between items-center">
           <button 
             v-if="hasPrev" 
             @click="prevStep" 
             class="px-5 py-2.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition"
           >
             Back
           </button>
           <div v-else></div>

           <button 
             v-if="hasNext" 
             @click="nextStep" 
             class="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition shadow-sm"
           >
             Continue
           </button>
           <button 
             v-else 
             @click="submitForm" 
             class="px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition shadow-sm flex items-center gap-2"
           >
             Submit Listing
           </button>
        </div>

      </div>
      <div v-else class="text-center py-20 text-neutral-500">
         <h2 class="text-xl font-bold mb-2">No Form Configuration Found</h2>
         <p>Please configure the form in the admin editor first.</p>
         <router-link :to="`/admin/processes/${$route.params.processId}/builder`" class="text-primary hover:underline mt-4 inline-block">Return to Editor</router-link>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useFormConfigStore } from '@/stores/formConfig'

const router = useRouter()
const route = useRoute()
const formStore = useFormConfigStore()
const activeStepIndex = ref(0)

formStore.loadProcess(route.params.processId)

const activeStep = computed(() => {
  return formStore.steps[activeStepIndex.value]
})

const activeSections = computed(() => {
  if (!activeStep.value || !activeStep.value.sections) return []
  return activeStep.value.sections
})

const getSectionFields = (section) => {
  if (!section || !section.fields) return []
  return section.fields.filter(f => f.active)
}

const hasPrev = computed(() => activeStepIndex.value > 0)
const hasNext = computed(() => activeStepIndex.value < formStore.steps.length - 1)

const nextStep = () => {
  if (hasNext.value) activeStepIndex.value++
}

const prevStep = () => {
  if (hasPrev.value) activeStepIndex.value--
}

const submitForm = () => {
  // Simulate submission and redirect
  router.push('/listings/1')
}
</script>
