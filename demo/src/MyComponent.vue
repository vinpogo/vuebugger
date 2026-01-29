<script setup lang="ts">
import { useFoo } from './myComposable'

defineProps<{ label: string }>()

const { inc, dec } = useFoo()
</script>

<template>
  <div>{{ label }}</div>
  <button @click="inc">Inc</button>
  <button @click="dec">Dec</button>
</template>
