# Vuebugger

Vue devtools provide an easy way to inspect component state. But when having something like a composable, you actually need to catch all the returned values in order for them to show up in the devtools. This is where this package can come in handy.

## Features

- Debug composables and reactive state easily
- Tree-shakable with zero runtime overhead
- Simple API: just call `debug(name, state)`

## Quick start

```bash
pnpm add -D @vingy/vuebugger
```

Register the plugin in your app:

```ts
import Vuebugger from '@vingy/vuebugger'

createApp(App).use(Vuebugger)
```

## Usage

`debug()` registers values from composables so they show up in Vue Devtools.

```ts
import { debug } from '@vingy/vuebugger'

export const useFoo = (initial: number) => {
  const multiplier = ref(1) // not easy to debug if something goes wrong

  const inc = () => multiplier.value++
  const dec = () => multiplier.value--

  const value = computed(() => initial * multiplier)

  debug('useFoo', { multiplier }) // now visible in devtools

  return { value, inc, dec }
}
```

See the demo app in [demo/](demo).

> **Note:** This plugin is tree-shakable and has zero runtime overhead when `debug()` calls are not used.
