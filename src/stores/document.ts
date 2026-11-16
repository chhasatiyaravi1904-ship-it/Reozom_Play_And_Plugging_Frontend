import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as documentService from '@/services/documentService'
import { isNetworkError } from '@/services/api'
import { sampleDocuments } from '@/services/sampleData'
import type { DocumentRequirement } from '@/types/document'

export const useDocumentStore = defineStore('document', () => {
  const documents = ref<DocumentRequirement[]>([])
  const status = ref<'idle' | 'loading' | 'error'>('idle')
  const error = ref<string | null>(null)

  async function fetchDocuments(listingId: number) {
    status.value = 'loading'
    error.value = null
    try {
      const { data } = await documentService.fetchDocuments(listingId)
      documents.value = data
    } catch (err) {
      if (import.meta.env.DEV && isNetworkError(err)) {
        documents.value = sampleDocuments.map((doc) => ({ ...doc }))
      } else {
        status.value = 'error'
        error.value = 'Unable to load your documents. Please try again.'
      }
    } finally {
      if (status.value !== 'error') status.value = 'idle'
    }
  }

  async function upload(listingId: number, documentId: string, file: File, customName?: string) {
    const doc = documents.value.find((d) => d.id === documentId)
    try {
      await documentService.uploadDocument(listingId, documentId, file, customName)
      await fetchDocuments(listingId)
      return true
    } catch (err) {
      if (import.meta.env.DEV && isNetworkError(err) && doc) {
        doc.status = 'uploaded'
        doc.fileName = customName || file.name
        doc.uploadedAt = new Date().toISOString()
        return true
      }
      if (doc) doc.status = 'failed'
      return false
    }
  }

  // Signing happens only through EunoDoc (see services/eunoService.ts).

  async function remove(listingId: number, documentId: string) {
    const doc = documents.value.find((d) => d.id === documentId || d.documentId === documentId)
    try {
      await documentService.deleteDocument(listingId, documentId)
    } catch (err) {
      if (!(import.meta.env.DEV && isNetworkError(err))) return false
    }
    if (doc) {
      doc.status = 'pending'
      doc.fileName = undefined
      doc.uploadedAt = undefined
    }
    return true
  }

  async function view(listingId: number, documentId: string) {
    const doc = documents.value.find((d) => d.id === documentId || d.documentId === documentId)

    // Synchronously open a new blank tab to prevent browser pop-up blocker
    const newTab = window.open('about:blank', '_blank')
    if (newTab) {
      newTab.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${doc?.label || 'Document'} - Loading PDF</title>
            <style>
              body { margin:0; display:flex; align-items:center; justify-content:center; height:100vh; font-family:system-ui,-apple-system,sans-serif; background:#0f172a; color:#f8fafc; }
              .card { text-align:center; padding:2rem; }
              .spinner { width:36px; height:36px; border:3px solid rgba(255,255,255,0.15); border-top-color:#38bdf8; border-radius:50%; animation:spin 0.7s linear infinite; margin:0 auto 1rem; }
              @keyframes spin { to { transform:rotate(360deg); } }
              h2 { font-size:1.1rem; font-weight:600; margin:0 0 0.4rem; }
              p { font-size:0.85rem; color:#94a3b8; margin:0; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="spinner"></div>
              <h2>Opening ${doc?.label || 'Document'}...</h2>
              <p>Please wait while your PDF loads.</p>
            </div>
          </body>
        </html>
      `)
    }

    try {
      const viewUrl = documentService.getDocumentViewUrl(listingId, documentId)
      if (newTab && !newTab.closed) {
        newTab.location.href = viewUrl
        return true
      }

      // Fallback: fetch blob
      const response = await documentService.downloadDocument(listingId, documentId, true)
      const blob = new Blob([response.data], {
        type: response.headers?.['content-type'] || 'application/pdf',
      })
      const url = window.URL.createObjectURL(blob)
      if (newTab && !newTab.closed) {
        newTab.location.href = url
      } else {
        window.open(url, '_blank')
      }
      return true
    } catch (err) {
      if (newTab && !newTab.closed) {
        newTab.close()
      }
      return false
    }
  }

  async function download(listingId: number, documentId: string) {
    const doc = documents.value.find((d) => d.id === documentId || d.documentId === documentId)
    try {
      const response = await documentService.downloadDocument(listingId, documentId)

      let filename = doc?.fileName || `${doc?.label || 'document'}.pdf`
      const disposition = response.headers?.['content-disposition']
      if (disposition) {
        const match = disposition.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\r\n"']*)['"]?/i)
        if (match && match[1]) {
          filename = decodeURIComponent(match[1].trim())
        }
      }
      if (!filename.includes('.')) {
        filename += '.pdf'
      }

      // Create a blob URL and trigger download
      const blob = new Blob([response.data], {
        type: response.headers?.['content-type'] || 'application/pdf',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      return true
    } catch (err) {
      return false
    }
  }

  return { documents, status, error, fetchDocuments, upload, remove, download, view }
})
