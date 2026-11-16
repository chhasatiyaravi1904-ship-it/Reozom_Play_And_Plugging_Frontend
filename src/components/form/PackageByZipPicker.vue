<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { IconSearch, IconX, IconAlertTriangle, IconLoader2, IconCheck } from '@tabler/icons-vue'
import { lookupZipCode } from '@/services/zipCodeService'
import type { ServicePackage } from '@/services/servicePackageService'

/**
 * Pick a service package by searching a zip code from the zip code database:
 * shows the packages assigned to that zip, or all packages while the search is empty.
 */
const props = defineProps<{
  /** IDs of the selected packages (one process can serve several packages). */
  modelValue: Array<number | string> | null
  packages: ServicePackage[]
  /** The process being edited, so its own package isn't flagged as "linked elsewhere". */
  currentProcessId?: number | string | null
}>()

const emit = defineEmits<{ 'update:modelValue': [value: number[]] }>()

interface FoundZip {
  code: string
  isActive: boolean
  place: string
}

const zipInput = ref('')
const lookupState = ref<'idle' | 'loading' | 'found' | 'notfound' | 'error'>('idle')
const foundZip = ref<FoundZip | null>(null)
let lookupTimer: ReturnType<typeof setTimeout> | undefined
let lookupSeq = 0

async function runLookup() {
  const code = zipInput.value.trim()
  clearTimeout(lookupTimer)

  if (code === '') {
    lookupState.value = 'idle'
    foundZip.value = null
    return
  }

  const seq = ++lookupSeq
  lookupState.value = 'loading'
  try {
    const res: any = await lookupZipCode(encodeURIComponent(code))
    if (seq !== lookupSeq) return
    const z = res?.data ?? {}
    const city = z.city?.name
    const state = z.state?.code || z.state?.name
    foundZip.value = {
      code: z.code ?? code,
      isActive: z.is_active !== false,
      place: [city, state].filter(Boolean).join(', '),
    }
    lookupState.value = 'found'
  } catch (err: any) {
    if (seq !== lookupSeq) return
    foundZip.value = null
    lookupState.value = err?.response?.status === 404 ? 'notfound' : 'error'
  }
}

// Look up as soon as a full 5-digit zip is typed; other input waits for Enter / the button.
watch(zipInput, (value) => {
  clearTimeout(lookupTimer)
  const code = value.trim()
  if (code === '') {
    runLookup()
  } else if (/^\d{5}$/.test(code)) {
    lookupTimer = setTimeout(runLookup, 250)
  } else {
    lookupState.value = 'idle'
    foundZip.value = null
  }
})

function clearSearch() {
  zipInput.value = ''
}

const visiblePackages = computed(() => {
  if (lookupState.value === 'found' && foundZip.value) {
    const code = foundZip.value.code
    return props.packages.filter((p) => (p.zip_codes || []).some((z) => z.code === code))
  }
  if (lookupState.value === 'notfound' || lookupState.value === 'error') return []
  return props.packages
})

const selectedIds = computed(() => (props.modelValue || []).map(Number))
const isSelected = (pkg: ServicePackage) => selectedIds.value.includes(Number(pkg.id))
const selectedPackages = computed(() => props.packages.filter(isSelected))

function linkedElsewhere(pkg: ServicePackage): string | null {
  const linked = pkg.listing_process
  if (!linked?.id) return null
  if (props.currentProcessId != null && Number(linked.id) === Number(props.currentProcessId)) return null
  return linked.name || `process #${linked.id}`
}

function toggle(pkg: ServicePackage) {
  const id = Number(pkg.id)
  emit('update:modelValue', isSelected(pkg) ? selectedIds.value.filter((x) => x !== id) : [...selectedIds.value, id])
}

function remove(pkg: ServicePackage) {
  emit('update:modelValue', selectedIds.value.filter((x) => x !== Number(pkg.id)))
}

