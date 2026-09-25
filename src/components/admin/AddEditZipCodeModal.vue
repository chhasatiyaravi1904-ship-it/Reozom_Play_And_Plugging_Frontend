<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { X, MapPin, ChevronDown } from 'lucide-vue-next'
import { useStateStore } from '@/stores/state'
import { useCountyStore } from '@/stores/county'
import { useCityStore } from '@/stores/city'
import type { ZipCodeItem, CreateZipCodePayload } from '@/types/zipCode'

const props = defineProps<{
  modelValue: boolean
  zipCodeToEdit?: ZipCodeItem | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'save', payload: CreateZipCodePayload): void
}>()

const stateStore = useStateStore()
const countyStore = useCountyStore()
const cityStore = useCityStore()

const isEditMode = computed(() => !!props.zipCodeToEdit)

const form = ref({
  code: '',
  stateId: '',
  countyId: '',
  cityId: '',
  isActive: true,
})

const errors = ref<Record<string, string>>({})

const availableStates = computed(() => {
  return stateStore.states.slice().sort((a, b) => a.name.localeCompare(b.name))
})

const availableCounties = computed(() => {
  if (!form.value.stateId) return []
  return countyStore.counties
    .filter((c) => String(c.stateId ?? c.state?.id) === String(form.value.stateId))
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
})

const availableCities = computed(() => {
  if (!form.value.countyId) return []
  return cityStore.cities
    .filter((c) => String(c.countyId ?? c.county?.id) === String(form.value.countyId))
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
})

function onStateChange() {
  form.value.countyId = ''
  form.value.cityId = ''
}

function onCountyChange() {
  form.value.cityId = ''
}

onMounted(() => {
  if (stateStore.states.length === 0) stateStore.fetchStates()
  if (countyStore.counties.length === 0) countyStore.fetchCounties()
  if (cityStore.cities.length === 0) cityStore.fetchCities()
})

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      errors.value = {}
      if (stateStore.states.length === 0) stateStore.fetchStates()
      if (countyStore.counties.length === 0) countyStore.fetchCounties()
      if (cityStore.cities.length === 0) cityStore.fetchCities()
      
      if (props.zipCodeToEdit) {
        form.value = {
          code: props.zipCodeToEdit.code,
          stateId: String(props.zipCodeToEdit.stateId ?? ''),
          countyId: String(props.zipCodeToEdit.countyId ?? ''),
          cityId: String(props.zipCodeToEdit.cityId ?? ''),
          isActive:
            props.zipCodeToEdit.isActive !== undefined
              ? Boolean(props.zipCodeToEdit.isActive)
              : props.zipCodeToEdit.status !== 'inactive',
        }
      } else {
        form.value = {
          code: '',
          stateId: '',
          countyId: '',
          cityId: '',
          isActive: true,
        }
      }
    }
  },
  { immediate: true },
)

function validate(): boolean {
  errors.value = {}
  if (!form.value.stateId) {
    errors.value.stateId = 'State is required.'
  }
  if (!form.value.countyId) {
    errors.value.countyId = 'County is required.'
  }
  if (!form.value.cityId) {
    errors.value.cityId = 'City is required.'
  }
  if (!form.value.code.trim()) {
    errors.value.code = 'ZIP code is required.'
  } else if (form.value.code.trim().length > 10) {
    errors.value.code = 'Must be 10 characters or fewer.'
  }
  return Object.keys(errors.value).length === 0
}

function handleClose() {
  emit('update:modelValue', false)
}

