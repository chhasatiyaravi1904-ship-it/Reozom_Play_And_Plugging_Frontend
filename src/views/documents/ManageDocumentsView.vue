<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { IconSearch, IconEye, IconDownload, IconEdit, IconTrash, IconMail, IconRefresh } from '@tabler/icons-vue'
import RenameDocumentModal from '@/components/document/RenameDocumentModal.vue'
import SendToEmailModal from '@/components/document/SendToEmailModal.vue'
import * as documentService from '@/services/documentService'
import type { ManagedDocument } from '@/services/documentService'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

/**
 * Manage Documents (original Reozom "Manage Documents" page): every document the user can access,
 * across all listings. Admin: all listings; agent: listings under their packages or processes;
 * seller: their own listings.
 */
const authStore = useAuthStore()
const toast = useToastStore()
const route = useRoute()

const role = computed(() => String(authStore.user?.role ?? ''))
const isStaff = computed(() => role.value === 'admin' || role.value === 'agent')

const documents = ref<ManagedDocument[]>([])
const meta = ref({ currentPage: 1, lastPage: 1, perPage: 20, total: 0 })
const isLoading = ref(false)
const error = ref('')

const filters = ref({ search: '', kind: '', status: '', state: '' })
const page = ref(1)

const renameTarget = ref<ManagedDocument | null>(null)
const emailTarget = ref<ManagedDocument | null>(null)
const isRenameOpen = ref(false)
const isEmailOpen = ref(false)

async function load() {
  isLoading.value = true
  error.value = ''
  try {
    const params = Object.fromEntries(Object.entries({ ...filters.value, page: page.value }).filter(([, v]) => v !== ''))
    const res = await documentService.fetchManagedDocuments(params)
    documents.value = res.data.items
    meta.value = res.data.meta
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Failed to load documents.'
  } finally {
    isLoading.value = false
  }
}

let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(() => filters.value.search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { page.value = 1; load() }, 350)
})
watch(() => [filters.value.kind, filters.value.status, filters.value.state], () => { page.value = 1; load() })
watch(page, load)

onMounted(load)

// Links to the listing's own Documents page for signing and uploads
function listingDocumentsLink(doc: ManagedDocument) {
  const base = route.path.startsWith('/admin') ? '/admin' : route.path.startsWith('/agent') ? '/agent' : ''
  return base === '/admin' ? `/admin/listings/${doc.listingId}?tab=documents` : `${base}/listings/${doc.listingId}/documents`
}

