<script setup lang="ts">
import { ref, watch } from 'vue'
import { AlertTriangle, ExternalLink, RefreshCw, X, ShieldCheck } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps<{
  modelValue: boolean
  signingUrl: string
  title?: string
  isSyncing?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
  (e: 'sync'): void
}>()

const iframeLoaded = ref(false)

watch(
  () => [props.modelValue, props.signingUrl],
  ([open]) => {
    if (open) {
      iframeLoaded.value = false
    }
  },
)

function handleClose() {
  emit('update:modelValue', false)
  emit('close')
}

function handleOpenNewTab() {
  if (props.signingUrl) {
    window.open(props.signingUrl, '_blank')
  }
}
</script>

<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200"
  >
    <div
      class="relative flex flex-col w-full max-w-6xl max-h-[96vh] rounded-2xl bg-bg border border-border shadow-2xl overflow-hidden"
    >
      <!-- Top Modal Header -->
      <div class="flex items-center justify-between border-b border-border bg-bg-muted/40 px-5 py-3.5">
        <div class="flex items-center gap-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <ShieldCheck class="h-5 w-5" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-fg">
              {{ title || 'Reozom Electronic Document Signature (EunoDoc™)' }}
            </h3>
            <p class="text-[11px] text-fg-muted">Official Legally Binding E-Sign Session</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <BaseButton
            size="sm"
            variant="secondary"
            title="Open signing in full browser tab"
            @click="handleOpenNewTab"
          >
            <ExternalLink class="mr-1.5 h-3.5 w-3.5" />
            Open in New Window
          </BaseButton>

          <BaseButton
            size="sm"
            variant="secondary"
            :loading="isSyncing"
            title="Sync latest signature status from EunoDoc"
            @click="emit('sync')"
          >
            <RefreshCw class="mr-1.5 h-3.5 w-3.5" :class="{ 'animate-spin': isSyncing }" />
            Sync Status
          </BaseButton>

          <button
            class="rounded-lg p-1.5 text-fg-muted hover:bg-bg-muted hover:text-fg transition-colors"
            title="Back to documents"
            @click="handleClose"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- Reozom Required Notice Bar (documentsView.blade.php) -->
      <div class="border-b border-warning/30 bg-amber-500/10 px-5 py-3 text-xs text-amber-900 dark:text-amber-200">
        <div class="flex items-start gap-2.5">
          <AlertTriangle class="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
          <div class="flex-1 space-y-1">
            <div class="font-semibold text-amber-800 dark:text-amber-300">
              Please sign all required fields below.
            </div>
            <ul class="list-disc pl-4 space-y-0.5 text-[11px] opacity-90">
              <li>After you e-sign document, please click <strong>"Back to documents"</strong> to view updated status.</li>
              <li>Documents may take up to 3 minutes to process after you have signed. You have to sign only once.</li>
            </ul>
          </div>
          <BaseButton
            size="sm"
            variant="primary"
            class="shrink-0 self-center"
            @click="handleClose"
          >
            Back to documents
          </BaseButton>
        </div>
      </div>

      <!-- EunoDoc Interactive Signing Frame -->
      <div class="relative flex-1 min-h-[600px] h-[78vh] bg-neutral-900 overflow-hidden">
        <div
          v-if="!iframeLoaded"
          class="absolute inset-0 flex flex-col items-center justify-center bg-bg/80 backdrop-blur-sm z-10 gap-3"
        >
          <div class="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p class="text-xs font-semibold text-fg">Loading secure document signing interface...</p>
        </div>

        <iframe
          v-if="signingUrl"
          :src="signingUrl"
          class="w-full h-full border-0"
          allow="camera; microphone; clipboard-read; clipboard-write"
          @load="iframeLoaded = true"
        />
        <div v-else class="flex h-full items-center justify-center text-sm text-fg-muted">
          No active signing URL available.
        </div>
      </div>
    </div>
  </div>
</template>

