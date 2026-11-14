<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import {
  PenTool,
  Type,
  RotateCcw,
  Check,
  ShieldCheck,
  AlertCircle,
  FileCheck,
} from 'lucide-vue-next'
import Modal from '@/components/ui/Modal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

interface Props {
  modelValue: boolean
  title?: string
  documentLabel?: string
  defaultSignerName?: string
  unsignedCount?: number
  isPacketSign?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Electronic Signature Studio',
  documentLabel: 'Statutory Document',
  defaultSignerName: '',
  unsignedCount: 1,
  isPacketSign: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (
    e: 'confirm',
    payload: {
      signer_name: string
      signature_image: string
      signature_type: 'drawn' | 'typed'
      initials_image?: string
      apply_all: boolean
      legal_consent: boolean
    },
  ): void
}>()

const activeTab = ref<'draw' | 'type'>('draw')
const signerName = ref(props.defaultSignerName)
const initials = ref('')
const inkColor = ref('#003366') // Legal standard navy
const inkThickness = ref(2.5)
const applyToAll = ref(props.isPacketSign || props.unsignedCount > 1)
const legalConsent = ref(true)

// Handwriting fonts for Type mode
const fontOptions = [
  { id: 'caveat', name: 'Caveat (Natural Hand)', font: "'Caveat', cursive", size: '36px' },
  { id: 'great_vibes', name: 'Great Vibes (Formal Calligraphy)', font: "'Great Vibes', cursive", size: '32px' },
  { id: 'dancing_script', name: 'Dancing Script (Fluid Casual)', font: "'Dancing Script', cursive", size: '32px' },
  { id: 'alex_brush', name: 'Alex Brush (Classic Script)', font: "'Alex Brush', cursive", size: '34px' },
]
const selectedFontId = ref('caveat')
const selectedFont = computed(
  () => fontOptions.find((f) => f.id === selectedFontId.value) || fontOptions[0],
)

// Canvas state
const canvasRef = ref<HTMLCanvasElement | null>(null)
const isDrawing = ref(false)
const hasDrawn = ref(false)
let ctx: CanvasRenderingContext2D | null = null

// Auto-derive initials from name
watch(
  signerName,
  (val) => {
    if (!val) {
      initials.value = ''
      return
    }
    const parts = val.trim().split(/\s+/)
    if (parts.length === 1) {
      initials.value = parts[0].slice(0, 2).toUpperCase()
    } else {
      initials.value = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
  },
  { immediate: true },
)

watch(
  () => props.defaultSignerName,
  (val) => {
    if (val && !signerName.value) {
      signerName.value = val
    }
  },
)

watch(
  () => props.modelValue,
  async (isOpen) => {
    if (isOpen) {
      if (props.defaultSignerName && !signerName.value) {
        signerName.value = props.defaultSignerName
      }
      applyToAll.value = props.isPacketSign || props.unsignedCount > 1
      await nextTick()
      initCanvas()
    }
  },
)

function initCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  ctx = canvas.getContext('2d')
  if (!ctx) return

  // Set high-DPI scaling
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx.scale(dpr, dpr)

  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = inkColor.value
  ctx.lineWidth = inkThickness.value
  hasDrawn.value = false
}

function clearCanvas() {
  const canvas = canvasRef.value
  if (!canvas || !ctx) return
  const dpr = window.devicePixelRatio || 1
  ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)
  hasDrawn.value = false
}

function getPointerPos(e: MouseEvent | TouchEvent) {
  const canvas = canvasRef.value
  if (!canvas) return { x: 0, y: 0 }
  const rect = canvas.getBoundingClientRect()
  if ('touches' in e) {
    const touch = e.touches[0] || e.changedTouches[0]
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    }
  }
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  }
}

function startDrawing(e: MouseEvent | TouchEvent) {
  if (!ctx) return
  isDrawing.value = true
  hasDrawn.value = true
  const pos = getPointerPos(e)
  ctx.beginPath()
  ctx.moveTo(pos.x, pos.y)
  ctx.strokeStyle = inkColor.value
  ctx.lineWidth = inkThickness.value
}

function draw(e: MouseEvent | TouchEvent) {
  if (!isDrawing.value || !ctx) return
  e.preventDefault()
  const pos = getPointerPos(e)
  ctx.lineTo(pos.x, pos.y)
  ctx.stroke()
}

function stopDrawing() {
  if (!isDrawing.value || !ctx) return
  isDrawing.value = false
  ctx.closePath()
}

