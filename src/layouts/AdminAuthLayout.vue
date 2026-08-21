<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Building2, CheckCircle2, ClipboardList, MapPinned, ShieldCheck } from 'lucide-vue-next'
import ToastContainer from '@/components/ui/ToastContainer.vue'

withDefaults(
  defineProps<{
    quote?: string
    quoteDescription?: string
  }>(),
  {
    quote: 'Configure listing workflows, county/MLS routing, and disclosures — all in one place.',
    quoteDescription: 'Built for platform admins, brokers, and agents.',
  },
)
</script>

<template>
  <div class="grid min-h-screen grid-cols-1 md:grid-cols-[45%_55%]">
    <div class="flex flex-col justify-center px-6 py-12 sm:px-10 md:px-10 lg:px-16">
      <div class="mx-auto w-full max-w-[420px]">
        <div class="mb-8 flex items-center gap-3">
          <span
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white"
          >
            R
          </span>
          <div class="leading-tight">
            <p class="text-lg font-bold tracking-tight text-fg">REOZOM</p>
            <p class="text-xs text-fg-muted">Admin Portal</p>
          </div>
        </div>

        <div
          class="mb-6 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase"
        >
          <ShieldCheck class="h-3.5 w-3.5" />
          Secure Admin Portal
        </div>

        <RouterView />
      </div>
    </div>

    <div
      class="relative hidden overflow-hidden border-l border-border md:block"
      style="background: linear-gradient(160deg, #eaf7f4 0%, #ddf1ec 100%)"
    >
      <div
        class="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
      ></div>
      <div
        class="pointer-events-none absolute bottom-0 -left-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
      ></div>

      <div class="relative flex h-full flex-col justify-center px-10 py-12 lg:px-16">
        <div class="relative mb-16 hidden h-36 lg:block">
          <div
            class="absolute top-0 left-0 flex items-center gap-2 rounded-xl border border-border/60 bg-surface/90 px-3.5 py-2.5 shadow-lg backdrop-blur-sm"
          >
            <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Building2 class="h-4 w-4" />
            </span>
            <span class="text-sm font-medium text-fg whitespace-nowrap">127 Active Listings</span>
          </div>

          <div
            class="absolute top-8 right-0 flex items-center gap-2 rounded-xl border border-border/60 bg-surface/90 px-3.5 py-2.5 shadow-lg backdrop-blur-sm"
          >
            <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-warning-soft text-warning">
              <ClipboardList class="h-4 w-4" />
            </span>
            <span class="text-sm font-medium text-fg whitespace-nowrap">24 Pending Reviews</span>
          </div>

          <div
            class="absolute bottom-2 left-6 flex items-center gap-2 rounded-xl border border-border/60 bg-surface/90 px-3.5 py-2.5 shadow-lg backdrop-blur-sm"
          >
            <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-success-soft text-success">
              <CheckCircle2 class="h-4 w-4" />
            </span>
            <span class="text-sm font-medium text-fg whitespace-nowrap">MLS Connected</span>
          </div>

          <div
            class="absolute right-4 bottom-0 flex items-center gap-2 rounded-xl border border-border/60 bg-surface/90 px-3.5 py-2.5 shadow-lg backdrop-blur-sm"
          >
            <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-info-soft text-info">
              <MapPinned class="h-4 w-4" />
            </span>
            <span class="text-sm font-medium text-fg whitespace-nowrap">County Routing</span>
          </div>
        </div>

        <blockquote class="max-w-md text-2xl leading-snug font-semibold text-fg">
          {{ quote }}
        </blockquote>
        <p class="mt-4 text-sm text-fg-muted">{{ quoteDescription }}</p>
      </div>
    </div>

    <ToastContainer />
  </div>
</template>
