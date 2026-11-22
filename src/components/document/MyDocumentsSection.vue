<script setup lang="ts">
/**
 * My Documents: the user's own library (original Reozom "Manage Documents" / AllDocument).
 * Files uploaded outside a listing, plus signed documents shared with the user (e.g. an addendum).
 */
import { onMounted, ref } from 'vue'
import { IconEye, IconDownload, IconEdit, IconTrash, IconMail, IconUpload } from '@tabler/icons-vue'
import Modal from '@/components/ui/Modal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import * as documentService from '@/services/documentService'
import type { UserDocument } from '@/services/documentService'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()

const documents = ref<UserDocument[]>([])
const isLoading = ref(true)
const loadError = ref('')

const fileInput = ref<HTMLInputElement | null>(null)
const uploadName = ref('')
const isUploading = ref(false)

const renameTarget = ref<UserDocument | null>(null)
const renameValue = ref('')
const isRenameOpen = ref(false)

const emailTarget = ref<UserDocument | null>(null)
const emailValue = ref('')
const emailNote = ref('')
const isEmailOpen = ref(false)
const isBusy = ref(false)

async function load() {
  isLoading.value = true
  loadError.value = ''
  try {
    documents.value = await documentService.fetchMyDocuments()
  } catch {
    loadError.value = 'Could not load your documents.'
  } finally {
    isLoading.value = false
  }
}

onMounted(load)

function errorMessage(err: any, fallback: string): string {
  const errors = err?.response?.data?.errors
  return (errors && (Object.values(errors)[0] as string[])?.[0]) || err?.response?.data?.message || fallback
}

async function handleUpload() {
  const file = fileInput.value?.files?.[0]
  if (!file) return
  isUploading.value = true
  try {
    const doc = await documentService.uploadMyDocument(file, uploadName.value.trim() || undefined)
    documents.value = [doc, ...documents.value]
    uploadName.value = ''
    if (fileInput.value) fileInput.value.value = ''
    toast.success('Document uploaded.')
  } catch (err: any) {
    toast.error(errorMessage(err, 'Upload failed.'))
  } finally {
    isUploading.value = false
  }
}

async function openFile(doc: UserDocument, inline: boolean) {
  try {
    const res = await documentService.downloadMyDocument(doc.id, inline)
    const url = window.URL.createObjectURL(new Blob([res.data], { type: doc.mime_type }))
    if (inline) {
      window.open(url, '_blank')
    } else {
      const link = document.createElement('a')
      link.href = url
      link.download = doc.original_name
      link.click()
    }
    setTimeout(() => window.URL.revokeObjectURL(url), 60_000)
  } catch {
    toast.error('Could not open the document.')
  }
}

function startRename(doc: UserDocument) {
  renameTarget.value = doc
  renameValue.value = doc.name
  isRenameOpen.value = true
}

async function saveRename() {
  if (!renameTarget.value || !renameValue.value.trim()) return
  isBusy.value = true
  try {
    await documentService.renameMyDocument(renameTarget.value.id, renameValue.value.trim())
    renameTarget.value.name = renameValue.value.trim()
    isRenameOpen.value = false
    toast.success('Document renamed.')
  } catch (err: any) {
    toast.error(errorMessage(err, 'Rename failed.'))
  } finally {
    isBusy.value = false
  }
}

async function remove(doc: UserDocument) {
  if (!confirm(`Delete "${doc.name}"? This cannot be undone.`)) return
  try {
    await documentService.deleteMyDocument(doc.id)
    documents.value = documents.value.filter((d) => d.id !== doc.id)
    toast.success('Document deleted.')
  } catch (err: any) {
    toast.error(errorMessage(err, 'Delete failed.'))
  }
}

function startEmail(doc: UserDocument) {
  emailTarget.value = doc
  emailValue.value = ''
  emailNote.value = ''
  isEmailOpen.value = true
}

