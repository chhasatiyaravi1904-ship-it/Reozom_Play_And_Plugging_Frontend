<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition p-4"
      @click.self="emit('close')"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-neutral-300 shrink-0">
          <h2 class="text-lg font-semibold text-neutral-900">
            {{ isEditing ? `Edit Field: ${form.label}` : 'Add New Field' }}
          </h2>
          <button
            @click="emit('close')"
            class="p-1 text-neutral-400 hover:text-neutral-900 rounded transition"
          >
            <IconX :size="24" />
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 overflow-y-auto space-y-6">
          <!-- Section 1: Field Identity -->
          <div class="space-y-4 p-4 bg-neutral-50 rounded-md border-l-4 border-primary">
            <h3 class="text-sm font-semibold text-neutral-900">Field Identity</h3>

            <!-- Display Label -->
            <div>
              <label class="block text-xs font-semibold text-neutral-700 mb-1">
                Display Label <span class="text-danger">*</span>
              </label>
              <input
                v-model="form.label"
                type="text"
                placeholder="Property Type"
                class="w-full px-3 py-2 border border-neutral-300 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                @input="autoSlugify"
              />
              <p class="mt-1 text-xs text-neutral-500">What agents see in the form.</p>
            </div>

            <!-- Field Name -->
            <div>
              <label class="block text-xs font-semibold text-neutral-700 mb-1">
                Field Name <span class="text-danger">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                placeholder="property_type"
                class="w-full px-3 py-2 border border-neutral-300 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 transition font-mono text-sm"
              />
              <p class="mt-1 text-xs text-neutral-500">Used in exports. No spaces.</p>
            </div>
          </div>

          <!-- Section 2: Field Type & Options -->
          <div class="space-y-4 p-4 bg-neutral-50 rounded-md border-l-4 border-primary">
            <h3 class="text-sm font-semibold text-neutral-900">Field Type & Options</h3>

            <!-- Field Type -->
            <div>
              <label class="block text-xs font-semibold text-neutral-700 mb-1">
                Input Type <span class="text-danger">*</span>
              </label>
              <select
                v-model="form.type"
                class="w-full px-3 py-2 border border-neutral-300 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm bg-white"
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="email">Email</option>
                <option value="select">Select (Dropdown)</option>
                <option value="radio">Radio</option>
                <option value="checkbox">Checkbox</option>
                <option value="textarea">Textarea</option>
                <option value="file">File Upload</option>
              </select>
            </div>

            <!-- Options (for select/radio/checkbox) -->
            <div v-if="['select', 'radio', 'checkbox'].includes(form.type)">
              <label class="block text-xs font-semibold text-neutral-700 mb-1">
                Options (one per line)
              </label>
              <textarea
                v-model="form.optionsText"
                placeholder="Residential : residential&#10;Vacant Land : vacant_land"
                class="w-full px-3 py-2 border border-neutral-300 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 transition font-mono text-sm"
                rows="4"
              ></textarea>
              <p class="mt-1 text-xs text-neutral-500">Format: Label : value (or just Label)</p>
            </div>
          </div>

          <!-- Section 3: Validation & Behavior -->
          <div class="space-y-4 p-4 bg-neutral-50 rounded-md border-l-4 border-primary">
            <h3 class="text-sm font-semibold text-neutral-900">Validation & Behavior</h3>

            <!-- Required -->
            <div class="flex items-center">
              <input
                id="required"
                v-model="form.required"
                type="checkbox"
                class="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary cursor-pointer"
              />
              <label for="required" class="ml-2 text-sm font-medium text-neutral-700 cursor-pointer">
                Required field
              </label>
            </div>

            <!-- Default Value -->
            <div>
              <label class="block text-xs font-semibold text-neutral-700 mb-1">
                Default Value
              </label>
              <input
                v-model="form.defaultValue"
                type="text"
                class="w-full px-3 py-2 border border-neutral-300 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
              />
            </div>
          </div>

          <!-- Section 4: Help & Visibility -->
          <div class="space-y-4 p-4 bg-neutral-50 rounded-md border-l-4 border-primary">
            <h3 class="text-sm font-semibold text-neutral-900">Help & Visibility</h3>

            <!-- Help Text -->
            <div>
              <label class="block text-xs font-semibold text-neutral-700 mb-1">
                Help Text / Placeholder
              </label>
              <textarea
                v-model="form.helpText"
                placeholder="Helpful guidance for agents"
                class="w-full px-3 py-2 border border-neutral-300 rounded focus:border-primary focus:ring-2 focus:ring-primary/20 transition text-sm"
                rows="2"
              ></textarea>
            </div>
          </div>

          <!-- Section 5: Parent Field Dependencies -->
          <div class="space-y-4 p-4 bg-neutral-50 rounded-md border-l-4 border-warning">
            <h3 class="text-sm font-semibold text-neutral-900">Conditional Visibility (Optional)</h3>

            <div v-if="form.dependencies.length === 0" class="text-sm text-neutral-600">
              Add dependencies to show this field only under certain conditions.
            </div>

            <!-- Dependencies List -->
            <div v-for="(dep, idx) in form.dependencies" :key="idx" class="p-3 bg-white border border-neutral-200 rounded">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium text-neutral-600">
                  Condition {{ idx + 1 }} {{ idx > 0 ? '(AND)' : '' }}
                </span>
                <button
                  @click="removeDependency(idx)"
                  class="text-danger hover:bg-red-50 p-1 rounded transition"
                >
                  <IconTrash :size="16" />
                </button>
              </div>

              <div class="grid grid-cols-3 gap-2">
                <!-- Parent Field -->
                <select
                  v-model="dep.parentFieldId"
                  class="text-xs px-2 py-1.5 border border-neutral-300 rounded focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white"
                >
                  <option value="">Select field</option>
                  <option v-for="f in availableParentFields" :key="f.id" :value="f.id">
                    {{ f.label }}
                  </option>
                </select>

                <!-- Condition Type -->
                <select
                  v-model="dep.condition"
                  class="text-xs px-2 py-1.5 border border-neutral-300 rounded focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white"
                >
                  <option value="equals">Equals</option>
                  <option value="contains">Contains</option>
                  <option value="checked">Is checked</option>
                </select>

                <!-- Condition Value -->
                <input
                  v-model="dep.value"
                  type="text"
                  placeholder="Value"
                  class="text-xs px-2 py-1.5 border border-neutral-300 rounded focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>

            <!-- Add Dependency Button -->
            <button
              @click="addDependency"
              class="text-sm font-medium text-primary hover:text-primary/80 transition flex items-center gap-1"
            >
              <IconPlus :size="16" /> Add Condition
            </button>
          </div>

          <!-- Section 6: Activation -->
          <div class="space-y-4 p-4 bg-neutral-50 rounded-md border-l-4 border-primary">
            <h3 class="text-sm font-semibold text-neutral-900">Activation</h3>

            <div class="flex items-center gap-6">
              <div class="flex items-center">
                <input
                  id="active"
                  v-model="form.active"
                  type="checkbox"
                  class="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary cursor-pointer"
                />
                <label for="active" class="ml-2 text-sm font-medium text-neutral-700 cursor-pointer">
                  Active field
                </label>
              </div>

              <div class="flex items-center">
                <input
                  id="export"
                  v-model="form.showInExport"
                  type="checkbox"
                  class="w-4 h-4 rounded border-neutral-300 text-primary focus:ring-primary cursor-pointer"
                />
                <label for="export" class="ml-2 text-sm font-medium text-neutral-700 cursor-pointer">
                  Include in data export
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between p-6 border-t border-neutral-300 bg-neutral-50 shrink-0">
          <div>
            <button
              v-if="isEditing"
              @click="emit('delete')"
              class="px-4 py-2 text-sm font-medium text-white bg-danger hover:bg-danger/90 rounded transition"
            >
              Delete Field
            </button>
          </div>
          <div class="flex gap-2">
            <button
              @click="emit('close')"
              class="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-200 hover:bg-neutral-300 rounded transition"
            >
              Cancel
            </button>
            <button
              @click="handleSave"
              class="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded transition"
            >
              {{ isEditing ? 'Save Field' : 'Add Field' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { IconX, IconTrash, IconPlus } from '@tabler/icons-vue'

const props = defineProps({
  isOpen: Boolean,
  isEditing: Boolean,
  fieldData: Object,
  availableParentFields: Array
})

const emit = defineEmits(['close', 'save', 'delete'])

const defaultFormState = {
  name: '',
  label: '',
  type: 'text',
  required: false,
  active: true,
  defaultValue: '',
  helpText: '',
  section: '',
  minLength: null,
  maxLength: null,
  optionsText: '',
  showInExport: true,
  dependencies: []
}

const form = ref({ ...defaultFormState })
let autoNameEnabled = true

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    if (props.isEditing && props.fieldData) {
      form.value = JSON.parse(JSON.stringify(props.fieldData))
      
      // Convert options array to text if needed
      if (form.value.options && Array.isArray(form.value.options)) {
        form.value.optionsText = form.value.options.map(opt => `${opt.label} : ${opt.value}`).join('\n')
      }
      
      autoNameEnabled = false
    } else {
      form.value = JSON.parse(JSON.stringify(defaultFormState))
      autoNameEnabled = true
    }
  }
})

const autoSlugify = () => {
  if (!autoNameEnabled) return
  form.value.name = form.value.label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

const addDependency = () => {
  if (!form.value.dependencies) form.value.dependencies = []
  form.value.dependencies.push({
    parentFieldId: '',
    condition: 'equals',
    value: ''
  })
}

const removeDependency = (idx) => {
  form.value.dependencies.splice(idx, 1)
}

const handleSave = () => {
  const dataToSave = JSON.parse(JSON.stringify(form.value))
  
  // Parse options if needed
  if (['select', 'radio', 'checkbox'].includes(dataToSave.type) && dataToSave.optionsText) {
    dataToSave.options = dataToSave.optionsText.split('\n').filter(line => line.trim()).map(line => {
      const parts = line.split(':').map(p => p.trim())
      return {
        label: parts[0],
        value: parts.length > 1 ? parts[1] : parts[0].toLowerCase().replace(/[^a-z0-9]+/g, '_')
      }
    })
    delete dataToSave.optionsText
  }
  
  emit('save', dataToSave)
}
</script>
