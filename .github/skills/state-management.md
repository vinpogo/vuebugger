# State Management

## Quick Reference: When to Use Each

| Need | Pattern | Cleanup | Example |
|------|---------|---------|---------|
| Track entries app-wide | Module Map | `onScopeDispose` + `remove()` | `byUid`, `byGroupId` |
| Reactive state in templates | Module refs | None needed | `hoveredElement`, `contentMap` |
| Auto-cleanup watchers | `getCurrentScope() ?? effectScope()` | `onScopeDispose` | Vuebugger `debug()` |
| Event listeners | Directive hooks | `beforeUnmount` | Vueltip `created`/`beforeUnmount` |
| Debounce rapid updates | `watch` + `setTimeout` | `clearTimeout` | Tooltip show/hide delay |
| Type-safe event handlers | Wrapper functions | None (stored ref) | `ensureEventTarget()` |
| App configuration | Getter functions | None | `getOption()`, `setOptions()` |

---

## Decision Tree

**Do you need to track state across the entire app?**
- Yes → **Module-level singleton** (Map or ref at module level)
- No → Local reactive state (composable or component)

**If using module-level state, is it Vue-reactive?**
- Yes (needs reactivity in templates) → **Module-level refs** (See Vueltip [state.ts](../../packages/vueltip/src/state.ts))
- No (just tracking data) → **Module-level Maps** (See Vuebugger [registry.ts](../../packages/vuebugger/src/registry.ts))

**Do you need automatic cleanup?**
- Yes, inside a composable → **`onScopeDispose()`** (auto-cleanup on unmount)
- Yes, in a directive → **Directive hooks** (`created`/`beforeUnmount`)
- No → No cleanup needed

**Do you need to debounce rapid updates?**
- Yes → **`watch()` + `setTimeout`** with `clearTimeout` pattern
- No → Direct state updates

---

## Patterns & Implementation

### Pattern 1: Module-level Map (Non-reactive Tracking)

**Use for:** App-wide entry tracking that doesn't need Vue reactivity

**Example:** [Vuebugger Registry](../../packages/vuebugger/src/registry.ts)

```typescript
export const byUid = new Map<
  VuebuggerEntry['uid'],
  VuebuggerEntry
>()
export const byGroupId = new Map<
  VuebuggerEntry['groupId'],
  Set<VuebuggerEntry['uid']>
>()

const upsertInternal = (entry: VuebuggerEntry) => {
  byUid.set(entry.uid, entry)
  const group = byGroupId.get(entry.groupId)
  if (!group) byGroupId.set(entry.groupId, new Set([entry.uid]))
  else group.add(entry.uid)
}

export const remove = (entry: VuebuggerEntry) => {
  const { uid, groupId } = entry
  byUid.delete(uid)
  const group = byGroupId.get(groupId)
  group?.delete(uid)
  if (group?.size === 0) byGroupId.delete(groupId)
}

// Callback pattern for listeners
const callbacks: ((entry: VuebuggerEntry) => void)[] = []
const runCallbacks = (entry: VuebuggerEntry) =>
  callbacks.forEach((cb) => cb(entry))
const withCallbacks =
  (fn: (entry: VuebuggerEntry) => void) =>
  (entry: VuebuggerEntry) => {
    fn(entry)
    runCallbacks(entry)
  }

export const upsert = withCallbacks(upsertInternal)

export const onUpdate = (
  fn: (entry: VuebuggerEntry) => void,
) => {
  callbacks.push(fn)
}
```

**Cleanup:** Not needed for Map itself, but track when entries are created and call `remove()` via `onScopeDispose()`

**Use with:** Callback pattern for listeners (`onUpdate()`, `onRemove()`), or scope-aware cleanup

---

### Pattern 2: Module-level Refs (Vue-reactive State)

**Use for:** State that needs to be reactive in templates/watchers

**Example:** [Vueltip State](../../packages/vueltip/src/state.ts)

```typescript
export const hoveredElement = ref<Maybe<HTMLElement>>()

// Keep Map internal - only export accessors
const contentMap = ref(new Map<string, Content>())

// Getter function
export const getContent = (key: string) =>
  contentMap.value.get(key)

// Setter function
export const setContent = (key: string, value: Content) =>
  contentMap.value.set(key, value)

export const deleteContent = (key: string) =>
  contentMap.value.delete(key)
```

**Cleanup:** Not needed for refs themselves. Refs auto-update when mounted/unmounted.

**Use with:** `watch()` to respond to changes, composables to bind to UI

**Critical:**
- Keep Map internal (not exported), expose only getter/setter functions
- Use `ref(new Map(...))` for reactive Map, then `.value.set/get/delete`
- Watch debounces rapid state changes (see Pattern 5)

