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
import { vueltipPlugin, vueltipDirective } from 'vueltip'

createApp(App)
  .use(vueltipPlugin, { component: Tooltip })
  .directive('tooltip', vueltipDirective)
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
import { useTemplateRef } from 'vue'
import { useVueltip } from 'vueltip'

const tooltipElement = useTemplateRef('tooltipElement')
const arrowElement = useTemplateRef('arrowElement')

const { tooltipStyles, arrowStyles, show, content } =
  useVueltip({
    tooltipElement,
    arrowElement,
    offset: 8,
    padding: 8,
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
import { vueltipPlugin, vueltipDirective } from 'vueltip'
import Tooltip from './components/Tooltip.vue'

const app = createApp(App)

app
  .use(vueltipPlugin, {
    component: Tooltip,
  })
  .directive('tooltip', vueltipDirective)

app.mount('#app')
```

### 3. Use the Directive

Now you can use the `v-tooltip` directive on any element:

```vue
<template>
  <div>
    <button v-tooltip="'Click me to submit'">Submit</button>

    <input
      v-tooltip="'Enter your email address'"
      type="email"
      placeholder="Email"
    />

    <span
      v-tooltip="{
        content: 'This is a helpful tooltip',
        placement: 'right',
      }"
    >
      Hover over me
    </span>
  </div>
</template>
```

See the demo app in [demo/](../../demo/).

## Options

### Plugin Options

The `vueltipPlugin` accepts the following options:

| Option                     | Type                             | Default               | Description                                                                                                            |
| -------------------------- | -------------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `component`                | `Component`                      | Required              | The Vue component to render as the tooltip                                                                             |
| `showDelay`                | `number`                         | `0`                   | Delay in milliseconds before the tooltip appears on hover                                                              |
| `hideDelay`                | `number`                         | `200`                 | Delay in milliseconds before the tooltip disappears when the cursor leaves                                             |
| `defaultPlacement`         | `Placement`                      | `'top'`               | Default tooltip placement: `'top'`, `'bottom'`, `'left'`, `'right'`, etc.                                              |
| `defaultTruncateDetection` | `'x' \| 'y' \| 'both' \| 'none'` | `'both'`              | Direction(s) to check for text truncation (`'x'` for horizontal, `'y'` for vertical, `'both'`, or `'none'` to disable) |
| `handleDialogModals`       | `boolean`                        | `false`               | Whether to handle tooltips within HTML `<dialog>` elements with the `open` attribute (modal dialogs)                   |
| `placementAttribute`       | `string`                         | `'vueltip-placement'` | HTML attribute name for tooltip placement overrides                                                                    |
| `keyAttribute`             | `string`                         | `'vueltip-key'`       | HTML attribute name for tooltip identification                                                                         |
| `truncateAttribute`        | `string`                         | `'vueltip-truncate'`  | HTML attribute name for truncate detection overrides                                                                   |

### useVueltip Composable Options

The `useVueltip` composable accepts the following options:

| Option            | Type                       | Default  | Description                                                |
| ----------------- | -------------------------- | -------- | ---------------------------------------------------------- |
| `tooltipElement`  | `Ref<HTMLElement \| null>` | Required | Reference to the tooltip container element                 |
| `arrowElement`    | `Ref<HTMLElement \| null>` | Optional | Reference to the arrow element for positioning             |
| `offset`          | `number`                   | `0`      | Offset distance between the tooltip and the target element |
| `padding`         | `number`                   | `0`      | Padding between the tooltip and the viewport edges         |
| `arrowSize`       | `number`                   | `0`      | Size of the arrow element (used for proper positioning)    |
| `floatingOptions` | `UseFloatingOptions`       | `{}`     | Advanced options for the underlying Floating UI library    |

### Directive Options

The `v-tooltip` directive accepts bindings in two formats:

**Simple string (text only):**

```ts
v-tooltip="'Tooltip text'"
```

**Object with options:**

```ts
v-tooltip="{
  content: 'Tooltip text',
  placement: 'right'  // Placement: 'top', 'bottom', 'left', 'right', etc.
}"
```
