# Testing Decisions

There are 2 different test types available unit tests `.unit.test.ts`, and browser tests `.browser.test.ts`.

## When to use what test type?

`.browser.test.ts` are to be used whenever the code in question relies on either the DOM or some browser APIs. In any other case `.unit.test.ts` should be used.


## Styleguide

### Test File Location & Naming

Co-locate test files adjacent to source:

```
src/
  my-feature.ts
  my-feature.unit.test.ts      # Node environment
  my-feature.browser.test.ts    # Browser environment
```

**Rule:** One test file per environment. Don't mix unit + browser in one file.

### Always use explicit functions, never vitest hooks

Vitest hooks make it harder to read tests. Instead, extract the hooks content into functions which are called within the tests.

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

## Running Tests

```bash
pnpm test --run                     # All tests (unit + browser)
pnpm vitest --run --project unit    # Only unit tests
pnpm vitest --run --project browser # Only browser tests
pnpm vitest --run src/my.unit.test.ts  # Single test file
```

## Documentation

See [vitest.config.ts](../../vitest.config.ts) for configuration.
