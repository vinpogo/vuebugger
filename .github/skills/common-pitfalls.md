# Common Pitfalls

## Quick Reference: Critical Mistakes

| Pitfall | Impact | Prevention |
|---------|--------|-----------|
| Inline event listeners | Listeners not removed on unmount | Store handler as const, reuse same reference |
| Forgetting to remove listeners | Memory leaks, test failures | Always pair `addEventListener` + `removeEventListener` |
| Exporting internal state | Breaks encapsulation, API instability | Only export from index.ts, keep internals private |
| Direct Map/ref access | No reactivity tracking | Use getter/setter functions for refs |
| No cleanup in composables | Memory leaks on unmount | Use `onScopeDispose()` for auto-cleanup |
| Import cycles | Build failures | Check `.oxlintrc.json` enforces `import/no-cycle` |
| Mixing test environments | Tests fail in wrong environment | Use `.unit.test.ts` or `.browser.test.ts` suffix |
| Overusing vitest hooks for setup | Implicit dependencies, hidden failures | Use hooks only for global/singleton reset; keep test-specific setup inline in each test |
| Multiple timers stacking | Race conditions, doubled effects | Always `clearTimeout()` before setting new one |
| Inline functions in event listeners | Handlers created on every render | Store as module-level const, reference it |

---

## Detailed Pitfalls & Fixes

### Pitfall 1: Inline Event Listeners

**Problem:** Event listeners created inline can't be removed because there's no reference.

```typescript
// ❌ WRONG - Can't remove this listener
el.addEventListener('mouseenter', () => {
  console.log('entered')
})

// On unmount - which function do we remove?
el.removeEventListener('mouseenter', () => {
  console.log('entered')
})  // Doesn't match! New function instance
```

**Solution:** Store handler as module-level const

```typescript
// ✅ CORRECT - Store reference
const onMouseenter = () => {
  console.log('entered')
}

// Add listener
el.addEventListener('mouseenter', onMouseenter)

// Remove listener - same reference
el.removeEventListener('mouseenter', onMouseenter)
```

**In directives:**

```typescript
export const vueltipDirective = {
  created: (el, binding) => {
    // Store reference for removal
    el.addEventListener('mouseenter', onMouseover)  // onMouseover is stored const
    el.addEventListener('mouseleave', onMouseout)
  },
  beforeUnmount: (el) => {
    // Remove same reference
    el.removeEventListener('mouseenter', onMouseover)
    el.removeEventListener('mouseleave', onMouseout)
  },
}
```

**Where to define handlers:** [listeners.ts](../../packages/vueltip/src/listeners.ts) - module-level, not inside hooks

---

### Pitfall 2: Forgetting to Remove Listeners

**Problem:** Listeners accumulate, tests fail, memory leaks in production.

```typescript
// ❌ WRONG - No cleanup
it('attaches listener', () => {
  const el = document.createElement('div')
  el.addEventListener('mouseenter', onMouseover)
  // End of test - listener still attached
  // If you run 100 tests, 100 listeners still attached
})
```

**Solution:** Always pair add/remove

```typescript
// ✅ CORRECT - Explicit cleanup
const setupDirective = () => {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return el
}

const teardownDirective = (el: HTMLElement) => {
  el.removeEventListener('mouseenter', onMouseover)
  el.removeEventListener('mouseleave', onMouseout)
  el.remove()
}

it('attaches listener', () => {
  const el = setupDirective()
  el.addEventListener('mouseenter', onMouseover)
  expect(el.addEventListener).toHaveBeenCalled()
  teardownDirective(el)  // Clean up!
})
```

**Critical:** Check [directive.browser.test.ts](../../packages/vueltip/src/directive.browser.test.ts) for complete removal test:

```typescript
it('removes event listeners', () => {
  const el = setupDirective()
  const binding = { value: 'Text' }
  vueltipDirective.created?.(el, binding as any)

  const removeEventListenerSpy = vi.spyOn(
    el,
    'removeEventListener',
  )

  vueltipDirective.beforeUnmount?.(el)

  expect(removeEventListenerSpy).toHaveBeenCalledWith(
    'mouseenter',
    expect.any(Function),
  )
  // ... more expectations
  teardownDirective(el)
})
```

