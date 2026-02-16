<script setup lang="ts">
import { debug } from '@vingy/vuebugger'
import { ref } from 'vue'
import MyComponent from './MyComponent.vue'

const count = ref(0)

debug('foobar', { count })
</script>

<template>
  <h1>You did it!</h1>
  <button @click="count++">Add</button>
  <button @click="count--">Remove</button>
  <MyComponent
    v-for="n in count"
    :key="n"
    :label="String(n)"
  />
</template>

<style scoped></style>
