# Debugging Strategies

## Quick Reference: Debugging Tools

| Problem | Tool | Command |
|---------|------|---------|
| Test failing, don't know why | Vitest UI | `pnpm vitest --ui` |
| Specific test failing repeatedly | Run single file | `pnpm vitest --run src/file.test.ts` |
| Browser test not in browser env | Check file suffix | Must be `.browser.test.ts` |
| Browser test works, unit test fails | Separate envs | `.browser.test.ts` needs DOM, `.unit.test.ts` doesn't |
| Can't find error location | Terminal output | Scroll to top of output, check file:line |
| Listeners not attaching | Check console | Use spies: `vi.spyOn(el, 'addEventListener')` |
| State not updating | Add logs or debugger | `console.log()` or `debugger` in watch |
| Import cycle error | Check oxlint | `pnpm lint` - should show import/no-cycle |
| Code formatting issues | Format repo | `pnpm format` (oxfmt) |
| Multiple errors after change | Run tests | `pnpm test` to see what broke |

---

## Decision Tree

**Is the issue in tests or production code?**
- Tests failing? → [Debugging Tests](#debugging-tests)
- Production code? → [Debugging Runtime](#debugging-runtime)

**If tests failing, what type?**
- Unit test failing? → [Unit Test Debugging](#unit-test-debugging)
- Browser test failing? → [Browser Test Debugging](#browser-test-debugging)

**If runtime issue, where?**
- Listeners not firing? → [Listener Debugging](#listener-debugging)
- State not updating? → [State Debugging](#state-debugging)
- Component not rendering? → [Component Debugging](#component-debugging)

---

## Debugging Tests

### Start with Vitest UI

**Open interactive test runner:**
```bash
pnpm vitest --ui
```

This opens browser UI showing:
- All test files listed
- Pass/fail status
- Test output and errors
- Click to re-run specific tests
- View console.log output

**Best for:**
- Seeing which tests pass/fail at a glance
- Reading full error messages without terminal truncation
- Re-running individual tests quickly

### Unit Test Debugging

**File: `.unit.test.ts` (Node environment)**

**Problem: Logic test failing**

```typescript
// ❌ Test failing
it('upserts entry', () => {
  const entry = { uid: 'test', groupId: '1' }
  upsert(entry)

  expect(byUid.get('test')).toBe(entry)  // Fails here
})
```

**Step 1: Check actual value**
```typescript
it('upserts entry', () => {
  const entry = { uid: 'test', groupId: '1' }
  upsert(entry)

  // What's actually stored?
  console.log('byUid:', byUid)
  console.log('value:', byUid.get('test'))

  expect(byUid.get('test')).toBe(entry)
})
```

**Step 2: Run in UI, read output**
```bash
pnpm vitest --ui
# Click on failing test
# See console.log output at bottom
```

**Step 3: Verify setup/teardown**
```typescript
// ✅ ACCEPTABLE: Using beforeEach for global/singleton reset
beforeEach(() => {
  byUid.clear()  // Clear module-level singleton state
  byGroupId.clear()
})
```

Check [registry.unit.test.ts](../../packages/vuebugger/src/registry.unit.test.ts) for pattern

**Key point:** Vitest hooks are acceptable here because `byUid`/`byGroupId` are module-level singletons that need resetting between tests. For test-specific setup, use explicit functions inside each test (see [Testing Decisions](./testing-decisions.md)).

**Anti-pattern:**
- ❌ Not clearing state between tests
- ❌ Tests passing locally but failing in CI (state leaking)

### Browser Test Debugging

**File: `.browser.test.ts` (Browser environment with Playwright)**

**Problem: DOM interaction failing**

```typescript
// ❌ Test failing
it('adds listener', () => {
  const el = document.createElement('div')
  const spy = vi.spyOn(el, 'addEventListener')

  vueltipDirective.created(el, { value: 'text' } as any)

  expect(spy).toHaveBeenCalledWith('mouseenter', expect.any(Function))
})
```

**Step 1: Verify setup**
```typescript
const setupDirective = () => {
  const el = document.createElement('div')
  document.body.appendChild(el)  // Must append!
  setOptions({ keyAttribute: 'tooltip-key' })
  return el
}

it('adds listener', () => {
  const el = setupDirective()  // Use setup function
  const spy = vi.spyOn(el, 'addEventListener')

  vueltipDirective.created(el, { value: 'text' } as any)

  expect(spy).toHaveBeenCalledWith('mouseenter', expect.any(Function))
  teardownDirective(el)  // Clean up
})
```

**Step 2: Check file suffix**
- Must be `.browser.test.ts` (not `.unit.test.ts`)
- [vitest.config.ts](../../vitest.config.ts) routes by suffix

**Step 3: Run browser tests only**
```bash
pnpm vitest --run --project browser src/directive.browser.test.ts
```

**Step 4: Add console.log**
```typescript
it('adds listener', () => {
  const el = setupDirective()
  console.log('el:', el)
  console.log('el.addEventListener:', el.addEventListener)

  const spy = vi.spyOn(el, 'addEventListener')
  console.log('spy created:', spy)

  vueltipDirective.created(el, { value: 'text' } as any)
  console.log('spy called with:', spy.mock.calls)

  expect(spy).toHaveBeenCalledWith('mouseenter', expect.any(Function))
})
```

**Run with UI to see console output:**
```bash
pnpm vitest --ui
```

---

## Debugging Runtime

### Listener Debugging

**Problem: Event listener not firing**

**Checklist:**
1. Is listener attached to correct element?
2. Is the correct event type being listened for?
3. Are both add and remove using same handler reference?

**Debug in console (browser devtools):**

```javascript
// Get element
const el = document.querySelector('[tooltip-key]')

// Check listeners attached
getEventListeners(el)  // Chrome DevTools only
// Returns: { mouseenter: [...], mouseleave: [...] }

// Manually trigger event
el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))

// Check if handler fired
console.log('Handler fired?')  // Should see logs from listener
```

**Check with test spy:**
```typescript
it('attaches mouseenter listener', () => {
  const el = setupDirective()
  const spy = vi.spyOn(el, 'addEventListener')

  vueltipDirective.created(el, { value: 'text' } as any)

  expect(spy).toHaveBeenCalledWith(
    'mouseenter',
    expect.any(Function),
  )

  // Actually call the handler
  const [event, handler] = spy.mock.calls[0]
  if (typeof handler === 'function') {
    handler(new MouseEvent('mouseenter'))
  }

  // Check what happened after handler ran
  console.log('tooltipKey:', tooltipKey.value)

  teardownDirective(el)
})
```

See [directive.browser.test.ts](../../packages/vueltip/src/directive.browser.test.ts) for full patterns

**Anti-patterns:**
- ❌ Not using same handler reference for remove
- ❌ Creating inline handlers that can't be removed
- ❌ Listeners defined inside conditionals (not always added)

### State Debugging

**Problem: Reactive ref not updating**

**Scenario: `tooltipKey` not updating in [state.ts](../../packages/vueltip/src/state.ts)**

```typescript
// ❌ Not updating
const { hoveredElement } = useVueltip()
console.log('hoveredElement:', hoveredElement.value)  // undefined
// Expected something else
```

**Step 1: Check the watch dependencies**
```typescript
// state.ts
watch(
  [
    tooltipKey,
    hoveredElement,
    tooltipPlacement,
    () => getContent(tooltipKey.value ?? ''),
  ],
  ([key, el, placement]) => {
    // ... debounce logic
  },
)
```

**Step 2: Verify updates are happening**
```typescript
// In composable test
it('updates hovered element', () => {
  const { tooltipKey, hoveredElement } = useVueltip()

  console.log('Initial:', hoveredElement.value)  // undefined

  hoveredElement.value = el  // Update

  console.log('After update:', hoveredElement.value)  // Should be el
  expect(hoveredElement.value).toBe(el)
})
```

**Step 3: Check debounce timing**
```typescript
// state.ts has setTimeout delay
// Tests need to flush timers

import { vi } from 'vitest'

it('updates content after delay', async () => {
  hoveredElement.value = el

  // Flush pending timers
  vi.runAllTimers()  // or await new Promise(resolve => setTimeout(resolve, 0))

  expect(tooltipContent.value).toBeTruthy()
})
```

**Step 4: Use Vue DevTools**

Install [Vue DevTools](https://devtools.vuejs.org):

```bash
# Chrome/Edge extension or Firefox addon
# Open DevTools → Vue tab → Inspect component
```

Shows:
- All reactive refs in component
- Real-time updates as you interact
- Time-travel debugging

### Component Debugging

**Problem: Component not rendering**

**In demo app [demo/src/App.vue](../../demo/src/App.vue):**

```vue
<script setup>
import { vueltipDirective, useVueltip } from '@vingy/vueltip'
const { x, y, show } = useVueltip()
</script>

<template>
  <div v-tooltip="'text'">Hover me</div>
</template>
```

**Step 1: Check directive is registered**
```bash
# In browser console
const app = document.querySelector('#app').__vue_app__
console.log(app._context.directives)  // Should have vTooltip
```

**Step 2: Verify options are set**
```typescript
// plugin.ts should call setOptions
import { getOption } from '@vingy/vueltip'
console.log(getOption('showDelay'))  // Should be configured value
```

**Step 3: Check composable returns**
```vue
<script setup>
import { useVueltip } from '@vingy/vueltip'
const composable = useVueltip()
console.log('composable:', composable)  // Should have x, y, show
</script>
```

---

## Linting & Formatting Errors

### Import Cycle Detection

**Error in terminal:**
```
error: import/no-cycle
  ↳ cycle detected: a.ts → b.ts → a.ts
```

**Fix:**
1. Identify files in cycle
2. Move shared logic to third file
3. Both files import from shared

**Example:**
```typescript
// ❌ Cycle: state.ts ↔ listeners.ts
import { hoveredElement } from './state'  // listeners.ts
export const onMouseover = () => {
  hoveredElement.value = el
}

import { onMouseover } from './listeners'  // state.ts
watch(() => hoveredElement, onMouseover)
```

**Solution: Extract shared helpers**
```typescript
// shared-handlers.ts
export const handlers = {
  onMouseover: (el) => { /* ... */ }
}

// listeners.ts imports from shared
import { handlers } from './shared-handlers'

// state.ts imports from shared
import { handlers } from './shared-handlers'
```

### Code Format Issues

**Oxfmt rules (60 char width, single quotes, no semis):**

```bash
# Show formatting issues
pnpm lint

# Fix all issues
pnpm format
```

**Common issues:**
- ❌ Double quotes → Single quotes
- ❌ Semicolons at end of lines
- ❌ Long lines > 60 chars → Wrap

---

## Useful Commands

```bash
# Run all tests with detailed output
pnpm test

# Run single test file
pnpm vitest --run src/registry.unit.test.ts

# Run only unit tests (Node)
pnpm vitest --run --project unit

# Run only browser tests (Playwright)
pnpm vitest --run --project browser

# Open interactive test UI
pnpm vitest --ui

# Watch mode (re-run on file change)
pnpm vitest

# Check for lint errors
pnpm lint

# Format code
pnpm format

# Build packages
pnpm build

# Watch build
pnpm dev
```

---

## When to Use Each Strategy

| Situation | Strategy |
|-----------|----------|
| Test fails, no error message | Vitest UI + console.log |
| Listener not firing | Browser spy + manual trigger |
| State not updating | Check watch deps + add logging |
| Component not rendering | Vue DevTools + check registration |
| Import cycle error | Use `pnpm lint` to find, extract shared |
| Format issues | Run `pnpm format` automatically |
| Multiple failures | `pnpm test` first to get overview |
