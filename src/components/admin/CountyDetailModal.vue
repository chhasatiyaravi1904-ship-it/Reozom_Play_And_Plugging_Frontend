<script setup lang="ts">
import { computed } from 'vue'
import {
  X,
  MapPin,
  Flag,
  Calendar,
  Layers,
  Edit3,
  Power,
  Clock,
  Hash,
} from 'lucide-vue-next'
import type { CountyDetail } from '@/types/county'

const props = defineProps<{
  modelValue: boolean
  county: CountyDetail | null
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'edit', county: CountyDetail): void
  (e: 'toggleStatus', county: CountyDetail): void
}>()

const isActive = computed(() => {
  if (!props.county) return false
  if (props.county.isActive !== undefined) return Boolean(props.county.isActive)
  if ((props.county as any).is_active !== undefined) return Boolean((props.county as any).is_active)
  return props.county.status === 'active'
})

const countyName = computed(() => props.county?.name || '')
const countyCode = computed(() => props.county?.code || '')
const countySlug = computed(
  () => props.county?.slug || (props.county?.name ? props.county.name.toLowerCase().replace(/\s+/g, '-') : ''),
)
const countyId = computed(() => props.county?.id || '')
const stateName = computed(() => props.county?.state?.name || '')
const stateCode = computed(() => props.county?.state?.code || '')

const formattedCreatedAt = computed(() => {
  const dt = props.county?.createdAt || (props.county as any)?.created_at
  if (!dt) return 'N/A'
  try {
    const d = new Date(dt)
    return isNaN(d.getTime()) ? String(dt) : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return String(dt)
  }
})

const formattedUpdatedAt = computed(() => {
  const dt = props.county?.updatedAt || (props.county as any)?.updated_at
  if (!dt) return 'N/A'
  try {
    const d = new Date(dt)
    return isNaN(d.getTime()) ? String(dt) : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return String(dt)
  }
})

function handleClose() {
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue && county"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        @click="handleClose"
      ></div>

      <!-- Modal Card -->
      <div
        class="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl transition-all"
      >
        <!-- Header -->
        <div class="flex items-start justify-between border-b border-slate-100 pb-4">
          <div class="flex items-center gap-3.5">
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[#0f6b5c] ring-1 ring-teal-600/20"
            >
              <MapPin class="h-6 w-6" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-xl font-bold text-slate-900 leading-tight">
                  {{ countyName }}
                </h2>
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  :class="
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                      : 'bg-slate-100 text-slate-600 ring-1 ring-slate-400/20'
                  "
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full"
                    :class="isActive ? 'bg-emerald-500' : 'bg-slate-400'"
                  ></span>
                  {{ isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">
                Slug: <code class="font-mono text-slate-600 font-medium">{{ countySlug }}</code>
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

        <!-- Details Grid -->
        <div class="mt-4 space-y-3">
          <div class="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 space-y-2.5 text-xs text-slate-700">
            <div class="flex items-center justify-between">
              <span class="text-slate-500 font-medium flex items-center gap-1.5">
                <Hash class="h-3.5 w-3.5 text-slate-400" />
                <span>County ID</span>
              </span>
              <span class="font-mono text-[11px] text-slate-800 select-all font-medium">{{ countyId }}</span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-slate-500 font-medium flex items-center gap-1.5">
                <MapPin class="h-3.5 w-3.5 text-slate-400" />
                <span>County Code</span>
              </span>
              <span class="font-mono font-bold text-slate-800">{{ countyCode }}</span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-slate-500 font-medium flex items-center gap-1.5">
                <Flag class="h-3.5 w-3.5 text-slate-400" />
                <span>Parent State</span>
              </span>
              <span class="font-semibold text-slate-800">
                {{ stateName ? `${stateName} (${stateCode})` : '—' }}
              </span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-slate-500 font-medium flex items-center gap-1.5">
                <Layers class="h-3.5 w-3.5 text-slate-400" />
                <span>Status</span>
              </span>
              <span class="font-semibold" :class="isActive ? 'text-emerald-700' : 'text-slate-500'">
                {{ isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>

          <!-- Timestamps -->
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div class="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
              <div class="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
                <Calendar class="h-3.5 w-3.5" />
                <span>Created At</span>
              </div>
              <p class="mt-1 font-medium text-slate-800 text-xs truncate">
                {{ formattedCreatedAt }}
              </p>
            </div>

            <div class="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
              <div class="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
                <Clock class="h-3.5 w-3.5" />
                <span>Last Updated</span>
              </div>
              <p class="mt-1 font-medium text-slate-800 text-xs truncate">
                {{ formattedUpdatedAt }}
              </p>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            @click="emit('toggleStatus', county)"
          >
            <Power class="h-3.5 w-3.5" :class="isActive ? 'text-amber-600' : 'text-emerald-600'" />
            <span>{{ isActive ? 'Deactivate County' : 'Activate County' }}</span>
          </button>

          <div class="flex gap-2">
            <button
              type="button"
              class="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50"
              @click="handleClose"
            >
              Close
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-lg bg-[#0f6b5c] px-4 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-[#0b564a]"
              @click="emit('edit', county); handleClose()"
            >
              <Edit3 class="h-3.5 w-3.5" />
              <span>Edit County</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
