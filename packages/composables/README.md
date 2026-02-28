# Composables

A collection of Vue composables for managing optimistic updates.

## Features

- Apply local patches to state while preserving them when server updates arrive
- Automatic cleanup of redundant patches that match server state
- Immutable updates powered by [Mutative](https://mutative.js.org/)

## Quick Start

```bash
pnpm add @vingy/composables
```

## Usage

### `usePatches`

Manage optimistic updates that automatically clean up when server data arrives.

```ts
import { usePatches } from '@vingy/composables'

const { data, patch, reset } = usePatches({
  count: 0,
  name: 'John',
})

// Apply optimistic update
patch((draft) => {
  draft.count++
})

// When server update arrives, matching patches are removed
data.value = serverResponse

// Or reset all patches manually
reset()
```

**Returns:**

- `data` - Reactive state with patches applied
- `patches` - Current patches (readonly)
- `patch(fn)` - Add optimistic update
- `removePatch(fn)` - Remove specific patch
- `reset()` - Clear all patches