function handleSubmit() {
  if (!validate()) return

  emit('save', {
    code: form.value.code.trim(),
    stateId: form.value.stateId,
    countyId: form.value.countyId,
    cityId: form.value.cityId,
    isActive: Boolean(form.value.isActive),
    status: form.value.isActive ? 'active' : 'inactive',
  })
  handleClose()
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        @click="handleClose"
      ></div>

      <div
        class="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all"
      >
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-[#0f6b5c] ring-1 ring-teal-600/20"
            >
              <MapPin class="h-5 w-5" />
            </div>
            <div>
              <h2 class="text-lg font-semibold text-slate-900">
                {{ isEditMode ? 'Edit ZIP Code' : 'Add New ZIP Code' }}
              </h2>
              <p class="text-xs text-slate-500">
                {{ isEditMode ? 'Update ZIP code, hierarchy, and status.' : 'Register a new ZIP code under a city.' }}
              </p>
            </div>
          </div>
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            @click="handleClose"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <form class="mt-5 space-y-4" @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <!-- State -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                State <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <select
                  v-model="form.stateId"
                  class="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20"
                  :class="{ 'border-red-400 focus:ring-red-400/20': errors.stateId }"
                  @change="onStateChange"
                >
                  <option value="" disabled>Select a state...</option>
                  <option v-for="s in availableStates" :key="s.id" :value="String(s.id)">
                    {{ s.name }} ({{ s.code }})
                  </option>
                </select>
                <ChevronDown class="pointer-events-none absolute inset-y-0 right-0 my-auto mr-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>
              <p v-if="errors.stateId" class="mt-1 text-xs text-red-600">{{ errors.stateId }}</p>
            </div>

            <!-- County -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                County <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <select
                  v-model="form.countyId"
                  :disabled="!form.stateId"
                  class="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20 disabled:bg-slate-50 disabled:text-slate-400"
                  :class="{ 'border-red-400 focus:ring-red-400/20': errors.countyId }"
                  @change="onCountyChange"
                >
                  <option value="" disabled>Select a county...</option>
                  <option v-for="c in availableCounties" :key="c.id" :value="String(c.id)">
                    {{ c.name }}
                  </option>
                </select>
                <ChevronDown class="pointer-events-none absolute inset-y-0 right-0 my-auto mr-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>
              <p v-if="errors.countyId" class="mt-1 text-xs text-red-600">{{ errors.countyId }}</p>
            </div>

            <!-- City -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                City <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <select
                  v-model="form.cityId"
                  :disabled="!form.countyId"
                  class="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20 disabled:bg-slate-50 disabled:text-slate-400"
                  :class="{ 'border-red-400 focus:ring-red-400/20': errors.cityId }"
                >
                  <option value="" disabled>Select a city...</option>
                  <option v-for="c in availableCities" :key="c.id" :value="String(c.id)">
                    {{ c.name }}
                  </option>
                </select>
                <ChevronDown class="pointer-events-none absolute inset-y-0 right-0 my-auto mr-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>
              <p v-if="errors.cityId" class="mt-1 text-xs text-red-600">{{ errors.cityId }}</p>
            </div>

            <!-- ZIP Code -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">
                ZIP Code <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.code"
                type="text"
                maxlength="10"
                placeholder="e.g. 90210"
                class="w-full font-mono font-bold rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20"
                :class="{ 'border-red-400 focus:ring-red-400/20': errors.code }"
              />
              <p v-if="errors.code" class="mt-1 text-xs text-red-600">{{ errors.code }}</p>
            </div>

            <!-- Status / isActive -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
              <select
                :value="form.isActive ? 'active' : 'inactive'"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-2xs focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20"
                @change="form.isActive = ($event.target as HTMLSelectElement).value === 'active'"
              >
                <option value="active">🟢 Active (Available for discovery)</option>
                <option value="inactive">🔴 Inactive (Disabled)</option>
              </select>
            </div>
          </div>

          <div class="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-2xs hover:bg-slate-50"
              @click="handleClose"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="inline-flex items-center gap-2 rounded-lg bg-[#0f6b5c] px-4 py-2 text-sm font-semibold text-white shadow-2xs hover:bg-[#0b564a]"
            >
              {{ isEditMode ? 'Save Changes' : 'Create ZIP Code' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
