<script setup lang="ts">
import { useFoo } from './myComposable'

defineProps<{ label: string }>()

const { inc, dec } = useFoo()
</script>

<template>
  <div
    class="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm"
  >
    <div class="flex items-center justify-between">
      <div>
        <p
          class="text-xs font-semibold uppercase tracking-wide text-slate-400"
        >
          Item
        </p>
        <p class="text-lg font-semibold text-white">
          {{ label }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-slate-500"
          @click="dec"
        >
          -
        </button>
        <button
          class="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-900 transition hover:bg-white"
          @click="inc"
        >
          +
        </button>
      </div>
    </div>
  </div>
</template>
