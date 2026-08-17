import { ref } from 'vue'
import { defineStore } from 'pinia'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: number
  variant: ToastVariant
  text: string
}

let nextId = 1

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<ToastMessage[]>([])

  function push(text: string, variant: ToastVariant = 'info', durationMs = 4000) {
    const id = nextId++
    toasts.value.push({ id, text, variant })
    window.setTimeout(() => dismiss(id), durationMs)
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  const success = (text: string) => push(text, 'success')
  const error = (text: string) => push(text, 'error')
  const info = (text: string) => push(text, 'info')

  return { toasts, push, dismiss, success, error, info }
})
