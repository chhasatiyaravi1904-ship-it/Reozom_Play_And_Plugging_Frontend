import { ref } from 'vue'

export type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export function useAutoSave(save: () => Promise<boolean>, debounceMs = 800) {
  const state = ref<SaveState>('idle')
  let timer: ReturnType<typeof setTimeout> | undefined

  function schedule() {
    state.value = 'idle'
    if (timer) clearTimeout(timer)
    timer = setTimeout(runSave, debounceMs)
  }

  async function runSave() {
    state.value = 'saving'
    const success = await save()
    state.value = success ? 'saved' : 'error'
  }

  function flush() {
    if (timer) clearTimeout(timer)
    return runSave()
  }

  return { state, schedule, flush }
}
