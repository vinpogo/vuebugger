# Testing Decisions

## Quick Reference

| Scenario | Test Type | Environment | Example |
|----------|-----------|-------------|---------|
| State updates, Map operations, logic | `.unit.test.ts` | Node | `registry.unit.test.ts` |
| DOM interaction, event listeners, styles | `.browser.test.ts` | Browser | `directive.browser.test.ts` |
| Composable returns, reactive refs | `.unit.test.ts` | Node | `state.unit.test.ts` |
| Component mounting, DOM queries | `.browser.test.ts` | Browser | `listeners.browser.test.ts` |

---

## Decision Tree

**Are you testing DOM interaction or user events?**
- Yes → **`.browser.test.ts`** (Browser environment with `document`, `HTMLElement`)
- No → **`.unit.test.ts`** (Node environment)

**Specific scenarios:**

| What You're Testing | Test Type | Why |
|---|---|---|
| State updates, Map operations, logic | `.unit.test.ts` | No DOM needed, Node is faster |
| DOM interaction, event listeners, DOM attributes | `.browser.test.ts` | Must have real DOM |
| Composable returns, reactive refs (no DOM) | `.unit.test.ts` | Just returning values |
| Component mounting, DOM queries, styling | `.browser.test.ts` | Needs browser APIs |
| Vue directives lifecycle | `.browser.test.ts` | Directive hooks need DOM context |

---

## Implementation

### Test File Location & Naming

Co-locate test files adjacent to source:

```
src/
  my-feature.ts
  my-feature.unit.test.ts      # Node environment
  my-feature.browser.test.ts    # Browser environment
```

**Rule:** One test file per environment. Don't mix unit + browser in one file.

### Setup & Teardown Pattern

**Always use explicit functions, never vitest hooks:**

```typescript
// ✅ Explicit setup function
const setupTest = () => {
  const el = document.createElement('div')
  document.body.appendChild(el)
  setOptions({ ... })
  return el
}

// ✅ Explicit teardown function
const teardownTest = (el: HTMLElement) => {
  el.remove()
  resetState()
}

// ✅ Use in each test
it('does something', () => {
  const el = setupTest()
  // ... test code
  teardownTest(el)
})

// ❌ Don't do this
beforeEach(() => { ... })
afterEach(() => { ... })
```

### Unit Tests (`.unit.test.ts`)

**Environment:** Node (no browser APIs)

**Examples from codebase:**
- [registry.unit.test.ts](../../packages/vuebugger/src/registry.unit.test.ts) - Map upsert/remove logic
- [devtools.unit.test.ts](../../packages/vuebugger/src/devtools.unit.test.ts) - Devtools API calls
- [state.unit.test.ts](../../packages/vueltip/src/state.unit.test.ts) - Reactive state updates

**What to test:**
- Pure function returns
- Ref/reactive state changes
- Map operations (add, remove, get)
- Callback execution
- Logic branches

**Anti-patterns:**
- ❌ Using `document`, `HTMLElement`, `querySelector`
- ❌ Adding/removing event listeners
- ❌ Testing DOM attributes or styles
- ❌ Mocking browser APIs
- ❌ Using vitest hooks (`beforeEach`, `afterEach`) - prefer explicit setup/cleanup functions

**Correct pattern:**
```typescript
// ✅ Unit test - logic only
it('adds entry to map', () => {
  const entry = { uid: '1', data: {} }
  upsert(entry)
  expect(byUid.get('1')).toBe(entry)
})

// ✅ Explicit cleanup - no hooks
it('removes entry from map', () => {
  const entry = { uid: '1', data: {} }
  upsert(entry)
  remove(entry)
  expect(byUid.get('1')).toBeUndefined()
})

// ❌ Don't do this in unit tests
it('renders element', () => {
  const el = document.createElement('div')
  // This is a browser test
})
```

### Browser Tests (`.browser.test.ts`)

**Environment:** Browser (Playwright runs in Chromium)

**Examples from codebase:**
- [directive.browser.test.ts](../../packages/vueltip/src/directive.browser.test.ts) - Directive lifecycle, DOM attributes
- [listeners.browser.test.ts](../../packages/vueltip/src/listeners.browser.test.ts) - Event listener handling
- [utils.browser.test.ts](../../packages/vueltip/src/utils.browser.test.ts) - DOM utility functions

**What to test:**
- Event listener attachment/removal
- DOM attributes or classes
- Element visibility/styling
- Directive hooks firing
- User interactions (click, hover, focus)
- DOM queries and traversal

**Anti-patterns:**
- ❌ Testing pure logic that doesn't need DOM
- ❌ Excessive DOM setup (use unit tests for logic)
- ❌ Not cleaning up event listeners (leads to test leaks)
- ❌ Using vitest hooks (`beforeEach`, `afterEach`) - prefer explicit setup/cleanup functions

**Correct pattern:**
```typescript
// ✅ Browser test - DOM interaction
it('adds listener on created hook', () => {
  const el = document.createElement('div')
  const spy = vi.spyOn(el, 'addEventListener')
  vueltipDirective.created(el, { value: 'text' })
  expect(spy).toHaveBeenCalledWith('mouseenter', expect.any(Function))
})

// ✅ Explicit cleanup - no hooks
it('removes listeners on unmount', () => {
  const el = document.createElement('div')
  const removeSpy = vi.spyOn(el, 'removeEventListener')
  vueltipDirective.created(el, { value: 'text' })
  vueltipDirective.beforeUnmount(el)
  expect(removeSpy).toHaveBeenCalledWith('mouseenter', expect.any(Function))
})

// ✅ Explicit setup/teardown with helper functions
const setupDirective = () => {
  const el = document.createElement('div')
  document.body.appendChild(el)
  setOptions({ keyAttribute: 'tooltip-key' })
  return el
}

const teardownDirective = (el: HTMLElement) => {
  el.remove()
}

it('test with setup/teardown', () => {
  const el = setupDirective()
  vueltipDirective.created(el, { value: 'text' })
  expect(el.getAttribute('tooltip-key')).toBeTruthy()
  teardownDirective(el)
})
```

---

## Running Tests

```bash
pnpm test --run                     # All tests (unit + browser)
pnpm vitest --ui                    # Interactive UI for debugging
pnpm vitest --run --project unit    # Only unit tests
pnpm vitest --run --project browser # Only browser tests
pnpm vitest --run src/my.unit.test.ts  # Single test file
```

**Debugging failing tests:**
```bash
pnpm vitest --ui                    # Open UI, click failing test, see output
```

See [vitest.config.ts](../../vitest.config.ts) for configuration.