---

### Pattern 3: Scope-aware Cleanup (Composables)

**Use for:** Registering watchers/listeners that auto-cleanup on component unmount

**When:** Tracking state change inside a composable or component setup

**Example:** [Vuebugger debug.ts](../../packages/vuebugger/src/debug.ts)

```typescript
const scope = getCurrentScope() ?? effectScope()
scope.run(() => {
  onScopeDispose(() => remove(entry))
  watch(() => state, (value) => upsert(entry), { deep: true })
})
```

**Critical:**
- `getCurrentScope()` returns active scope inside composable/setup
- `?? effectScope()` creates manual scope if called standalone
- Everything in `scope.run()` auto-disposes when scope ends (component unmount)
- Do NOT manually call cleanup functions; `onScopeDispose` handles it

**Anti-pattern:**
- ❌ Calling `remove()` directly in setup without scope—it won't cleanup

---

### Pattern 4: Directive Lifecycle Cleanup

**Use for:** Event listeners in directives

**When:** `created` hook → add listeners, `beforeUnmount` hook → remove listeners

**Example:** [Vueltip directive.ts](../../packages/vueltip/src/directive.ts)

```typescript
export const vueltipDirective = {
  created: (el, binding) => {
    el.addEventListener('mouseenter', onMouseover)
    el.addEventListener('focus', onMouseover)
  },
  beforeUnmount: (el) => {
    el.removeEventListener('mouseenter', onMouseover)
    el.removeEventListener('focus', onMouseover)
  },
}
```

**Critical:**
- Store handler reference before adding; can't use inline functions
- Use same function for add/remove
- Must remove ALL listeners added in `created`

**Anti-patterns:**
- ❌ Inline handlers `() => onMouseover()`
- ❌ Forgetting to remove listeners

---

### Pattern 5: Debouncing State Changes

**Use for:** Rate-limiting rapid state updates (show/hide delays)

**When:** Multiple rapid triggers should batch into one update

**Example:** [Vueltip state.ts](../../packages/vueltip/src/state.ts)

```typescript
let timerId: Maybe<ReturnType<typeof setTimeout>>

watch([tooltipKey, hoveredElement], () => {
  if (timerId) clearTimeout(timerId)  // Cancel previous
  timerId = setTimeout(() => {
    tooltipContent.value = getContent(key)
    timerId = undefined
  }, timeout)
})
```

**Critical:**
- Always `clearTimeout()` before setting new timeout
- Reset `timerId` after firing to detect next change
- Use `watch()` array for batching related triggers

**Anti-patterns:**
- ❌ Setting timeout without clearing previous one (stacks timers)
- ❌ Not resetting `timerId` after firing

---

## Additional Patterns

### Pattern 6: Event Handler Wrapper (Listeners)

**Use for:** Event handlers that need type guards and state access

**Example:** [Vueltip listeners.ts](../../packages/vueltip/src/listeners.ts)

```typescript
// Higher-order function that ensures HTMLElement
const ensureEventTarget =
  (fn: (target: HTMLElement) => void) =>
  (event: MouseEvent | FocusEvent) => {
    const { target } = event
    if (!target || !isHtmlElement(target)) {
      return
    }
    fn(target)
  }

// Handler that accesses module-level state
export const onMouseover = ensureEventTarget((target) => {
  ensureKey(target, (key) => {
    const content = getContent(key)
    if (!content) return

    // Update reactive state
    tooltipKey.value = key
    hoveredElement.value = target
  })
})
```

**Critical:**
- Type guards at wrapper level (avoid null checks in every handler)
- Store as module-level const (reuse same reference)
- Access reactive state inside
- Never use inline functions as event listeners

---

### Pattern 7: Configuration Getters (Options)

**Use for:** Centralized app configuration

**Example:** [Vueltip options.ts](../../packages/vueltip/src/options.ts)

```typescript
import type { Options } from './types'

let options: Options = {
  placementAttribute: 'vueltip-placement',
  keyAttribute: 'vueltip-key',
  showDelay: 0,
  hideDelay: 200,
}

export const setOptions = (opts?: Partial<Options>) => {
  options = { ...options, ...opts }
}

export const getOption = <T extends keyof Options>(
  key: T,
): Options[T] => options[key]
```

**Critical:**
- Provide typed getter: `getOption('showDelay')` returns `number`
- Merge partial options: `{ ...defaults, ...provided }`
- Keep internal: don't export `options` directly
- Use in composables/directives to access config

**Anti-patterns:**
- ❌ Direct module-level `options` export
- ❌ Untyped getters that return `any`
