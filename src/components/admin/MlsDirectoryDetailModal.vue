<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Network, Plus, Pencil, Trash2, Globe2, Link as LinkIcon } from 'lucide-vue-next'
import Modal from '@/components/ui/Modal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import AddEditMlsInfoModal from '@/components/admin/AddEditMlsInfoModal.vue'
import DeleteMlsInfoModal from '@/components/admin/DeleteMlsInfoModal.vue'
import { useMlsStore } from '@/stores/mls'
import { useToastStore } from '@/stores/toast'
import type { MlsInfoItem, CreateMlsInfoPayload } from '@/types/mls'

const props = defineProps<{
  modelValue: boolean
  directoryId: number | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
}>()

const mlsStore = useMlsStore()
const toast = useToastStore()

const isAddEditInfoOpen = ref(false)
const infoToEdit = ref<MlsInfoItem | null>(null)
const isDeleteInfoOpen = ref(false)
const infoToDelete = ref<MlsInfoItem | null>(null)

const directory = computed(() => mlsStore.activeDirectory)
const infos = computed(() => directory.value?.infos || [])

watch(
  () => [props.modelValue, props.directoryId] as const,
  ([open, directoryId]) => {
    if (open && directoryId) {
      mlsStore.fetchDirectory(directoryId)
    }
  },
  { immediate: true },
)

function handleClose() {
  emit('update:modelValue', false)
}

function openAddInfo() {
  infoToEdit.value = null
  isAddEditInfoOpen.value = true
}

function openEditInfo(info: MlsInfoItem) {
  infoToEdit.value = info
  isAddEditInfoOpen.value = true
}

function openDeleteInfo(info: MlsInfoItem) {
  infoToDelete.value = info
  isDeleteInfoOpen.value = true
}

async function handleSaveInfo(payload: CreateMlsInfoPayload) {
  if (infoToEdit.value) {
    const updated = await mlsStore.updateInfo(infoToEdit.value.id, payload)
    if (updated) {
      toast.success('MLS info entry updated.')
    } else if (mlsStore.error) {
      toast.error(mlsStore.error)
    }
  } else {
    const created = await mlsStore.createInfo(payload)
    if (created) {
      toast.success('MLS info entry added.')
    } else if (mlsStore.error) {
      toast.error(mlsStore.error)
    }
  }
}

async function handleDeleteInfo(info: MlsInfoItem) {
  const success = await mlsStore.deleteInfo(info.id)
  if (success) {
    toast.success('MLS info entry removed.')
  } else if (mlsStore.error) {
    toast.error(mlsStore.error)
  }
}
</script>

<template>
  <Modal
    :model-value="modelValue"
    size="lg"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="flex items-start justify-between gap-3 border-b border-border pb-4 -mt-2">
      <div class="flex items-center gap-3 min-w-0">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary ring-1 ring-primary/20">
          <Network class="h-5 w-5" />
        </div>
        <div class="min-w-0">
          <h2 class="text-lg font-semibold text-fg truncate">{{ directory?.title || 'MLS Directory' }}</h2>
          <p class="text-xs text-fg-muted">{{ infos.length }} info entr{{ infos.length === 1 ? 'y' : 'ies' }}</p>
        </div>
      </div>
      <BaseButton variant="primary" size="sm" @click="openAddInfo">
        <Plus class="h-3.5 w-3.5" />
        <span class="ml-1.5">Add Info</span>
      </BaseButton>
    </div>

    <div class="mt-4 max-h-[60vh] space-y-3 overflow-y-auto pr-1">
      <div v-if="mlsStore.detailStatus === 'loading'" class="space-y-3">
        <div v-for="i in 2" :key="i" class="h-20 animate-pulse rounded-xl bg-surface-raised"></div>
      </div>

      <EmptyState
        v-else-if="infos.length === 0"
        :icon="Network"
        title="No info entries yet"
        description="Add country coverage, public websites, and notes for this MLS directory."
      >
        <template #action>
          <BaseButton variant="secondary" size="sm" @click="openAddInfo">Add Info</BaseButton>
        </template>
      </EmptyState>

      <div
        v-for="info in infos"
        :key="info.id"
        class="rounded-xl border border-border bg-surface-raised p-3.5"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-sm font-semibold text-fg truncate">{{ info.title || `Info #${info.id}` }}</p>
            <div v-if="info.countries.length" class="mt-1.5 flex items-center gap-1.5 text-xs text-fg-muted">
              <Globe2 class="h-3.5 w-3.5 shrink-0" />
              <span class="truncate">{{ info.countries.join(', ') }}</span>
            </div>
            <div v-if="info.websites.length" class="mt-1 flex items-center gap-1.5 text-xs text-fg-muted">
              <LinkIcon class="h-3.5 w-3.5 shrink-0" />
              <span class="truncate">{{ info.websites.join(', ') }}</span>
            </div>
            <p v-if="info.info" class="mt-1.5 text-xs text-fg-muted line-clamp-2">{{ info.info }}</p>
          </div>
          <div class="flex shrink-0 items-center gap-1">
            <button
              type="button"
              class="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-lg text-fg-muted hover:bg-surface hover:text-fg transition-colors"
              title="Edit info entry"
              @click="openEditInfo(info)"
            >
              <Pencil class="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              class="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-lg text-fg-muted hover:bg-danger-soft hover:text-danger transition-colors"
              title="Delete info entry"
              @click="openDeleteInfo(info)"
            >
              <Trash2 class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <BaseButton variant="secondary" @click="handleClose">Close</BaseButton>
    </template>
  </Modal>

  <AddEditMlsInfoModal
    v-if="directory"
    v-model="isAddEditInfoOpen"
    :mls-directory-id="directory.id"
    :info-to-edit="infoToEdit"
    @save="handleSaveInfo"
  />

  <DeleteMlsInfoModal
    v-model="isDeleteInfoOpen"
    :info="infoToDelete"
    @confirm-delete="handleDeleteInfo"
  />
</template>
