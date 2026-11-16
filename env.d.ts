/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}


interface ImportMetaEnv {
  /** Google Maps JavaScript API key for the "Location on the Map" step (optional; without it a basic embedded map is shown) */
  readonly VITE_GOOGLE_MAPS_API_KEY?: string
}
