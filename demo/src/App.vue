<script setup lang="ts">
import { debug } from '@vingy/vuebugger'
import { ref } from 'vue'
import DialogDemo from './DialogDemo.vue'
import MyComponent from './MyComponent.vue'

const count = ref(0)

debug('foobar', { count })
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <div class="mx-auto max-w-5xl space-y-10 px-6 py-12">
      <header class="space-y-3">
        <div
          class="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300"
        >
          Vue Utilities Demo
        </div>
        <h1
          class="text-4xl font-bold tracking-tight text-white sm:text-5xl"
        >
          You did it!
        </h1>
        <p
          class="max-w-2xl text-base text-slate-300 sm:text-lg"
        >
          Try out Vuebugger and Vueltip with a simple
          counter, dynamic components, and tooltips.
        </p>
      </header>

      <section
        class="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg"
      >
        <div class="mb-6 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-white">
              Vuebugger
            </h2>
            <p class="text-sm text-slate-400">
              Check the Vue devtools panel for live state.
            </p>
          </div>
          <span
            class="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300"
          >
            Total: {{ count }}
          </span>
        </div>
        <div class="space-y-6">
          <div
            class="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4"
          >
            <div>
              <h3 class="text-sm font-semibold text-white">
                Counter
              </h3>
              <p class="text-xs text-slate-400">
                Manage items and see live updates.
              </p>
            </div>
            <div class="flex items-center gap-3">
              <button
                v-tooltip="'Add one item'"
                class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:from-sky-400 hover:to-indigo-400"
                @click="count++"
              >
                Add
              </button>
              <button
                v-tooltip="{
                  content: 'Remove one item',
                  placement: 'right',
                }"
                class="inline-flex items-center gap-2 rounded-lg border border-rose-500/60 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20"
                @click="count--"
              >
                Remove
              </button>
            </div>
          </div>
          <div>
            <div
              class="mb-3 flex items-center justify-between"
            >
              <h3 class="text-sm font-semibold text-white">
                Dynamic Components
              </h3>
            </div>
            <div
              v-if="count === 0"
              class="rounded-lg border border-dashed border-slate-700 bg-slate-900/40 px-4 py-6 text-center text-sm text-slate-400"
            >
              Add some items to see them below...
            </div>
            <div class="grid gap-3 sm:grid-cols-2">
              <MyComponent
                v-for="n in count"
                :key="n"
                :label="String(n)"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        class="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg"
      >
        <h2 class="mb-4 text-lg font-semibold text-white">
          Vueltip in Dialog
        </h2>
        <p class="mb-4 text-sm text-slate-400">
          Tooltips work seamlessly inside dialog elements.
        </p>
        <DialogDemo />
      </section>

      <section
        class="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg"
      >
        <h2 class="mb-4 text-lg font-semibold text-white">
          Vueltip
        </h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <p
            v-tooltip="'Simple text tooltip'"
            class="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-200 shadow-sm transition hover:border-slate-500"
          >
            Hover over me (top)
          </p>
          <p
            v-tooltip="{
              content: 'Bottom placement',
              placement: 'bottom',
            }"
            class="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-200 shadow-sm transition hover:border-slate-500"
          >
            Hover over me (bottom)
          </p>
          <p
            v-tooltip="{
              content: 'Left placement',
              placement: 'left',
            }"
            class="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-200 shadow-sm transition hover:border-slate-500"
          >
            Hover over me (left)
          </p>
          <p
            v-tooltip="{
              content: 'Right placement',
              placement: 'right',
            }"
            class="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-slate-200 shadow-sm transition hover:border-slate-500"
          >
            Hover over me (right)
          </p>
        </div>
        <div class="mt-6 space-y-3">
          <div>
            <h3 class="text-sm font-semibold text-white">
              Truncation-only tooltip
            </h3>
            <p class="text-xs text-slate-400">
              Resize the container: tooltip only appears
              when the text is truncated.
            </p>
          </div>
          <div
            class="relative inline-block w-80 min-w-[12rem] max-w-full overflow-auto rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-3"
            style="resize: horizontal"
          >
            <p
              v-tooltip="
                'This is a long line of text that only shows a tooltip when it gets truncated.'
              "
              class="truncate text-sm text-slate-200"
            >
              This is a long line of text that only shows a
              tooltip when it gets truncated.
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style>
@import 'tailwindcss';
</style>
