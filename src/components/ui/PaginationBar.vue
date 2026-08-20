<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    page: number
    perPage: number
    totalItems: number
    perPageOptions?: number[]
    itemLabel?: string
  }>(),
  {
    perPageOptions: () => [5, 10, 15],
    itemLabel: 'items',
  },
)

const emit = defineEmits<{
  (e: 'update:page', val: number): void
  (e: 'update:perPage', val: number): void
}>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.totalItems / props.perPage)))

const rangeStart = computed(() => (props.totalItems === 0 ? 0 : (props.page - 1) * props.perPage + 1))
const rangeEnd = computed(() => Math.min(props.page * props.perPage, props.totalItems))

// Windowed page numbers with ellipses, e.g. 1 … 4 5 [6] 7 8 … 12
const pageItems = computed<(number | 'ellipsis')[]>(() => {
  const total = totalPages.value
  const current = props.page
  const items: (number | 'ellipsis')[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) items.push(i)
    return items
  }

  items.push(1)
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  if (start > 2) items.push('ellipsis')
  for (let i = start; i <= end; i++) items.push(i)
  if (end < total - 1) items.push('ellipsis')
  items.push(total)

  return items
})

function goToPage(p: number) {
  if (p < 1 || p > totalPages.value || p === props.page) return
  emit('update:page', p)
}

function onPerPageChange(event: Event) {
  emit('update:perPage', Number((event.target as HTMLSelectElement).value))
}
</script>

<template>
  <div
    class="flex flex-col gap-3 border-t border-slate-200/80 bg-slate-50/40 px-4 sm:px-6 py-3 sm:flex-row sm:items-center sm:justify-between"
  >
    <!-- Range + rows-per-page -->
    <div class="flex items-center gap-4 text-xs text-slate-500">
      <span>
        Showing <strong class="text-slate-700">{{ rangeStart }}–{{ rangeEnd }}</strong> of
        <strong class="text-slate-700">{{ totalItems }}</strong> {{ itemLabel }}
      </span>

      <div class="flex items-center gap-1.5">
        <label for="per-page-select" class="text-slate-500">Rows:</label>
        <div class="relative">
          <select
            id="per-page-select"
            :value="perPage"
            class="appearance-none rounded-lg border border-slate-200 bg-white py-1 pl-2.5 pr-6 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 focus:border-[#0f6b5c] focus:outline-none focus:ring-2 focus:ring-[#0f6b5c]/20"
            @change="onPerPageChange"
          >
            <option v-for="opt in perPageOptions" :key="opt" :value="opt">{{ opt }}</option>
          </select>
          <ChevronDown class="pointer-events-none absolute inset-y-0 right-0 my-auto mr-1.5 h-3 w-3 text-slate-400" />
        </div>
      </div>
    </div>

    <!-- Page navigation -->
    <div v-if="totalPages > 1" class="flex items-center gap-1">
      <button
        type="button"
        class="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        :disabled="page === 1"
        aria-label="Previous page"
        @click="goToPage(page - 1)"
      >
        <ChevronLeft class="h-3.5 w-3.5" />
      </button>

      <template v-for="(item, idx) in pageItems" :key="idx">
        <span v-if="item === 'ellipsis'" class="px-1.5 text-xs text-slate-400">…</span>
        <button
          v-else
          type="button"
          class="inline-flex h-7 min-w-7 items-center justify-center rounded-lg px-1.5 text-xs font-medium transition-colors"
          :class="
            item === page
              ? 'bg-[#0f6b5c] text-white'
              : 'text-slate-600 hover:bg-white hover:text-slate-900'
          "
          @click="goToPage(item)"
        >
          {{ item }}
        </button>
      </template>

      <button
        type="button"
        class="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
        :disabled="page === totalPages"
        aria-label="Next page"
        @click="goToPage(page + 1)"
      >
        <ChevronRight class="h-3.5 w-3.5" />
      </button>
    </div>
  </div>
</template>
