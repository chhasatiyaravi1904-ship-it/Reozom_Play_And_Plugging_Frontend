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

  async function upload(listingId: number, documentId: string, file: File) {
    const doc = documents.value.find((d) => d.id === documentId)
    try {
      await documentService.uploadDocument(listingId, documentId, file)
      if (doc) {
        doc.status = 'uploaded'
        doc.fileName = file.name
        doc.uploadedAt = new Date().toISOString()
      }
      return true
    } catch (err) {
      if (import.meta.env.DEV && isNetworkError(err) && doc) {
        doc.status = 'uploaded'
        doc.fileName = file.name
        doc.uploadedAt = new Date().toISOString()
        return true
      }
      if (doc) doc.status = 'failed'
      return false
    }
  }

  async function remove(listingId: number, documentId: string) {
    const doc = documents.value.find((d) => d.id === documentId)
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

  return { documents, status, error, fetchDocuments, upload, remove }
})
