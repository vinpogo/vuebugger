<script setup lang="ts">
import { useTooltip } from '@vingy/vueltip'
import { useTemplateRef } from 'vue'

const tooltipElement = useTemplateRef('tooltipElement')
const arrowElement = useTemplateRef('arrowElement')

const { tooltipStyles, arrowStyles, show, content } =
  useTooltip({
    tooltipElement,
    arrowElement,
    offset: 8,
    padding: 8,
  })
</script>

<template>
  <div
    v-show="show"
    ref="tooltipElement"
    class="relative isolate"
    :style="[tooltipStyles]"
  >
    <div
      ref="arrowElement"
      class="pointer-events-none absolute z-0 bg-slate-100"
      :style="[arrowStyles]"
    />
    <div
      class="relative z-10 rounded bg-slate-100 px-2 py-1 text-sm font-semibold text-slate-900 shadow-lg"
    >
      {{ content?.text }}
    </div>
  </div>
</template>
