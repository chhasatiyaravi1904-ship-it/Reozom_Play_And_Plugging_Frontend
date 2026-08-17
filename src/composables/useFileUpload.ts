import { ref } from 'vue'
import * as documentService from '@/services/documentService'

const MAX_FILE_SIZE_MB = 25
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

export function useFileUpload(listingId: number) {
  const progress = ref(0)
  const isUploading = ref(false)
  const error = ref<string | null>(null)

  function validate(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Unsupported file type. Please upload a PDF, JPG, or PNG.'
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`
    }
    return null
  }

  async function upload(documentId: string, file: File) {
    const validationError = validate(file)
    if (validationError) {
      error.value = validationError
      return false
    }

    error.value = null
    isUploading.value = true
    progress.value = 0

    try {
      await documentService.uploadDocument(listingId, documentId, file, (percent) => {
        progress.value = percent
      })
      return true
    } catch {
      error.value = 'Upload failed. Please try again.'
      return false
    } finally {
      isUploading.value = false
    }
  }

  return { progress, isUploading, error, upload }
}
