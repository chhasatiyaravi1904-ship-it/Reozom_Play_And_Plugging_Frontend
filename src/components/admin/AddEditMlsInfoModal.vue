<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Info, Plus, X } from 'lucide-vue-next'
import Modal from '@/components/ui/Modal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import type { MlsInfoItem, CreateMlsInfoPayload } from '@/types/mls'

const props = defineProps<{
  modelValue: boolean
  mlsDirectoryId: number
  infoToEdit?: MlsInfoItem | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'save', payload: CreateMlsInfoPayload): void
}>()

const isEditMode = computed(() => !!props.infoToEdit)

const form = ref({
  title: '',
  countries: [] as string[],
  publicWebsitesTitle: '',
  websites: [] as string[],
  info: '',
})

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      form.value = {
        title: props.infoToEdit?.title || '',
        countries: props.infoToEdit?.countries ? [...props.infoToEdit.countries] : [],
        publicWebsitesTitle: props.infoToEdit?.publicWebsitesTitle || '',
        websites: props.infoToEdit?.websites ? [...props.infoToEdit.websites] : [],
        info: props.infoToEdit?.info || '',
      }
    }
  },
  { immediate: true },
)

function addListItem(list: string[]) {
  list.push('')
}

function removeListItem(list: string[], index: number) {
  list.splice(index, 1)
}

function handleClose() {
  emit('update:modelValue', false)
}

function handleSubmit() {
  emit('save', {
    mlsDirectoryId: props.mlsDirectoryId,
    title: form.value.title.trim() || undefined,
    countries: form.value.countries.map((c) => c.trim()).filter(Boolean),
    publicWebsitesTitle: form.value.publicWebsitesTitle.trim() || undefined,
    websites: form.value.websites.map((w) => w.trim()).filter(Boolean),
    info: form.value.info.trim() || undefined,
  })
  handleClose()
}
</script>

<template>
  <Modal :model-value="modelValue" size="lg" @update:model-value="emit('update:modelValue', $event)">
    <div class="flex items-center gap-3 border-b border-border pb-4 -mt-2">
      <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary ring-1 ring-primary/20">
        <Info class="h-5 w-5" />
      </div>
      <div>
        <h2 class="text-lg font-semibold text-fg">{{ isEditMode ? 'Edit Info Entry' : 'Add Info Entry' }}</h2>
        <p class="text-xs text-fg-muted">
          {{ isEditMode ? 'Update this info entry.' : 'Add a new info entry to this MLS directory.' }}
        </p>
      </div>
    </div>

    <form class="mt-5 space-y-4 max-h-[65vh] overflow-y-auto pr-1" @submit.prevent="handleSubmit">
      <div>
        <label class="block text-xs font-semibold text-fg mb-1.5">Title</label>
        <input
          v-model="form.title"
          type="text"
          placeholder="e.g. North America Coverage"
          class="focus-ring w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-fg shadow-xs placeholder:text-fg-disabled transition-colors"
        />
      </div>

      <!-- Countries -->
      <div>
        <label class="block text-xs font-semibold text-fg mb-1.5">Countries</label>
        <div class="space-y-2">
          <div v-for="(_, idx) in form.countries" :key="idx" class="flex items-center gap-2">
            <input
              v-model="form.countries[idx]"
              type="text"
              placeholder="e.g. United States"
              class="focus-ring w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-fg shadow-xs placeholder:text-fg-disabled transition-colors"
            />
            <button
              type="button"
              class="focus-ring inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-fg-muted hover:bg-danger-soft hover:text-danger transition-colors"
              aria-label="Remove country"
              @click="removeListItem(form.countries, idx)"
            >
              <X class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <button
          type="button"
          class="focus-ring mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-primary hover:bg-primary-soft transition-colors"
          @click="addListItem(form.countries)"
        >
          <Plus class="h-3.5 w-3.5" />
          <span>Add Country</span>
        </button>
      </div>

      <div>
        <label class="block text-xs font-semibold text-fg mb-1.5">Public Websites Title</label>
        <input
          v-model="form.publicWebsitesTitle"
          type="text"
          placeholder="e.g. Official Sites"
          class="focus-ring w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-fg shadow-xs placeholder:text-fg-disabled transition-colors"
        />
      </div>

      <!-- Websites -->
      <div>
        <label class="block text-xs font-semibold text-fg mb-1.5">Websites</label>
        <div class="space-y-2">
          <div v-for="(_, idx) in form.websites" :key="idx" class="flex items-center gap-2">
            <input
              v-model="form.websites[idx]"
              type="text"
              placeholder="https://example.com"
              class="focus-ring w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-fg shadow-xs placeholder:text-fg-disabled transition-colors"
            />
            <button
              type="button"
              class="focus-ring inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-fg-muted hover:bg-danger-soft hover:text-danger transition-colors"
              aria-label="Remove website"
              @click="removeListItem(form.websites, idx)"
            >
              <X class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <button
          type="button"
          class="focus-ring mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-primary hover:bg-primary-soft transition-colors"
          @click="addListItem(form.websites)"
        >
          <Plus class="h-3.5 w-3.5" />
          <span>Add Website</span>
        </button>
      </div>

      <div>
        <label class="block text-xs font-semibold text-fg mb-1.5">Info</label>
        <textarea
          v-model="form.info"
          rows="4"
          placeholder="Additional notes about this MLS coverage..."
          class="focus-ring w-full resize-y rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-fg shadow-xs placeholder:text-fg-disabled transition-colors"
        ></textarea>
      </div>

      <div class="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
        <BaseButton variant="secondary" type="button" @click="handleClose">Cancel</BaseButton>
        <BaseButton variant="primary" type="submit">{{ isEditMode ? 'Save Changes' : 'Add Entry' }}</BaseButton>
      </div>
    </form>
  </Modal>
</template>