// Generate typed signature image using an offscreen canvas
function generateTypedSignatureDataUrl(text: string, fontCss: string, color: string): string {
  const offscreen = document.createElement('canvas')
  offscreen.width = 600
  offscreen.height = 150
  const offCtx = offscreen.getContext('2d')
  if (!offCtx) return ''

  offCtx.clearRect(0, 0, 600, 150)
  offCtx.fillStyle = color
  offCtx.font = fontCss
  offCtx.textBaseline = 'middle'
  offCtx.fillText(text, 20, 75)

  return offscreen.toDataURL('image/png')
}

// Check validity
const canConfirm = computed(() => {
  if (!signerName.value.trim()) return false
  if (!legalConsent.value) return false
  if (activeTab.value === 'draw') {
    return hasDrawn.value
  }
  return true
})

function handleConfirm() {
  if (!canConfirm.value) return

  let signatureDataUrl = ''
  if (activeTab.value === 'draw' && canvasRef.value) {
    signatureDataUrl = canvasRef.value.toDataURL('image/png')
  } else {
    signatureDataUrl = generateTypedSignatureDataUrl(
      signerName.value.trim(),
      `bold ${selectedFont.value.size} ${selectedFont.value.font}`,
      inkColor.value,
    )
  }

  // Generate initials image as well
  const initialsDataUrl = generateTypedSignatureDataUrl(
    initials.value.trim() || signerName.value.slice(0, 2).toUpperCase(),
    `bold 28px ${selectedFont.value.font}`,
    inkColor.value,
  )

  emit('confirm', {
    signer_name: signerName.value.trim(),
    signature_image: signatureDataUrl,
    signature_type: activeTab.value,
    initials_image: initialsDataUrl,
    apply_all: applyToAll.value,
    legal_consent: legalConsent.value,
  })

  emit('update:modelValue', false)
}
</script>

