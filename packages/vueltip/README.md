# Vueltip

A headless tooltip component for Vue.js.

## Features

- **Dynamic Visibility**: The tooltip does not display when the tooltip text is identical to the element's content, unless the content is truncated.
- **Single Tooltip Instance**: A single tooltip is used, which is repositioned within the window as needed.
- **Headless Design**: Fully customizable; bring your own component(s) for rendering.

## Quick Start

To install Vueltip, use npm or yarn:

```bash
pnpm add vueltip
```

Register the tooltip in your app:

```ts
import Vueltip from 'vueltip'

createApp(App).use(Vueltip)
```

## Usage

### 1. Create a Tooltip Component

First, create a tooltip component using the \`useTooltip\` composable:

```ts
<!-- Tooltip.vue -->
<template>
  <div
    ref="tooltipElement"
    v-show="show"
    :style="tooltipStyles"
    class="tooltip"
  >
    {{ content }}
    <div
      ref="arrowElement"
      :style="arrowStyles"
      class="tooltip-arrow"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTooltip } from 'vueltip'

const tooltipElement = ref()
const arrowElement = ref()

const { tooltipStyles, arrowStyles, show, content } =
  useTooltip({
    tooltipElement,
    arrowElement,
    offset: 8,
    padding: 8,
    arrowSize: 10,
  })
</script>

<style scoped>
.tooltip {
  background: #333;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  z-index: 9999;
}

.tooltip-arrow {
  background: #333;
}
</style>
```

### 2. Register in Your App

Import and register the tooltip component and plugin in your app's entry point:

```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import Vueltip from 'vueltip'
import Tooltip from './components/Tooltip.vue'

const app = createApp(App)

app.use(Vueltip, {
  component: Tooltip,
})

app.mount('#app')
```

### 3. Use the Directive

Now you can use the `v-tooltip` directive on any element:

```ts
<template>
  <div>
    <button v-tooltip="{ text: 'Click me to submit' }">
      Submit
    </button>

    <input
      v-tooltip="{ text: 'Enter your email address' }"
      type="email"
      placeholder="Email"
    />

    <span v-tooltip="{ text: 'This is a helpful tooltip' }">
      Hover over me
    </span>
  </div>
</template>
```
