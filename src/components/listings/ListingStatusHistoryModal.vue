<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 sm:p-8 overflow-hidden">
      <div class="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 class="text-xl font-bold text-slate-900">Listing Status History</h3>
          <p class="text-xs text-slate-400 mt-1">Audit log of all lifecycle transitions and status updates.</p>
        </div>
        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 transition">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="mt-6 space-y-6" role="status" aria-label="Loading history">
        <!-- Timeline-shaped placeholder: dot + two lines per entry -->
        <div v-for="i in 4" :key="i" class="flex gap-3" aria-hidden="true">
          <div class="skeleton h-8 w-8 shrink-0 rounded-full"></div>
          <div class="flex-1 space-y-2 pt-1">
            <div class="skeleton h-3.5 rounded" :class="i % 2 ? 'w-2/3' : 'w-1/2'"></div>
            <div class="skeleton h-3 w-1/3 rounded"></div>
          </div>
        </div>
        <span class="sr-only">Loading history…</span>
      </div>

      <!-- Timeline -->
      <div v-else-if="history.length === 0" class="py-12 text-center text-slate-400">
        <p class="text-sm">No transition records found.</p>
      </div>

      <div v-else class="mt-6 flow-root max-h-96 overflow-y-auto pr-2">
        <ul role="list" class="-mb-8">
          <li v-for="(item, itemIdx) in history" :key="item.id">
            <div class="relative pb-8">
              <span
                v-if="itemIdx !== history.length - 1"
                class="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200"
                aria-hidden="true"
              ></span>
              <div class="relative flex space-x-3">
                <div>
                  <span
                    class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white"
                    :class="badgeBg(item.to_status)"
                  >
                    <span class="text-xs font-bold">{{ item.to_status[0]?.toUpperCase() }}</span>
                  </span>
                </div>
                <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p class="text-sm font-semibold text-slate-900">
                      {{ item.from_status ? item.from_status.replace(/_/g, ' ') : 'Start' }}
                      <span class="text-slate-400 mx-1">→</span>
                      <span class="capitalize">{{ item.to_status.replace(/_/g, ' ') }}</span>
                    </p>
                    <p v-if="item.comment" class="text-xs text-slate-600 mt-1 italic">
                      "{{ item.comment }}"
                    </p>
                    <p class="text-xs text-slate-400 mt-1">
                      By <span class="font-medium text-slate-700 capitalize">{{ item.actor_role }}</span>
                      <span v-if="item.actor"> ({{ item.actor.name || item.actor.email }})</span>
                    </p>
                  </div>
                  <div class="whitespace-nowrap text-right text-xs text-slate-400">
                    <time :datetime="item.created_at">{{ formatDate(item.created_at) }}</time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <div class="mt-6 pt-4 border-t border-slate-100 flex justify-end">
        <button
          @click="$emit('close')"
          class="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-medium transition"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { fetchListingStatusHistory, type StatusHistoryItem } from '@/services/listingStatusService'

const props = defineProps<{
  isOpen: boolean
  listingId: number
}>()

defineEmits(['close'])

const history = ref<StatusHistoryItem[]>([])
const loading = ref(false)

const loadHistory = async () => {
  if (!props.listingId) return
  loading.value = true
  try {
    const res = await fetchListingStatusHistory(props.listingId)
    history.value = res.data.history
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

watch(
  () => props.isOpen,
  (val) => {
    if (val) loadHistory()
  },
)

const formatDate = (iso: string) => {
  if (!iso) return ''
  return new Date(iso).toLocaleString()
}

const badgeBg = (status: string) => {
  switch (status) {
    case 'published':
      return 'bg-emerald-500 text-white'
    case 'under_contract':
      return 'bg-amber-500 text-white'
    case 'sold':
      return 'bg-purple-600 text-white'
    case 'submitted':
      return 'bg-blue-500 text-white'
    default:
      return 'bg-slate-400 text-white'
  }
}
</script>
