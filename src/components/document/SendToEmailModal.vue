<script setup lang="ts">
import { ref, watch } from 'vue'
import { Mail, Plus, Trash2, X, Send } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useToastStore } from '@/stores/toast'
import * as documentService from '@/services/documentService'

const props = defineProps<{
  modelValue: boolean
  listingId: number
  documentId: string | number
  documentName: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'sent', emails: string[]): void
}>()

const toast = useToastStore()
const emails = ref<string[]>([''])
const note = ref('')
const isSending = ref(false)

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      emails.value = ['']
      note.value = ''
      isSending.value = false
    }
  },
)

function handleAddEmail() {
  emails.value.push('')
}

function handleRemoveEmail(index: number) {
  if (emails.value.length > 1) {
    emails.value.splice(index, 1)
  }
}

function handleClose() {
  emit('update:modelValue', false)
}

async function handleSend() {
  const validEmails = emails.value.map((e) => e.trim()).filter((e) => e.length > 0)
  if (validEmails.length === 0) {
    toast.error('Please enter at least one recipient email address.')
    return
  }

  // Simple email pattern validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  for (const email of validEmails) {
    if (!emailRegex.test(email)) {
      toast.error(`"${email}" is not a valid email address.`)
      return
    }
  }

  isSending.value = true
  try {
    await documentService.sendDocumentEmail(
      props.listingId,
      String(props.documentId),
      validEmails,
      note.value,
    )
    toast.success(`Document: ${props.documentName} has been sent to: ${validEmails.join(', ')}`)
    emit('sent', validEmails)
    handleClose()
  } catch (err: any) {
    toast.error(err?.response?.data?.message || 'Failed to send document email.')
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
  >
    <div
      class="relative flex flex-col w-full max-w-lg rounded-2xl bg-bg border border-border shadow-2xl overflow-hidden"
    >
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-border bg-bg-muted/40 px-5 py-4">
        <div class="flex items-center gap-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-success text-white">
            <Mail class="h-4 w-4" />
          </div>
          <h3 class="text-sm font-bold text-fg">Send document to email</h3>
        </div>

        <div class="flex items-center gap-2">
          <BaseButton
            size="sm"
            variant="secondary"
            class="text-xs"
            @click="handleAddEmail"
          >
            <Plus class="mr-1 h-3.5 w-3.5" />
            Add Email
          </BaseButton>

          <button
            class="rounded-lg p-1.5 text-fg-muted hover:bg-bg-muted hover:text-fg transition-colors"
            @click="handleClose"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="p-5 space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-fg mb-1">Document:</label>
          <div class="rounded-lg border border-border bg-bg-muted/30 px-3 py-2 text-fg font-medium">
            {{ documentName }}
          </div>
        </div>

        <div class="space-y-2">
          <label class="block font-semibold text-fg">Recipient Email Address(es) *</label>
          <div
            v-for="(_, index) in emails"
            :key="index"
            class="flex items-center gap-2"
          >
            <input
              v-model="emails[index]"
              type="email"
              placeholder="e.g. buyer@example.com"
              class="w-full rounded-lg border border-border bg-bg px-3 py-2 text-xs text-fg focus:border-primary focus:outline-none"
            />
            <button
              v-if="emails.length > 1"
              type="button"
              class="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
              title="Remove this email"
              @click="handleRemoveEmail(index)"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>

        <div>
          <label class="block font-semibold text-fg mb-1">Optional Note / Message:</label>
          <textarea
            v-model="note"
            rows="3"
            placeholder="Add any instructions or note for the recipient..."
            class="w-full rounded-lg border border-border bg-bg px-3 py-2 text-xs text-fg focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-2 border-t border-border bg-bg-muted/20 px-5 py-3.5">
        <BaseButton variant="secondary" size="sm" @click="handleClose">
          Cancel
        </BaseButton>
        <BaseButton
          variant="primary"
          size="sm"
          :loading="isSending"
          @click="handleSend"
        >
          <Send class="mr-1.5 h-3.5 w-3.5" />
          Send Email
        </BaseButton>
      </div>
    </div>
  </div>
</template>