---

### Pitfall 3: Exporting Internal State

**Problem:** Exports infrastructure as public API, breaks when refactored

```typescript
// ❌ WRONG - Exports internals
export { byUid, upsert, remove } from './registry'
export { hoveredElement, setContent } from './state'
export { getOption } from './options'

// Users import internals directly:
// import { byUid } from '@vingy/vueltip'  // Now you can't change registry!
```

**Solution:** Only export public API from [index.ts](../../packages/vueltip/src/index.ts)

```typescript
// ✅ CORRECT - Public API only
export { useVueltip } from './composables'
export { vueltipDirective } from './directive'
export { setOptions } from './options'
export { vueltipPlugin } from './plugin'
export type { Content } from './types'

// Keep internal, don't export:
// - hoveredElement, setContent (state.ts - internal)
// - getOption (options.ts - internal)
// - onMouseover, onMouseout (listeners.ts - internal)
// - byUid, byGroupId (registry.ts - internal)
```

**Consequence:** Breaking changes are internal-only, you can refactor freely

---

### Pitfall 4: Direct Map/Ref Access vs Getters/Setters

**Problem:** Direct access loses reactivity tracking and type safety

```typescript
// ❌ WRONG - Direct ref access
export const contentMap = ref(new Map<string, Content>())

// Users do this:
contentMap.value.set(key, content)  // Direct mutation
contentMap.value.delete(key)

// Problems:
// 1. Not obvious API
// 2. Can't add validation
// 3. Breaks if you refactor to computed
```

**Solution:** Export getters/setters, keep Map internal

```typescript
// ✅ CORRECT - Public interface, private implementation
const contentMap = ref(new Map<string, Content>())

export const getContent = (key: string) =>
  contentMap.value.get(key)

export const setContent = (key: string, value: Content) =>
  contentMap.value.set(key, value)

export const deleteContent = (key: string) =>
  contentMap.value.delete(key)

// Users do this - clear API:
setContent(key, content)
deleteContent(key)
```

**Benefits:**
- Can add validation in setters
- Can refactor Map → computed without breaking users
- Type-safe access

---

### Pitfall 5: No Cleanup in Composables

**Problem:** Watchers/listeners not cleaned up on component unmount

```typescript
// ❌ WRONG - No cleanup, memory leaks
export const debug = (state: any) => {
  watch(
    () => state,
    (value) => {
      upsert({ ...entry, debugState: value })
    },
    { deep: true },
  )
  // Watch never removed when component unmounts!
}
```

**Solution:** Use scope-aware cleanup

```typescript
// ✅ CORRECT - Auto-cleanup with scope
export const debug = (state: any) => {
  const scope = getCurrentScope() ?? effectScope()
  scope.run(() => {
    onScopeDispose(() => remove(entry))  // Auto-cleanup
    watch(
      () => state,
      (value) => {
        upsert({ ...entry, debugState: value })
      },
      { deep: true },
    )
  })
  return entry
}
```

**Pattern:**
- `getCurrentScope()` inside composable → active scope
- `?? effectScope()` standalone → manual scope
- Everything in `scope.run()` auto-disposes on unmount
- `onScopeDispose()` runs cleanup automatically

---

### Pitfall 6: Import Cycles

**Problem:** Circular imports cause build failures

```typescript
// ❌ WRONG - Circular import
// state.ts imports from listeners.ts
// listeners.ts imports from state.ts
// Build fails

import { onMouseover } from './listeners'  // state.ts
export const hoveredElement = ref(null)

import { hoveredElement } from './state'   // listeners.ts
export const onMouseover = () => {
  hoveredElement.value = element
}
```

**Solution:** Check linter enforces rules

```bash
pnpm lint
# oxlint will catch: import/no-cycle: error
```

**Prevention:**
- Check [.oxlintrc.json](../../.oxlintrc.json) has `import/no-cycle: error`
- Run `pnpm lint` before committing
- Break cycles by extracting shared utilities to new file

---

### Pitfall 7: Mixing Test Environments

**Problem:** DOM tests fail in Node environment, logic tests too slow in Browser