<template>
  <Modal
    :model-value="modelValue"
    size="lg"
    :title="title"
    @update:model-value="(val) => emit('update:modelValue', val)"
  >
    <div class="space-y-5">
      <!-- Target document banner -->
      <div class="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-3.5">
        <div class="flex items-center gap-3">
          <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
            <FileCheck class="h-5 w-5" />
          </div>
          <div>
            <div class="text-xs font-semibold uppercase tracking-wider text-primary">Document to Execute</div>
            <div class="text-sm font-semibold text-fg">
              {{ isPacketSign ? `Full Statutory Disclosures Packet (${unsignedCount} Documents)` : documentLabel }}
            </div>
          </div>
        </div>
        <div class="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full">
          <ShieldCheck class="h-3.5 w-3.5" />
          UETA & ESIGN Certified
        </div>
      </div>

      <!-- Legal name & initials inputs -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div class="sm:col-span-3">
          <label class="block text-xs font-bold uppercase tracking-wider text-fg-muted mb-1">
            Full Legal Signer Name *
          </label>
          <input
            v-model="signerName"
            type="text"
            placeholder="e.g. Jane M. Doe"
            class="w-full rounded-lg border border-border bg-bg px-3.5 py-2 text-sm font-semibold text-fg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-fg-muted mb-1">
            Legal Initials
          </label>
          <input
            v-model="initials"
            type="text"
            maxlength="4"
            placeholder="e.g. JD"
            class="w-full rounded-lg border border-border bg-bg px-3.5 py-2 text-center text-sm font-bold uppercase text-fg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>
      </div>

      <!-- Tabs: Draw vs Type -->
      <div>
        <div class="flex border-b border-border">
          <button
            type="button"
            class="flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors"
            :class="
              activeTab === 'draw'
                ? 'border-primary text-primary'
                : 'border-transparent text-fg-muted hover:text-fg'
            "
            @click="activeTab = 'draw'"
          >
            <PenTool class="h-4 w-4" />
            Draw Signature (Pad)
          </button>
          <button
            type="button"
            class="flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors"
            :class="
              activeTab === 'type'
                ? 'border-primary text-primary'
                : 'border-transparent text-fg-muted hover:text-fg'
            "
            @click="activeTab = 'type'"
          >
            <Type class="h-4 w-4" />
            Type Calligraphy Signature
          </button>
        </div>

        <!-- DRAW TAB CONTENT -->
        <div v-show="activeTab === 'draw'" class="mt-4 space-y-3">
          <div class="flex items-center justify-between text-xs text-fg-muted">
            <span class="font-medium">Draw your handwritten signature using mouse, stylus, or touch.</span>
            <div class="flex items-center gap-3">
              <!-- Ink Color -->
              <div class="flex items-center gap-1.5">
                <span class="text-[11px] font-semibold text-fg-muted">Ink:</span>
                <button
                  type="button"
                  title="Official Navy Blue"
                  class="h-5 w-5 rounded-full border border-border transition-transform"
                  :class="inkColor === '#003366' ? 'ring-2 ring-primary scale-110' : ''"
                  style="background-color: #003366;"
                  @click="inkColor = '#003366'"
                />
                <button
                  type="button"
                  title="Executive Black"
                  class="h-5 w-5 rounded-full border border-border transition-transform"
                  :class="inkColor === '#0f172a' ? 'ring-2 ring-primary scale-110' : ''"
                  style="background-color: #0f172a;"
                  @click="inkColor = '#0f172a'"
                />
              </div>

              <!-- Clear Pad -->
              <button
                type="button"
                class="inline-flex items-center gap-1 font-semibold text-danger hover:underline"
                @click="clearCanvas"
              >
                <RotateCcw class="h-3 w-3" />
                Clear
              </button>
            </div>
          </div>

          <!-- Drawing Canvas Container -->
          <div class="relative overflow-hidden rounded-xl border-2 border-dashed border-border bg-white shadow-inner">
            <canvas
              ref="canvasRef"
              class="h-44 w-full cursor-crosshair touch-none"
              @mousedown="startDrawing"
              @mousemove="draw"
              @mouseup="stopDrawing"
              @mouseleave="stopDrawing"
              @touchstart="startDrawing"
              @touchmove="draw"
              @touchend="stopDrawing"
            />
            <!-- Signature baseline guide -->
            <div
              v-if="!hasDrawn"
              class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-xs text-fg-muted/60"
            >
              <PenTool class="h-6 w-6 mb-1 text-fg-muted/40" />
              <span>Click or tap here to sign above line</span>
            </div>
            <div class="pointer-events-none absolute bottom-5 left-8 right-8 border-b border-border/80 flex items-center justify-between text-[10px] text-fg-muted/50 pb-1 font-mono">
              <span>&#10005; Sign Here</span>
              <span>Reozom Secure Sign™</span>
            </div>
          </div>
        </div>

        <!-- TYPE TAB CONTENT -->
        <div v-show="activeTab === 'type'" class="mt-4 space-y-3">
          <div class="text-xs text-fg-muted font-medium">
            Choose a signature calligraphy style for your electronic execution:
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="opt in fontOptions"
              :key="opt.id"
              class="cursor-pointer rounded-xl border p-3.5 transition-all"
              :class="
                selectedFontId === opt.id
                  ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm'
                  : 'border-border bg-bg hover:border-fg-muted'
              "
              @click="selectedFontId = opt.id"
            >
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[11px] font-semibold text-fg-muted">{{ opt.name }}</span>
                <span v-if="selectedFontId === opt.id" class="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white text-[10px]">
                  <Check class="h-3 w-3" />
                </span>
              </div>
              <div
                class="overflow-hidden text-ellipsis whitespace-nowrap py-1"
                :style="{
                  fontFamily: opt.font,
                  fontSize: opt.size,
                  color: inkColor,
                }"
              >
                {{ signerName || 'Jane M. Doe' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Scope Checkbox & Legal Acknowledgment -->
      <div class="space-y-2.5 rounded-xl border border-border bg-bg-muted/30 p-3.5">
        <label
          v-if="!isPacketSign && unsignedCount > 1"
          class="flex items-start gap-2.5 cursor-pointer text-xs font-semibold text-fg"
        >
          <input
            v-model="applyToAll"
            type="checkbox"
            class="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <span>
            Apply this electronic signature to all
            <strong class="text-primary">{{ unsignedCount }} statutory disclosures</strong> for this listing (Sign All Packet).
          </span>
        </label>

        <label class="flex items-start gap-2.5 cursor-pointer text-xs text-fg-muted">
          <input
            v-model="legalConsent"
            type="checkbox"
            class="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <span>
            I acknowledge that my electronic signature and initials are legally binding and enforceable under the federal
            <strong class="text-fg">E-SIGN Act (15 U.S.C. § 7001)</strong> and the
            <strong class="text-fg">Uniform Electronic Transactions Act (UETA)</strong>.
          </span>
        </label>
      </div>

      <!-- Footer Buttons -->
      <div class="flex items-center justify-between pt-2 border-t border-border">
        <BaseButton variant="secondary" @click="emit('update:modelValue', false)">
          Cancel
        </BaseButton>

        <BaseButton
          variant="primary"
          :disabled="!canConfirm"
          @click="handleConfirm"
        >
          <ShieldCheck class="mr-2 h-4 w-4" />
          {{ applyToAll ? `Adopt & Sign All (${unsignedCount})` : 'Adopt & Sign Document' }}
        </BaseButton>
      </div>
    </div>
  </Modal>
</template>

