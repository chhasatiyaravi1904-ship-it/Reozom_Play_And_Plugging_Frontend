<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

/**
 * Google Map for the locked "Location on the Map" step.
 * - With VITE_GOOGLE_MAPS_API_KEY: interactive map; click or drag the pin to set latitude/longitude.
 * - Without a key: Google Maps embed that follows the coordinates (or the address), plus manual inputs.
 */
const props = defineProps<{
  latitude?: string | number | null
  longitude?: string | number | null
  address?: string
  readonly?: boolean
  errors?: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'update', latitude: string, longitude: string): void
}>()

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined
const mapEl = ref<HTMLDivElement | null>(null)
const loadError = ref('')
const isLocating = ref(false)

let map: any = null
let marker: any = null

const lat = computed(() => toNumber(props.latitude))
const lng = computed(() => toNumber(props.longitude))
const hasPin = computed(() => lat.value !== null && lng.value !== null)

// Center of the USA when nothing is known yet
const DEFAULT_CENTER = { lat: 39.8283, lng: -98.5795 }

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

const embedUrl = computed(() => {
  const query = hasPin.value ? `${lat.value},${lng.value}` : (props.address || 'United States')
  const zoom = hasPin.value ? 17 : props.address ? 15 : 4
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=${zoom}&output=embed`
})

function setPin(newLat: number, newLng: number) {
  emit('update', newLat.toFixed(6), newLng.toFixed(6))
}

let scriptPromise: Promise<void> | null = null
function loadGoogleMaps(key: string): Promise<void> {
  const w = window as any
  if (w.google?.maps) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptPromise = null
      reject(new Error('Google Maps could not be loaded.'))
    }
    document.head.appendChild(script)
  })
  return scriptPromise
}

function placeMarker(position: { lat: number; lng: number }) {
  const g = (window as any).google
  if (!marker) {
    marker = new g.maps.Marker({ position, map, draggable: !props.readonly })
    marker.addListener('dragend', (e: any) => setPin(e.latLng.lat(), e.latLng.lng()))
  } else {
    marker.setPosition(position)
  }
}

function geocodeAddress() {
  const g = (window as any).google
  if (!props.address || !g?.maps?.Geocoder) return
  isLocating.value = true
  new g.maps.Geocoder().geocode({ address: props.address }, (results: any[], status: string) => {
    isLocating.value = false
    if (status !== 'OK' || !results?.[0]) return
    const loc = results[0].geometry.location
    map.setCenter(loc)
    map.setZoom(17)
    // Only pre-fill the pin when the seller has not placed one yet
    if (!hasPin.value) setPin(loc.lat(), loc.lng())
  })
}

async function initInteractiveMap() {
  if (!apiKey || !mapEl.value) return
  try {
    await loadGoogleMaps(apiKey)
  } catch (e: any) {
    loadError.value = e?.message || 'Google Maps could not be loaded.'
    return
  }

  const g = (window as any).google
  map = new g.maps.Map(mapEl.value, {
    center: hasPin.value ? { lat: lat.value!, lng: lng.value! } : DEFAULT_CENTER,
    zoom: hasPin.value ? 17 : 4,
    mapTypeControl: true,
    streetViewControl: false,
  })

  if (hasPin.value) {
    placeMarker({ lat: lat.value!, lng: lng.value! })
  } else {
    geocodeAddress()
  }

  if (!props.readonly) {
    map.addListener('click', (e: any) => setPin(e.latLng.lat(), e.latLng.lng()))
  }
}

// Keep the marker in sync when coordinates change (map click, drag or typing)
watch([lat, lng], () => {
  if (!map || !hasPin.value) return
  placeMarker({ lat: lat.value!, lng: lng.value! })
})

function onInput(which: 'lat' | 'lng', event: Event) {
  const value = (event.target as HTMLInputElement).value
  emit('update', which === 'lat' ? value : String(props.latitude ?? ''), which === 'lng' ? value : String(props.longitude ?? ''))
}

function useMyLocation() {
  if (!navigator.geolocation) return
  isLocating.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      isLocating.value = false
      setPin(pos.coords.latitude, pos.coords.longitude)
      map?.setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      map?.setZoom(17)
    },
    () => { isLocating.value = false },
  )
}

onMounted(initInteractiveMap)
onBeforeUnmount(() => {
  marker?.setMap?.(null)
  marker = null
  map = null
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="text-body-md font-body-md text-on-surface-variant">
      <template v-if="apiKey && !loadError">Click on the map or drag the pin to the exact property location.</template>
      <template v-else>Check the property location on the map. Enter or adjust the coordinates below if needed.</template>
    </p>

    <div class="relative overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container" style="height: 420px">
      <div v-if="apiKey && !loadError" ref="mapEl" class="absolute inset-0"></div>
      <iframe
        v-else
        :src="embedUrl"
        title="Property location map"
        class="absolute inset-0 h-full w-full border-0"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      ></iframe>
      <div v-if="isLocating" class="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs shadow">Finding location...</div>
    </div>

    <p v-if="loadError" class="text-xs text-red-700">{{ loadError }} Showing a basic map instead.</p>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
      <label class="flex flex-col gap-1">
        <span class="text-label-md font-label-md text-primary">Latitude <span class="text-red-600">*</span></span>
        <input
          id="latitude"
          name="latitude"
          type="text"
          inputmode="decimal"
          :value="latitude ?? ''"
          :readonly="readonly"
          placeholder="e.g. 42.280800"
          class="h-11 rounded-lg border px-3 text-sm"
          :class="errors?.latitude ? 'border-red-400' : 'border-outline-variant'"
          @input="onInput('lat', $event)"
        />
        <span v-if="errors?.latitude" class="text-xs text-red-700">{{ errors.latitude }}</span>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-label-md font-label-md text-primary">Longitude <span class="text-red-600">*</span></span>
        <input
          id="longitude"
          name="longitude"
          type="text"
          inputmode="decimal"
          :value="longitude ?? ''"
          :readonly="readonly"
          placeholder="e.g. -83.743000"
          class="h-11 rounded-lg border px-3 text-sm"
          :class="errors?.longitude ? 'border-red-400' : 'border-outline-variant'"
          @input="onInput('lng', $event)"
        />
        <span v-if="errors?.longitude" class="text-xs text-red-700">{{ errors.longitude }}</span>
      </label>
      <button
        v-if="!readonly"
        type="button"
        class="h-11 rounded-lg border border-outline-variant px-4 text-sm hover:bg-surface-container"
        @click="useMyLocation"
      >
        Use my location
      </button>
    </div>
  </div>
</template>