```typescript
// ❌ WRONG - Mixed in one file
it('updates state', () => {
  const state = { count: 0 }
  state.count++
  expect(state.count).toBe(1)  // Should be unit test (Node)
})

it('adds listener', () => {
  const el = document.createElement('div')  // DOM needs Browser environment
  el.addEventListener('click', () => {})    // But same file!
})
```

**Solution:** Use correct file suffix

```typescript
// ✅ CORRECT - Separate by environment

// state.unit.test.ts (Node environment)
it('updates state', () => {
  const state = { count: 0 }
  state.count++
  expect(state.count).toBe(1)
})

// directive.browser.test.ts (Browser environment)
it('adds listener', () => {
  const el = document.createElement('div')
  el.addEventListener('click', () => {})
  expect(el.addEventListener).toHaveBeenCalled()
})
```

**Vitest projects in [vitest.config.ts](../../vitest.config.ts):**
- `.unit.test.ts` → Node environment
- `.browser.test.ts` → Browser environment (Playwright)

Run specific environment:
```bash
pnpm vitest --run --project unit    # Only Node
pnpm vitest --run --project browser # Only Browser
```

---

### Pitfall 8: Using Vitest Hooks for Setup/Teardown

**Problem:** Hidden dependencies, unclear test flow, implicit state sharing

```typescript
// ❌ WRONG - Vitest hooks hide setup
beforeEach(() => {
  el = document.createElement('div')
  setOptions({ keyAttribute: 'tooltip-key' })
})

afterEach(() => {
  el.remove()
})

it('test 1', () => {
  // El created by beforeEach - not obvious
  vueltipDirective.created(el, binding as any)
  expect(el.getAttribute('tooltip-key')).toBeTruthy()
})

// Problem: Test depends on beforeEach - not visible unless you scroll up
// Problem: Test fails if afterEach doesn't run (race condition)
```

**Solution:** Explicit setup/teardown functions

```typescript
// ✅ CORRECT - Explicit functions, clear dependencies
const setupDirective = () => {
  const el = document.createElement('div')
  document.body.appendChild(el)
  setOptions({ keyAttribute: 'tooltip-key' })
  return el
}

const teardownDirective = (el: HTMLElement) => {
  el.remove()
}

it('test 1', () => {
  const el = setupDirective()  // Clear: setup happens here
  vueltipDirective.created(el, binding as any)
  expect(el.getAttribute('tooltip-key')).toBeTruthy()
  teardownDirective(el)  // Clear: cleanup happens here
})
```

**Benefits:**
- Test is self-contained and readable
- Setup/teardown visible in every test
- Each test is independent (no hidden state)

See [testing-decisions.md](./testing-decisions.md) for full pattern.

---

### Pitfall 9: Multiple Timers Stacking

**Problem:** Setting multiple timeouts without clearing previous ones

```typescript
// ❌ WRONG - Timers accumulate
let timerId: Maybe<ReturnType<typeof setTimeout>>

watch(hoveredElement, () => {
  timerId = setTimeout(() => {
    tooltipContent.value = getContent(key)
  }, 200)
  // Previous timer still running! Sets timer twice, executes twice
})
```

**Solution:** Clear before setting new timeout

```typescript
// ✅ CORRECT - Always clear first
let timerId: Maybe<ReturnType<typeof setTimeout>>

watch(hoveredElement, () => {
  if (timerId) {
    clearTimeout(timerId)  // Cancel previous
  }
  timerId = setTimeout(() => {
    tooltipContent.value = getContent(key)
    timerId = undefined  // Reset after firing
  }, 200)
})
```

**Critical:** Reset `timerId = undefined` after firing so next watch detects change

---

### Pitfall 10: Export Cycles

**Problem:** Public exports that create circular dependencies

```typescript
// ❌ WRONG - Can't refactor without breaking users
// index.ts exports everything
export { byUid, upsert } from './registry'
export { hoveredElement, getContent } from './state'

// Users import internals
import { byUid, getContent } from '@vingy/package'

// Now if you want to move registry to different file, users break
```

**Solution:** Export only stable public API

```typescript
// ✅ CORRECT - Minimal, stable public API
export { useVueltip } from './composables'
export { vueltipDirective } from './directive'
export { setOptions } from './options'
export type { Content } from './types'

// Internal state/registry stay private
// You can refactor internals freely
```