async function sendEmail() {
  if (!emailTarget.value) return
  const emails = emailValue.value.split(/[\s,;]+/).map((e) => e.trim()).filter(Boolean)
  if (!emails.length) return
  isBusy.value = true
  try {
    await documentService.sendMyDocumentToEmail(emailTarget.value.id, emails, emailNote.value.trim() || undefined)
    isEmailOpen.value = false
    toast.success(`Sent to ${emails.join(', ')}`)
  } catch (err: any) {
    toast.error(errorMessage(err, 'The email could not be sent.'))
  } finally {
    isBusy.value = false
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<template>
  <section class="rounded-2xl border border-border bg-surface p-5 shadow-xs">
    <div class="flex flex-col gap-1 border-b border-border pb-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 class="text-base font-semibold text-fg">My Documents</h2>
        <p class="text-xs text-fg-muted">Your own files, not tied to a listing, and signed documents shared with you.</p>
      </div>
    </div>

    <form class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end" @submit.prevent="handleUpload">
      <label class="flex-1 text-xs font-medium text-fg">
        Name (optional)
        <input v-model="uploadName" type="text" maxlength="255" class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" placeholder="e.g. Pre-approval letter" />
      </label>
      <label class="flex-1 text-xs font-medium text-fg">
        File (PDF, image or Word, up to 10 MB)
        <input ref="fileInput" type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" class="mt-1 block w-full text-sm" />
      </label>
      <BaseButton type="submit" :loading="isUploading">
        <IconUpload class="mr-1.5 h-4 w-4" /> Upload
      </BaseButton>
    </form>

    <p v-if="isLoading" class="mt-4 text-sm text-fg-muted">Loading your documents…</p>
    <p v-else-if="loadError" class="mt-4 text-sm text-danger" role="alert">{{ loadError }}</p>
    <p v-else-if="!documents.length" class="mt-4 text-sm text-fg-muted">No documents yet.</p>
    <ul v-else class="mt-4 divide-y divide-border">
      <li v-for="doc in documents" :key="doc.id" class="flex flex-wrap items-center justify-between gap-3 py-3">
        <div class="min-w-0">
          <p class="truncate text-sm font-medium text-fg">{{ doc.name }}</p>
          <p class="text-xs text-fg-muted">
            <span v-if="doc.source === 'addendum'" class="font-semibold">Signed addendum · </span>
            <span v-if="doc.listing_address">{{ doc.listing_address }} · </span>
            {{ formatSize(doc.size) }} · {{ doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '' }}
          </p>
        </div>
        <div class="flex shrink-0 gap-1">
          <button type="button" class="rounded-lg p-2 hover:bg-surface-raised" title="View" aria-label="View" @click="openFile(doc, true)"><IconEye class="h-4 w-4" /></button>
          <button type="button" class="rounded-lg p-2 hover:bg-surface-raised" title="Download" aria-label="Download" @click="openFile(doc, false)"><IconDownload class="h-4 w-4" /></button>
          <button type="button" class="rounded-lg p-2 hover:bg-surface-raised" title="Send to email" aria-label="Send to email" @click="startEmail(doc)"><IconMail class="h-4 w-4" /></button>
          <button type="button" class="rounded-lg p-2 hover:bg-surface-raised" title="Rename" aria-label="Rename" @click="startRename(doc)"><IconEdit class="h-4 w-4" /></button>
          <button type="button" class="rounded-lg p-2 text-danger hover:bg-surface-raised" title="Delete" aria-label="Delete" @click="remove(doc)"><IconTrash class="h-4 w-4" /></button>
        </div>
      </li>
    </ul>

    <Modal v-model="isRenameOpen" title="Rename document">
      <form class="space-y-3" @submit.prevent="saveRename">
        <input v-model="renameValue" type="text" maxlength="255" required class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" aria-label="Document name" />
        <div class="flex justify-end gap-2">
          <BaseButton type="button" variant="secondary" @click="isRenameOpen = false">Cancel</BaseButton>
          <BaseButton type="submit" :loading="isBusy">Save</BaseButton>
        </div>
      </form>
    </Modal>

    <Modal v-model="isEmailOpen" title="Send document to email">
      <form class="space-y-3" @submit.prevent="sendEmail">
        <label class="block text-xs font-medium text-fg">
          Email addresses (separate with commas)
          <input v-model="emailValue" type="text" required class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm" placeholder="lender@example.com" />
        </label>
        <label class="block text-xs font-medium text-fg">
          Note (optional)
          <textarea v-model="emailNote" rows="3" maxlength="1000" class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"></textarea>
        </label>
        <div class="flex justify-end gap-2">
          <BaseButton type="button" variant="secondary" @click="isEmailOpen = false">Cancel</BaseButton>
          <BaseButton type="submit" :loading="isBusy">Send</BaseButton>
        </div>
      </form>
    </Modal>
  </section>
</template>
