<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { FileSignature } from 'lucide-vue-next'
import Modal from '@/components/ui/Modal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import EunoSignModal from '@/components/document/EunoSignModal.vue'
import * as eunoService from '@/services/eunoService'
import type { PendingSignature } from '@/services/eunoService'
import { SIGN_PROMPT_KEY } from '@/stores/auth'
import { isImpersonatingInThisTab } from '@/services/api'

/**
 * After login, tells the user which listing documents are waiting for their signature
 * and lets them sign each one in the EunoDoc pop-up. Shown once per login.
 */
const items = ref<PendingSignature[]>([])
const isListOpen = ref(false)
const active = ref<PendingSignature | null>(null)
const isSignOpen = ref(false)
const isSyncing = ref(false)

async function loadPending() {
  try {
    items.value = await eunoService.getPendingSignatures()
  } catch {
    items.value = []
  }
}

onMounted(async () => {
  let shouldPrompt = false
  try {
    shouldPrompt = sessionStorage.getItem(SIGN_PROMPT_KEY) === '1'
    // Consume the flag so a page refresh doesn't show the pop-up again
    sessionStorage.removeItem(SIGN_PROMPT_KEY)
  } catch {
    // Storage blocked: just don't prompt
  }
  // An admin "logged in as" this user must not be prompted to sign for them
  if (!shouldPrompt || isImpersonatingInThisTab()) return

  await loadPending()
  isListOpen.value = items.value.length > 0
})

function signNow(item: PendingSignature) {
  active.value = item
  isListOpen.value = false
  isSignOpen.value = true
}

/** Ask EunoDoc for the latest status (stores the signed copy once everyone signed). */
async function syncActive() {
  if (!active.value) return
  isSyncing.value = true
  try {
    await eunoService.getListingSigningStatus(active.value.listing_id)
  } catch {
    // Signers who can't view the listing just rely on the pending list below
  } finally {
    isSyncing.value = false
  }
}

async function handleSignClose() {
  isSignOpen.value = false
  await syncActive()
  active.value = null
  await loadPending()
  // Back to the list if anything else is still waiting
  isListOpen.value = items.value.length > 0
}
</script>

<template>
  <Modal v-model="isListOpen" title="Documents waiting for your signature" size="lg">
    <p class="text-sm text-fg-muted">
      You have {{ items.length }} {{ items.length === 1 ? 'document packet' : 'document packets' }} to sign.
    </p>

    <ul class="mt-4 divide-y divide-border rounded-lg border border-border">
      <li v-for="item in items" :key="item.agreement_id" class="flex items-center gap-3 px-4 py-3">
        <FileSignature class="h-5 w-5 shrink-0 text-primary" />
        <div class="min-w-0 flex-1">
          <div class="truncate text-sm font-semibold text-fg">{{ item.listing_address || `Listing #${item.listing_id}` }}</div>
          <div class="text-xs text-fg-muted">
            {{ item.document_name }}<span v-if="item.document_count"> · {{ item.document_count }} {{ item.document_count === 1 ? 'document' : 'documents' }}</span>
          </div>
        </div>
        <BaseButton size="sm" @click="signNow(item)">Sign now</BaseButton>
      </li>
    </ul>

    <template #footer>
      <BaseButton variant="secondary" @click="isListOpen = false">Later</BaseButton>
    </template>
  </Modal>

  <EunoSignModal
    v-if="active"
    v-model="isSignOpen"
    :signing-url="active.signing_url"
    :is-syncing="isSyncing"
    @sync="syncActive"
    @close="handleSignClose"
  />
</template>
