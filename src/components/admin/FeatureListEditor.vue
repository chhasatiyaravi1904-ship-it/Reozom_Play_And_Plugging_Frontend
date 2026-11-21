<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowDown, ArrowUp, Check, Plus, X } from 'lucide-vue-next'

/**
 * Editable list of short lines shown on the website's plan cards
 * ("Included" with a check, "Not included" with a cross). Order is the display order.
 */
const props = withDefaults(
  defineProps<{
    modelValue: string[]
    label: string
    tone?: 'included' | 'excluded'
    placeholder?: string
    max?: number
    maxLength?: number
  }>(),
  { tone: 'included', placeholder: 'Type an item and press Enter', max: 20, maxLength: 150 },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const draft = ref('')
const message = ref('')
const isFull = computed(() => props.modelValue.length >= props.max)

function add() {
  const text = draft.value.trim()
  message.value = ''
  if (!text) return
  if (isFull.value) {
    message.value = `Up to ${props.max} items.`
    return
  }
  if (props.modelValue.some((item) => item.toLowerCase() === text.toLowerCase())) {
    message.value = 'This item is already in the list.'
    return
  }
  emit('update:modelValue', [...props.modelValue, text])
  draft.value = ''
}

function remove(index: number) {
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== index))
}

function move(index: number, delta: -1 | 1) {
  const target = index + delta
  if (target < 0 || target >= props.modelValue.length) return
  const next = [...props.modelValue]
  ;[next[index], next[target]] = [next[target]!, next[index]!]
  emit('update:modelValue', next)
}
</script>

<template>
  <div>
    <div class="mb-1.5 flex items-center justify-between">
      <label class="block text-xs font-semibold text-fg">{{ label }}</label>
      <span class="text-[11px] text-fg-muted">{{ modelValue.length }}/{{ max }}</span>
    </div>

    <ul v-if="modelValue.length" class="mb-2 divide-y divide-border rounded-lg border border-border">
      <li v-for="(item, index) in modelValue" :key="item" class="flex items-center gap-2 px-2.5 py-1.5">
        <Check v-if="tone === 'included'" class="h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
        <X v-else class="h-3.5 w-3.5 shrink-0 text-fg-muted" aria-hidden="true" />
        <span class="min-w-0 flex-1 truncate text-xs text-fg" :title="item">{{ item }}</span>
        <button
          type="button"
          class="focus-ring rounded p-1 text-fg-muted hover:text-fg disabled:opacity-30"
          :disabled="index === 0"
          :aria-label="`Move ${item} up`"
          @click="move(index, -1)"
        >
          <ArrowUp class="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          class="focus-ring rounded p-1 text-fg-muted hover:text-fg disabled:opacity-30"
          :disabled="index === modelValue.length - 1"
          :aria-label="`Move ${item} down`"
          @click="move(index, 1)"
        >
          <ArrowDown class="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          class="focus-ring rounded p-1 text-fg-muted hover:text-danger"
          :aria-label="`Remove ${item}`"
          @click="remove(index)"
        >
          <X class="h-3.5 w-3.5" />
        </button>
      </li>
    </ul>

    <div class="flex gap-2">
      <input
        v-model="draft"
        type="text"
        :maxlength="maxLength"
        :placeholder="placeholder"
        :disabled="isFull"
        class="focus-ring h-9 min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 text-xs text-fg shadow-xs placeholder:text-fg-disabled disabled:opacity-60"
        :aria-label="`Add to ${label}`"
        @keydown.enter.prevent="add"
      />
      <button
        type="button"
        class="focus-ring inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-fg shadow-xs hover:bg-surface-raised disabled:opacity-50"
        :disabled="isFull || !draft.trim()"
        @click="add"
      >
        <Plus class="h-3.5 w-3.5" />
        Add
      </button>
    </div>
    <p v-if="message" class="mt-1 text-[11px] text-danger" role="alert">{{ message }}</p>
  </div>
</template>