async function openBlob(doc: ManagedDocument, download: boolean) {
  try {
    const res = download
      ? await documentService.downloadDocument(doc.listingId, String(doc.id))
      : await documentService.viewDocument(doc.listingId, String(doc.id))
    const url = URL.createObjectURL(res.data as Blob)
    if (download) {
      const a = document.createElement('a')
      a.href = url
      a.download = doc.fileName
      a.click()
    } else {
      window.open(url, '_blank')
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } catch {
    toast.error('Could not open the document.')
  }
}

async function handleDelete(doc: ManagedDocument) {
  if (!confirm(`Delete "${doc.name}"? This cannot be undone.`)) return
  try {
    await documentService.deleteDocument(doc.listingId, String(doc.id))
    toast.success('Document deleted.')
    load()
  } catch (e: any) {
    toast.error(e?.response?.data?.message || 'Failed to delete the document.')
  }
}

async function handleRegenerate(doc: ManagedDocument) {
  try {
    await documentService.regenerateDocument(doc.listingId, doc.id)
    toast.success('Document updated from the current listing answers.')
    load()
  } catch (e: any) {
    toast.error(e?.response?.data?.message || 'Failed to regenerate the document.')
  }
}

function openRename(doc: ManagedDocument) {
  renameTarget.value = doc
  isRenameOpen.value = true
}

function openEmail(doc: ManagedDocument) {
  emailTarget.value = doc
  isEmailOpen.value = true
}

const STATUS_STYLES: Record<string, string> = {
  signed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  unsigned: 'bg-amber-50 text-amber-700 border-amber-200',
  pending_review: 'bg-amber-50 text-amber-700 border-amber-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  uploaded: 'bg-blue-50 text-blue-700 border-blue-200',
}

function statusLabel(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString() : '—'
}
</script>

<template>
  <div class="h-full bg-neutral-50 p-4 md:p-6 overflow-y-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-neutral-900 tracking-tight">Manage Documents</h1>
      <p class="text-sm text-neutral-500 mt-1">
        All documents for {{ isStaff ? (role === 'admin' ? 'every listing' : 'your clients\' listings') : 'your listings' }}.
        Signing and uploads happen on each listing's Documents page.
      </p>
    </div>

    <!-- Filters -->
    <div class="flex flex-col gap-3 md:flex-row md:items-center mb-4">
      <div class="relative flex-1 max-w-md">
        <IconSearch :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          v-model="filters.search"
          type="text"
          placeholder="Search by document, address or reference..."
          class="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1641d9]/20"
        />
      </div>
      <select v-model="filters.kind" class="px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white">
        <option value="">All documents</option>
        <option value="generated">Generated</option>
        <option value="uploaded">Uploaded</option>
      </select>
      <select v-model="filters.status" class="px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white">
        <option value="">Any status</option>
        <option value="unsigned">Unsigned</option>
        <option value="signed">Signed</option>
        <option value="uploaded">Uploaded</option>
        <option value="pending_review">Pending review</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      <select v-if="isStaff" v-model="filters.state" class="px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white">
        <option value="">All states</option>
        <option value="FL">Florida</option>
        <option value="MI">Michigan</option>
      </select>
    </div>

    <div v-if="error" class="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">{{ error }}</div>

    <div class="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-x-auto">
      <table class="w-full text-left min-w-[760px]">
        <thead class="bg-neutral-50/50 border-b border-neutral-200">
          <tr class="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            <th class="px-4 py-3">Document</th>
            <th class="px-4 py-3">Listing</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3">Updated</th>
            <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-100 text-sm">
          <tr v-if="isLoading && documents.length === 0">
            <td colspan="5" class="px-4 py-8 text-center text-neutral-500">Loading documents...</td>
          </tr>
          <tr v-else-if="documents.length === 0">
            <td colspan="5" class="px-4 py-8 text-center text-neutral-500">No documents found.</td>
          </tr>
          <tr v-for="doc in documents" :key="doc.id" class="hover:bg-neutral-50/50">
            <td class="px-4 py-3">
              <div class="font-medium text-neutral-900">{{ doc.name }}</div>
              <span
                class="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                :class="doc.kind === 'generated' ? 'bg-violet-50 text-violet-700' : 'bg-neutral-100 text-neutral-600'"
              >{{ doc.kind === 'generated' ? 'Generated' : 'Uploaded' }}</span>
            </td>
            <td class="px-4 py-3">
              <router-link :to="listingDocumentsLink(doc)" class="font-medium text-[#1641d9] hover:underline">
                {{ doc.listingReference || `Listing #${doc.listingId}` }}
              </router-link>
              <div class="text-xs text-neutral-500">{{ doc.listingAddress }}</div>
              <div v-if="isStaff && doc.sellerName" class="text-xs text-neutral-400">Seller: {{ doc.sellerName }}</div>
            </td>
            <td class="px-4 py-3">
              <span class="px-2 py-0.5 rounded border text-xs font-medium" :class="STATUS_STYLES[doc.status] || 'bg-neutral-100 text-neutral-600 border-neutral-200'">
                {{ statusLabel(doc.status) }}
              </span>
              <div v-if="doc.signedAt" class="text-[11px] text-neutral-400 mt-1">Signed {{ formatDate(doc.signedAt) }}</div>
            </td>
            <td class="px-4 py-3 text-neutral-500">{{ formatDate(doc.updatedAt) }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-1">
                <button class="p-2 text-neutral-400 hover:text-green-600 hover:bg-green-50 rounded" title="View" @click="openBlob(doc, false)">
                  <IconEye :size="17" />
                </button>
                <button class="p-2 text-neutral-400 hover:text-[#1641d9] hover:bg-blue-50 rounded" title="Download" @click="openBlob(doc, true)">
                  <IconDownload :size="17" />
                </button>
                <button class="p-2 text-neutral-400 hover:text-[#1641d9] hover:bg-blue-50 rounded" title="Send by email" @click="openEmail(doc)">
                  <IconMail :size="17" />
                </button>
                <button
                  v-if="doc.kind === 'generated'"
                  class="p-2 text-neutral-400 hover:text-violet-600 hover:bg-violet-50 rounded"
                  title="Regenerate from the current listing answers"
                  @click="handleRegenerate(doc)"
                >
                  <IconRefresh :size="17" />
                </button>
                <template v-if="doc.canManage">
                  <button class="p-2 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded" title="Rename" @click="openRename(doc)">
                    <IconEdit :size="17" />
                  </button>
                  <button class="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete" @click="handleDelete(doc)">
                    <IconTrash :size="17" />
                  </button>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="meta.lastPage > 1" class="flex items-center justify-between mt-4 text-sm text-neutral-600">
      <span>{{ meta.total }} documents</span>
      <div class="flex items-center gap-2">
        <button class="px-3 py-1.5 border rounded-lg bg-white disabled:opacity-50" :disabled="page <= 1" @click="page--">Previous</button>
        <span>Page {{ meta.currentPage }} of {{ meta.lastPage }}</span>
        <button class="px-3 py-1.5 border rounded-lg bg-white disabled:opacity-50" :disabled="page >= meta.lastPage" @click="page++">Next</button>
      </div>
    </div>

    <RenameDocumentModal
      v-if="renameTarget"
      v-model="isRenameOpen"
      :listing-id="renameTarget.listingId"
      :document-id="renameTarget.id"
      :current-name="renameTarget.fileName"
      @renamed="load"
    />
    <SendToEmailModal
      v-if="emailTarget"
      v-model="isEmailOpen"
      :listing-id="emailTarget.listingId"
      :document-id="emailTarget.id"
      :document-name="emailTarget.fileName"
    />
  </div>
</template>
