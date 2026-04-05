# Testing Decisions

## Test Type

- DOM or browser APIs involved → `.browser.test.ts`
- Everything else → `.unit.test.ts`

Co-locate test files next to source. One file per environment. Never mix.

## No Vitest Hooks

Use explicit setup/teardown functions instead of `beforeEach`/`afterEach`.

```ts
const setup = () => {
  const el = document.createElement('div')
  document.body.appendChild(el)
  return el
}

const teardown = (el: HTMLElement) => {
  el.remove()
  resetState()
}

it('does something', () => {
  const el = setup()
  // ...
  teardown(el)
})
```

## Running Tests

```bash
mise run test                                              # all
mise exec -- pnpm vitest --run --project unit             # unit only
mise exec -- pnpm vitest --run --project browser          # browser only
mise exec -- pnpm vitest --run src/my.unit.test.ts        # single file
```