function formatPrice(price: ServicePackage['price']) {
  if (price == null || price === ('' as any)) return ''
  const n = Number(price)
  return Number.isFinite(n) ? `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : ''
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <label class="block text-sm font-medium text-neutral-700">Service Packages (Optional)</label>
      <span v-if="selectedPackages.length" class="text-xs font-semibold text-[#1641d9]">{{ selectedPackages.length }} selected</span>
    </div>
    <p class="text-xs text-neutral-500">Search a zip code to see the packages that serve it, then tick one or more.</p>

    <!-- Selected packages -->
    <div v-if="selectedPackages.length" class="flex flex-wrap gap-1.5">
      <span
        v-for="pkg in selectedPackages"
        :key="pkg.id"
        class="inline-flex items-center gap-1 rounded-md border border-[#1641d9]/25 bg-blue-50/70 py-1 pl-2 pr-1 text-xs font-medium text-neutral-900"
      >
        <IconCheck :size="12" class="text-[#1641d9]" />
        {{ pkg.name }}
        <button
          type="button"
          :aria-label="`Remove ${pkg.name}`"
          class="rounded p-0.5 text-neutral-400 hover:bg-white hover:text-neutral-800"
          @click="remove(pkg)"
        >
          <IconX :size="12" />
        </button>
      </span>
    </div>

    <!-- Zip search -->
    <div class="relative">
      <IconSearch :size="16" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
      <input
        v-model="zipInput"
        type="text"
        inputmode="numeric"
        maxlength="10"
        placeholder="Enter zip code, e.g. 48126"
        aria-label="Search packages by zip code"
        class="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-9 pr-9 text-sm focus:border-[#1641d9] focus:outline-none focus:ring-2 focus:ring-[#1641d9]/20"
        @keydown.enter.prevent="runLookup"
      />
      <IconLoader2
        v-if="lookupState === 'loading'"
        :size="16"
        class="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#1641d9]"
      />
      <button
        v-else-if="zipInput"
        type="button"
        aria-label="Clear zip code"
        class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-400 hover:text-neutral-700"
        @click="clearSearch"
      >
        <IconX :size="14" />
      </button>
    </div>

    <!-- Lookup result -->
    <p v-if="lookupState === 'found' && foundZip" class="text-xs text-neutral-600">
      <span class="font-semibold text-neutral-900">{{ foundZip.code }}</span>
      <span v-if="foundZip.place"> · {{ foundZip.place }}</span>
      <span v-if="!foundZip.isActive" class="ml-1 font-semibold text-amber-700">(inactive)</span>
    </p>
    <p v-else-if="lookupState === 'notfound'" class="text-xs font-medium text-rose-600">
      Zip code "{{ zipInput.trim() }}" was not found in the zip code database.
    </p>
    <p v-else-if="lookupState === 'error'" class="text-xs font-medium text-rose-600">
      Could not look up this zip code. Please try again.
    </p>

    <!-- Packages -->
    <div class="max-h-56 overflow-y-auto rounded-lg border border-neutral-200 divide-y divide-neutral-100">
      <button
        v-for="pkg in visiblePackages"
        :key="pkg.id"
        type="button"
        role="checkbox"
        :aria-checked="isSelected(pkg)"
        class="flex w-full items-start gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-neutral-50"
        :class="isSelected(pkg) ? 'bg-blue-50/60' : ''"
        @click="toggle(pkg)"
      >
        <span
          class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border"
          :class="isSelected(pkg) ? 'border-[#1641d9] bg-[#1641d9]' : 'border-neutral-300 bg-white'"
        >
          <IconCheck v-if="isSelected(pkg)" :size="12" class="text-white" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="flex flex-wrap items-baseline gap-x-2">
            <span class="font-medium text-neutral-900">{{ pkg.name }}</span>
            <span v-if="formatPrice(pkg.price)" class="text-xs text-neutral-500">{{ formatPrice(pkg.price) }}</span>
            <span class="text-xs text-neutral-400">· {{ (pkg.zip_codes || []).length }} zip(s)</span>
          </span>
          <span
            v-if="linkedElsewhere(pkg)"
            class="mt-0.5 flex items-center gap-1 text-xs text-amber-700"
          >
            <IconAlertTriangle :size="12" />
            Linked to "{{ linkedElsewhere(pkg) }}". Saving moves it to this process.
          </span>
        </span>
      </button>

      <p v-if="visiblePackages.length === 0 && lookupState !== 'loading'" class="px-3 py-4 text-center text-xs text-neutral-500">
        <template v-if="lookupState === 'found' && foundZip">No package of yours covers {{ foundZip.code }}. Add this zip to a package on the Service Packages page.</template>
        <template v-else-if="packages.length === 0">You don't have any service packages yet.</template>
        <template v-else>No packages to show.</template>
      </p>
    </div>
  </div>
</template>
